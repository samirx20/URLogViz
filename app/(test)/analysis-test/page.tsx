"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import { useParams } from "next/navigation";

// --- DUMMY DATA & MOCK CHARTS ---
// In a real app, this data would come from your 'analysisData' fetch
const generateChartData = (numPoints = 20) => {
  return Array.from({ length: numPoints }, (_, i) => ({
    time: 740 + i * 2,
    joint1: Math.random() * 2,
    joint2: Math.random() * 3 + 0.5,
    joint3: Math.random() * 1.5 - 0.5,
    joint4: Math.random() * 2.5,
    joint5: Math.random() * 1,
    joint6: Math.random() * 3,
  }));
};

const generateTargetActualData = (numPoints = 20) => {
  return Array.from({ length: numPoints }, (_, i) => {
    const target = Math.sin(i / 5) * 2;
    const actual = target + (Math.random() - 0.5) * 0.2;
    return {
      time: 740 + i * 2,
      target: target,
      actual: actual,
    };
  });
};

const generateScatterData = (numPoints = 50) => {
  return Array.from({ length: numPoints }, () => ({
    velocity: Math.random() * 10 - 5,
    current: Math.random() * 5 + 0.5 * Math.random() * 10,
  }));
};

const dummyChartData = generateChartData();
const dummyTargetActualData = generateTargetActualData();
const dummyScatterData = generateScatterData();
const dummyRawData = [
  { time: 740.0, j1_pos: -26.8, j1_vel: 0.0, j1_cur: 0.23, j1_temp: 25.2, x: -0.63, tcp_fx: -25.2 },
  { time: 740.1, j1_pos: -26.8, j1_vel: 0.0, j1_cur: 0.23, j1_temp: 25.2, x: -0.63, tcp_fx: -25.2 },
  { time: 740.2, j1_pos: -26.8, j1_vel: 0.0, j1_cur: 0.23, j1_temp: 25.2, x: -0.63, tcp_fx: -25.2 },
  { time: 740.3, j1_pos: -26.8, j1_vel: 0.0, j1_cur: 0.23, j1_temp: 25.2, x: -0.63, tcp_fx: -25.2 },
  { time: 740.4, j1_pos: -26.8, j1_vel: 0.0, j1_cur: 0.23, j1_temp: 25.2, x: -0.63, tcp_fx: -25.2 },
];

// Re-usable chart component
const MockLineChart = ({ data, lines }) => (
  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="time" type="number" unit="s" />
      <YAxis />
      <Tooltip />
      <Legend />
      {lines.map((line) => (
        <Line key={line.key} type="monotone" dataKey={line.key} name={line.name} stroke={line.color} dot={false} />
      ))}
    </LineChart>
  </ResponsiveContainer>
);

// Re-usable chart component
const MockTargetActualChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="time" type="number" unit="s" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="target" name="Target" stroke="#8884d8" dot={false} />
      <Line type="monotone" dataKey="actual" name="Actual" stroke="#82ca9d" dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

// Re-usable chart component
const MockScatterChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={250}>
    <ScatterChart>
      <CartesianGrid />
      <XAxis type="number" dataKey="velocity" name="Velocity" unit="rad/s" />
      <YAxis type="number" dataKey="current" name="Current" unit="A" />
      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
      <Scatter name="Current vs. Velocity" data={data} fill="#8884d8" />
    </ScatterChart>
  </ResponsiveContainer>
);

// --- THE PAGE COMPONENT ---
// This would be at a route like /analysis/[id]
export default function AnalysisPage() {
    // const params = useParams();
    // const analysisId = params.id;
    // const [analysisData, setAnalysisData] = useState(null);
    // const [isLoading, setIsLoading] = useState(true);

    // useEffect(() => {
    //   if (!analysisId) return;
    //   const fetchAnalysis = async () => {
    //     const { data, error } = await supabase
    //       .from("analysis_results")
    //       .select("*") // Select all data
    //       .eq("id", analysisId)
    //       .single();
        
    //     if (error) {
    //       console.error("Error fetching analysis data:", error);
    //     } else {
    //       setAnalysisData(data);
    //     }
    //     setIsLoading(false);
    //   };
    //   fetchAnalysis();
    // }, [analysisId]);

    // if (isLoading) {
    //   return <div>Loading detailed analysis...</div>;
    // }

    // if (!analysisData) {
    //   return <div>Analysis not found.</div>;
    // }

    // --- Helper to format data for charts ---
    // const formatChartData = (timeData, jointData) => {
    //   if (!timeData || !jointData) return [];
    //   return timeData.map((time, i) => ({
    //     time: time,
    //     j1: jointData.j1[i],
    //     j2: jointData.j2[i],
    //     j3: jointData.j3[i],
    //     j4: jointData.j4[i],
    //     j5: jointData.j5[i],
    //     j6: jointData.j6[i],
    //   }));
    // }
    // const followingErrorData = formatChartData(analysisData.ts_following_error.time, analysisData.ts_following_error);
    // const tempData = formatChartData(analysisData.ts_joint_temps.time, analysisData.ts_joint_temps);
    // ... etc ...


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-background text-foreground">
      <h2 className="text-3xl font-bold tracking-tight">
        Detailed Analysis Suite
      </h2>
      <Tabs defaultValue="kinematics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kinematics">Kinematics (Movement)</TabsTrigger>
          <TabsTrigger value="dynamics">Dynamics (Forces)</TabsTrigger>
          <TabsTrigger value="electrical">Electrical (Power)</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics (Health)</TabsTrigger>
          <TabsTrigger value="rawdata">Raw Data Explorer</TabsTrigger>
        </TabsList>

        {/* =======================
              TAB 1: KINEMATICS
           ======================= */}
        <TabsContent value="kinematics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Tool Orientation vs. Time</CardTitle></CardHeader>
              <CardContent>
                <MockLineChart
                  data={dummyChartData} // Use: formatChartData(analysisData.ts_tcp_orientation.time, analysisData.ts_tcp_orientation)
                  lines={[
                    { key: "joint1", name: "Rx", color: "#8884d8" },
                    { key: "joint2", name: "Ry", color: "#82ca9d" },
                    { key: "joint3", name: "Rz", color: "#ffc658" },
                  ]}
                />
                <CardDescription className="mt-2">Data: `ts_tcp_orientation`</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Following Error vs. Time</CardTitle></CardHeader>
              <CardContent>
                <MockLineChart
                  data={dummyChartData} // Use: followingErrorData
                  lines={[
                    { key: "joint1", name: "J1 Error", color: "#8884d8" },
                    { key: "joint2", name: "J2 Error", color: "#82ca9d" },
                    { key: "joint3", name: "J3 Error", color: "#ffc658" },
                    // ... add j4, j5, j6
                  ]}
                />
                <CardDescription className="mt-2">Data: `ts_following_error`</CardDescription>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Joint Position Tracking (Target vs. Actual)</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* You would map over this, passing data for each joint */}
              <MockTargetActualChart data={dummyTargetActualData} />
              <MockTargetActualChart data={dummyTargetActualData} />
              <MockTargetActualChart data={dummyTargetActualData} />
              <MockTargetActualChart data={dummyTargetActualData} />
              <MockTargetActualChart data={dummyTargetActualData} />
              <MockTargetActualChart data={dummyTargetActualData} />
            </CardContent>
            <CardDescription className="p-6 pt-0">Data: `ts_target_position` vs. `ts_actual_position`</CardDescription>
          </Card>
        </TabsContent>

        {/* =======================
              TAB 2: DYNAMICS
           ======================= */}
        <TabsContent value="dynamics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Measured Tool Force (TCP) vs. Time</CardTitle></CardHeader>
              <CardContent>
                <MockLineChart
                  data={dummyChartData} // Use: analysisData.ts_tcp_force
                  lines={[
                    { key: "joint1", name: "Force X", color: "#8884d8" },
                    { key: "joint2", name: "Force Y", color: "#82ca9d" },
                    { key: "joint3", "name": "Force Z", color: "#ffc658" },
                  ]}
                />
                <CardDescription className="mt-2">Data: `ts_tcp_force`</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Measured Tool Torque (TCP) vs. Time</CardTitle></CardHeader>
              <CardContent>
                <MockLineChart
                  data={dummyChartData} // Use: analysisData.ts_tcp_torque
                  lines={[
                    { key: "joint4", name: "Torque Rx", color: "#db348e" },
                    { key: "joint5", name: "Torque Ry", color: "#34d3db" },
                    { key: "joint6", name: "Torque Rz", color: "#db6234" },
                  ]}
                />
                <CardDescription className="mt-2">Data: `ts_tcp_torque`</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Target Joint Torque vs. Time</CardTitle></CardHeader>
              <CardContent>
                <MockLineChart data={dummyChartData} lines={[{ key: "joint1", name: "J1 Torque", color: "#8884d8" }]} />
                <CardDescription className="mt-2">Data: `ts_target_torque`</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Target Joint Acceleration vs. Time</CardTitle></CardHeader>
              <CardContent>
                <MockLineChart data={dummyChartData} lines={[{ key: "joint2", name: "J2 Accel", color: "#82ca9d" }]} />
                <CardDescription className="mt-2">Data: `ts_target_acceleration`</CardDescription>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* =======================
              TAB 3: ELECTRICAL
           ======================= */}
        <TabsContent value="electrical" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Actual Joint Current vs. Time</CardTitle></CardHeader>
              <CardContent>
                <MockLineChart data={dummyChartData} lines={[{ key: "joint3", name: "J3 Current", color: "#ffc658" }]} />
                <CardDescription className="mt-2">Data: `ts_actual_current`</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Joint Control Current vs. Time</CardTitle></CardHeader>
              <CardContent>
                <MockLineChart data={dummyChartData} lines={[{ key: "joint4", name: "J4 Control Current", color: "#db348e" }]} />
                <CardDescription className="mt-2">Data: `ts_control_current`</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Current vs. Velocity (Joint 1)</CardTitle></CardHeader>
              <CardContent>
                 <MockScatterChart data={dummyScatterData} />
                 <CardDescription className="mt-2">Data: `ts_actual_current` vs. `ts_actual_velocity` (not yet in schema)</CardDescription>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* =======================
              TAB 4: DIAGNOSTICS
           ======================= */}
        <TabsContent value="diagnostics" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Joint Temperature vs. Time</CardTitle></CardHeader>
            <CardContent>
              <MockLineChart
                data={dummyChartData} // Use: tempData
                lines={[
                  { key: "joint1", name: "J1 Temp", color: "#8884d8" },
                  { key: "joint2", name: "J2 Temp", color: "#82ca9d" },
                  { key: "joint3", name: "J3 Temp", color: "#ffc658" },
                  { key: "joint4", name: "J4 Temp", color: "#db348e" },
                  { key: "joint5", name: "J5 Temp", color: "#34d3db" },
                  { key: "joint6", name: "J6 Temp", color: "#db6234" },
                ]}
              />
              <CardDescription className="mt-2">Data: `ts_joint_temps`</CardDescription>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =======================
              TAB 5: RAW DATA
           ======================= */}
        <TabsContent value="rawdata">
          <Card>
            <CardHeader><CardTitle>Raw Data Explorer</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ROBOT_TIME</TableHead>
                    <TableHead>J1_POS</TableHead>
                    <TableHead>J1_VEL</TableHead>
                    <TableHead>J1_CUR</TableHead>
                    <TableHead>...</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyRawData.map((row) => (
                    <TableRow key={row.time}>
                      <TableCell>{row.time}</TableCell>
                      <TableCell>{row.j1_pos}</TableCell>
                      <TableCell>{row.j1_vel}</TableCell>
                      <TableCell>{row.j1_cur}</TableCell>
                      <TableCell>...</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}