import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Papa from "https://esm.sh/papaparse";
import { supabase } from "@/supabase-client";
import * as C from "@/column-indices";

interface reqPayload {
  csvText: string;
  fileName: string;
}

console.info('server started');

// --- CORS Headers ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins for development
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', // Add other methods as needed
};

// --- Anomaly Thresholds (Configurable) ---
const ERROR_THRESHOLD_RAD = 0.5;
const CURRENT_THRESHOLD_AMPS = 5.0;
const TEMP_THRESHOLD_CELSIUS = 40.0;
const FORCE_THRESHOLD_NEWTONS = 10.0;

// --- Data Sampling (for charts) ---
const MAX_CHART_POINTS = 1000;

Deno.serve(async (req: Request) => {
  console.log("Function invoked with request:", req);

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request.");
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { csvText, fileName }: reqPayload = await req.json();
    console.log("Parsed request body:", { fileName });

    // 2. Parse CSV text
    console.log("Parsing CSV text...");
    const parseResult = Papa.parse(csvText, {
      skipEmptyLines: true,
      dynamicTyping: true, // Converts numbers automatically
    });
    console.log("CSV parsed successfully.");

    const rows: (number[])[] = parseResult.data.slice(1); // Skip header row
    const rowCount = rows.length;
    if (rowCount === 0) throw new Error("No data rows found in CSV.");
    console.log(`Found ${rowCount} rows in CSV.`);

    // --- 3. Initialize Data Structures ---

    // KPIs
    let kpi_max_following_error = { value: 0, joint: -1, time: 0 };
    let kpi_peak_current = { value: 0, joint: -1, time: 0 };
    let kpi_peak_temp = { value: 0, joint: -1, time: 0 };
    let kpi_peak_tcp_force = { value: 0, axis: "x", time: 0 };

    // Anomaly Log
    const anomalies: any[] = [];

    // Time Series (omitted for brevity, same as previous version)
    const ts_tcp_path = [];
    const ts_tcp_orientation = { time: [], rx: [], ry: [], rz: [] };
    const ts_following_error = { time: [], j1: [], j2: [], j3: [], j4: [], j5: [], j6: [] };
    const ts_target_position = { time: [], j1: [], j2: [], j3: [], j4: [], j5: [], j6: [] };
    const ts_actual_position = { time: [], j1: [], j2: [], j3: [], j4: [], j5: [], j6: [] };
    const ts_tcp_force = { time: [], fx: [], fy: [], fz: [] };
    const ts_tcp_torque = { time: [], tx: [], ty: [], tz: [] };
    const ts_target_torque = { time: [], j1: [], j2: [], j3: [], j4: [], j5: [], j6: [] };
    const ts_target_acceleration = { time: [], j1: [], j2: [], j3: [], j4: [], j5: [], j6: [] };
    const ts_actual_current = { time: [], j1: [], j2: [], j3: [], j4: [], j5: [], j6: [] };
    const ts_target_current = { time: [], j1: [], j2: [], j3: [], j4: [], j5: [], j6: [] };
    const ts_control_current = { time: [], j1: [], j2: [], j3: [], j4: [], j5: [], j6: [] };
    const ts_joint_temps = { time: [], j1: [], j2: [], j3: [], j4: [], j5: [], j6: [] };


    // --- 4. Process All Rows ---
    console.log("Processing rows...");
    const step = Math.max(1, Math.floor(rowCount / MAX_CHART_POINTS));
    
    for (let i = 0; i < rowCount; i++) {
      const row = rows[i];
      if (!row || row.length < 73) continue; // Skip bad rows
      
      const time = row[C.COL_TIME];

      // --- Process KPIs and Anomalies (Run on every row) ---
      
      // Check Following Error
      for (let j = 0; j < 6; j++) {
        const error = Math.abs(row[C.A_POS[j]] - row[C.T_POS[j]]);
        if (error > kpi_max_following_error.value) {
          kpi_max_following_error = { value: error, joint: j + 1, time: time };
        }
        if (error > ERROR_THRESHOLD_RAD && i % step === 0) { // Only log anomalies on sampled steps to avoid spam
          anomalies.push({ time, type: "High Following Error", joint: j + 1, details: `Error was ${error.toFixed(2)} rad` });
        }
      }

      // Check Current
      for (let j = 0; j < 6; j++) {
        const current = Math.abs(row[C.A_CUR[j]]);
        if (current > kpi_peak_current.value) {
          kpi_peak_current = { value: current, joint: j + 1, time: time };
        }
        if (current > CURRENT_THRESHOLD_AMPS && i % step === 0) {
          anomalies.push({ time, type: "Current Spike", joint: j + 1, details: `Current was ${current.toFixed(2)} A` });
        }
      }

      // Check Temps
      for (let j = 0; j < 6; j++) {
        const temp = row[C.TEMPS[j]];
        if (temp > kpi_peak_temp.value) {
          kpi_peak_temp = { value: temp, joint: j + 1, time: time };
        }
        if (temp > TEMP_THRESHOLD_CELSIUS && i % step === 0) {
          anomalies.push({ time, type: "High Temperature", joint: j + 1, details: `Temp was ${temp.toFixed(1)} °C` });
        }
      }

      // Check TCP Force
      const forces = [Math.abs(row[C.TCP_FORCE[0]]), Math.abs(row[C.TCP_FORCE[1]]), Math.abs(row[C.TCP_FORCE[2]])];
      const axes = ["x", "y", "z"];
      for (let j = 0; j < 3; j++) {
        if (forces[j] > kpi_peak_tcp_force.value) {
          kpi_peak_tcp_force = { value: forces[j], axis: axes[j], time: time };
        }
        if (forces[j] > FORCE_THRESHOLD_NEWTONS && i % step === 0) {
          anomalies.push({ time, type: "TCP Force Event", joint: null, details: `Force on ${axes[j]}-axis was ${forces[j].toFixed(1)} N` });
        }
      }

      // --- Process Time Series Data (Run only on sampled rows) ---
      if (i % step === 0) {
        // 3D Path
        ts_tcp_path.push([row[C.TCP_POS[0]], row[C.TCP_POS[1]], row[C.TCP_POS[2]]]);
        
        // Feed data into each time series object
        ts_tcp_orientation.time.push(time);
        ts_tcp_orientation.rx.push(row[C.TCP_ORIENT[0]]);
        ts_tcp_orientation.ry.push(row[C.TCP_ORIENT[1]]);
        ts_tcp_orientation.rz.push(row[C.TCP_ORIENT[2]]);

        ts_tcp_force.time.push(time);
        ts_tcp_force.fx.push(row[C.TCP_FORCE[0]]);
        ts_tcp_force.fy.push(row[C.TCP_FORCE[1]]);
        ts_tcp_force.fz.push(row[C.TCP_FORCE[2]]);
        
        ts_tcp_torque.time.push(time);
        ts_tcp_torque.tx.push(row[C.TCP_TORQUE[0]]);
        ts_tcp_torque.ty.push(row[C.TCP_TORQUE[1]]);
        ts_tcp_torque.tz.push(row[C.TCP_TORQUE[2]]);
        
        // Per-joint data
        for (let j = 0; j < 6; j++) {
          const jointKey = `j${j+1}` as keyof typeof ts_following_error;
          
          if (!ts_following_error[jointKey]) {
            // Initialize arrays for each joint
            ts_following_error[jointKey] = [];
            ts_target_position[jointKey] = [];
            ts_actual_position[jointKey] = [];
            ts_target_torque[jointKey] = [];
            ts_target_acceleration[jointKey] = [];
            ts_actual_current[jointKey] = [];
            ts_target_current[jointKey] = [];
            ts_control_current[jointKey] = [];
            ts_joint_temps[jointKey] = [];
          }

          ts_following_error[jointKey].push(row[C.A_POS[j]] - row[C.T_POS[j]]);
          ts_target_position[jointKey].push(row[C.T_POS[j]]);
          ts_actual_position[jointKey].push(row[C.A_POS[j]]);
          ts_target_torque[jointKey].push(row[C.T_TORQUE[j]]);
          ts_target_acceleration[jointKey].push(row[C.T_ACC[j]]);
          ts_actual_current[jointKey].push(row[C.A_CUR[j]]);
          ts_target_current[jointKey].push(row[C.T_CUR[j]]);
          ts_control_current[jointKey].push(row[C.C_CUR[j]]);
          ts_joint_temps[jointKey].push(row[C.TEMPS[j]]);
        }
        // Add time to all joint-based objects
        ts_following_error.time.push(time);
        ts_target_position.time.push(time);
        ts_actual_position.time.push(time);
        ts_target_torque.time.push(time);
        ts_target_acceleration.time.push(time);
        ts_actual_current.time.push(time);
        ts_target_current.time.push(time);
        ts_control_current.time.push(time);
        ts_joint_temps.time.push(time);
      }
    }
    console.log("Finished processing rows.");

    // --- 5. Create Final Database Row ---
    const analysisData = {
      // No user_id
      file_name: fileName,
      total_run_time_sec: rows[rowCount - 1][C.COL_TIME] - rows[0][C.COL_TIME],

      kpi_max_following_error,
      kpi_peak_current,
      kpi_peak_temp,
      kpi_peak_tcp_force,
      
      anomalies,
      
      // All the bulky time-series data
      ts_tcp_path,
      ts_tcp_orientation,
      ts_following_error,
      ts_target_position,
      ts_actual_position,
      ts_tcp_force,
      ts_tcp_torque,
      ts_target_torque,
      ts_target_acceleration,
      ts_actual_current,
      ts_target_current,
      ts_control_current,
      ts_joint_temps,
    };
    console.log("Analysis data prepared:", analysisData);

    // --- 6. Insert into Database ---
    console.log("Inserting analysis data into database...");
    const { data: newAnalysis, error: dbError } = await supabase
      .from("analysis_results")
      .insert(analysisData)
      .select("id")
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      throw dbError;
    }
    console.log("Database insert successful. New analysis ID:", newAnalysis.id);

    // --- 7. Return the ID of the new analysis ---
    return new Response(
      JSON.stringify({ analysisId: newAnalysis.id, message: "Analysis complete!" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json", "Connection": "keep-alive" } }
    );

  } catch (err) {
    console.error("Error in analyze-log function:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json", "Connection": "keep-alive" } }
    );
  }
});