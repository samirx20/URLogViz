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
import { Chart, TargetActualChart, ScatterPlot } from "@/components/charts";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// --- THE PAGE COMPONENT ---
// This would be at a route like /analysis
export default function AnalysisPage() {
    const [analysisId, setAnalysisId] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<any>(null);
    const [modalTitle, setModalTitle] = useState("");
    const [modalType, setModalType] = useState<"chart" | "targetActual" | "scatter" | null>(null);
    const supabase = createClient();

    useEffect(() => {
      const id = sessionStorage.getItem('analysisId');
      setAnalysisId(id);
    }, []);

    useEffect(() => {
      if (!analysisId) {
        setIsLoading(false);
        return;
      }
      const fetchAnalysis = async () => {
        const { data, error } = await supabase
          .from("analysis_results")
          .select("*") // Select all data
          .eq("id", analysisId)
          .single();
        
        if (error) {
          console.error("Error fetching analysis data:", error);
        } else {
          setAnalysisData(data);
        }
        setIsLoading(false);
      };
      fetchAnalysis();
    }, [analysisId]);

    if (isLoading) {
      return <div>Loading detailed analysis...</div>;
    }

    if (!analysisData) {
      return <div>No analysis found. Please upload a log file.</div>;
    }

    // --- Helper to format data for charts with sampling to improve performance ---
    const formatChartData = (timeData, jointData) => {
      if (!timeData || !jointData || !Array.isArray(timeData)) return [];
      
      // Sample data to improve performance - take every nth point
      const samplingRate = Math.max(1, Math.floor(timeData.length / 100)); // Max 100 points
      const sampledData = [];
      
      for (let i = 0; i < timeData.length; i += samplingRate) {
        sampledData.push({
          time: timeData[i],
          j1: jointData.j1?.[i],
          j2: jointData.j2?.[i],
          j3: jointData.j3?.[i],
          j4: jointData.j4?.[i],
          j5: jointData.j5?.[i],
          j6: jointData.j6?.[i],
        });
      }
      
      return sampledData;
    }

    const formatTargetActualData = (timeData, targetData, actualData) => {
      if (!timeData || !targetData || !actualData || !Array.isArray(timeData)) return [];
      
      // Sample data to improve performance - take every nth point
      const samplingRate = Math.max(1, Math.floor(timeData.length / 100)); // Max 100 points
      const sampledData = [];
      
      for (let i = 0; i < timeData.length; i += samplingRate) {
        sampledData.push({
          time: timeData[i],
          target: targetData[i],
          actual: actualData[i],
        });
      }
      
      return sampledData;
    }

    const followingErrorData = analysisData.ts_following_error ? formatChartData(analysisData.ts_following_error.time, analysisData.ts_following_error) : [];
    const tempData = analysisData.ts_joint_temps ? formatChartData(analysisData.ts_joint_temps.time, analysisData.ts_joint_temps) : [];
    
    const tcpOrientationData = analysisData.ts_tcp_orientation ? formatChartData(analysisData.ts_tcp_orientation.time, {
      j1: analysisData.ts_tcp_orientation.rx,
      j2: analysisData.ts_tcp_orientation.ry,
      j3: analysisData.ts_tcp_orientation.rz,
    }) : [];

    const tcpForceData = analysisData.ts_tcp_force ? formatChartData(analysisData.ts_tcp_force.time, {
      j1: analysisData.ts_tcp_force.fx,
      j2: analysisData.ts_tcp_force.fy,
      j3: analysisData.ts_tcp_force.fz,
    }) : [];

    const tcpTorqueData = analysisData.ts_tcp_torque ? formatChartData(analysisData.ts_tcp_torque.time, {
      j1: analysisData.ts_tcp_torque.tx,
      j2: analysisData.ts_tcp_torque.ty,
      j3: analysisData.ts_tcp_torque.tz,
    }) : [];

    const targetTorqueData = analysisData.ts_target_torque ? formatChartData(analysisData.ts_target_torque.time, analysisData.ts_target_torque) : [];
    const targetAccelerationData = analysisData.ts_target_acceleration ? formatChartData(analysisData.ts_target_acceleration.time, analysisData.ts_target_acceleration) : [];
    const actualCurrentData = analysisData.ts_actual_current ? formatChartData(analysisData.ts_actual_current.time, analysisData.ts_actual_current) : [];
    const controlCurrentData = analysisData.ts_control_current ? formatChartData(analysisData.ts_control_current.time, analysisData.ts_control_current) : [];

    const targetPositionData = (jointIndex) => {
      if (!analysisData.ts_target_position || !analysisData.ts_actual_position) return [];
      return formatTargetActualData(
        analysisData.ts_target_position.time,
        analysisData.ts_target_position[`j${jointIndex}`],
        analysisData.ts_actual_position[`j${jointIndex}`]
      );
    };

    // Function to open modal with chart data
    const openChartModal = (data, lines, title, type) => {
      setModalData({ data, lines });
      setModalTitle(title);
      setModalType(type);
      setIsModalOpen(true);
    };

    // Function to open target vs actual modal
    const openTargetActualModal = (data, jointIndex, title) => {
      setModalData({ data, jointIndex });
      setModalTitle(title);
      setModalType("targetActual");
      setIsModalOpen(true);
    };




    // Dummy scatter data for current vs velocity visualization
    const dummyScatterData = [
      { x: 0, y: 0, z: 200 },
      { x: 1, y: 1.5, z: 300 },
      { x: 2, y: 1, z: 200 },
      { x: 3, y: 4.5, z: 400 },
      { x: 4, y: 3, z: 250 },
      { x: 5, y: 6, z: 450 },
    ];


  return (
    <div className="flex-1 space-y-4 p-0 md:p-0 pt-6 bg-background text-foreground">
      <h2 className="text-3xl font-bold tracking-tight ml-4 md:ml-8">
        Detailed Analysis Suite
      </h2>
      <Tabs defaultValue="kinematics" className="space-y-4">
        <TabsList className="w-full justify-start px-8">
          <TabsTrigger value="kinematics">Kinematics (Movement)</TabsTrigger>
          <TabsTrigger value="dynamics">Dynamics (Forces)</TabsTrigger>
          <TabsTrigger value="electrical">Electrical (Power)</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics (Health)</TabsTrigger>

        </TabsList>

        {/* =======================
              TAB 1: KINEMATICS
           ======================= */}
        <TabsContent value="kinematics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="h-full flex flex-col cursor-pointer hover:bg-accent transition-colors" onClick={() => openChartModal(
              tcpOrientationData,
              [
                { key: "j1", name: "Rx", color: "#8884d8" },
                { key: "j2", name: "Ry", color: "#82ca9d" },
                { key: "j3", name: "Rz", color: "#ffc658" },
              ],
              "Tool Orientation vs. Time (Detailed View)",
              "chart"
            )}>
              <CardHeader><CardTitle>Tool Orientation vs. Time</CardTitle></CardHeader>
              <CardContent className="flex-grow h-80">
                <Chart
                  data={tcpOrientationData}
                  lines={[
                    { key: "j1", name: "Rx", color: "#8884d8" },
                    { key: "j2", name: "Ry", color: "#82ca9d" },
                    { key: "j3", name: "Rz", color: "#ffc658" },
                  ]}
                />
                <CardDescription className="mt-2">Data: `ts_tcp_orientation`</CardDescription>
              </CardContent>
            </Card>
            <Card className="h-full flex flex-col cursor-pointer hover:bg-accent transition-colors" onClick={() => openChartModal(
              followingErrorData,
              [
                { key: "j1", name: "J1 Error", color: "#8884d8" },
                { key: "j2", name: "J2 Error", color: "#82ca9d" },
                { key: "j3", name: "J3 Error", color: "#ffc658" },
                { key: "j4", name: "J4 Error", color: "#db348e" },
                { key: "j5", name: "J5 Error", color: "#34d3db" },
                { key: "j6", name: "J6 Error", color: "#db6234" },
              ],
              "Following Error vs. Time (Detailed View)",
              "chart"
            )}>
              <CardHeader><CardTitle>Following Error vs. Time</CardTitle></CardHeader>
              <CardContent className="flex-grow h-80">
                <Chart
                  data={followingErrorData}
                  lines={[
                    { key: "j1", name: "J1 Error", color: "#8884d8" },
                    { key: "j2", name: "J2 Error", color: "#82ca9d" },
                    { key: "j3", name: "J3 Error", color: "#ffc658" },
                    { key: "j4", name: "J4 Error", color: "#db348e" },
                    { key: "j5", name: "J5 Error", color: "#34d3db" },
                    { key: "j6", name: "J6 Error", color: "#db6234" },
                  ]}
                />
                <CardDescription className="mt-2">Data: `ts_following_error`</CardDescription>
              </CardContent>
            </Card>
          </div>
          <Card className="h-full flex flex-col">
            <CardHeader><CardTitle>Joint Position Tracking (Target vs. Actual)</CardTitle></CardHeader>
            <CardContent className="flex-grow grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4, 5, 6].map((joint) => (
                <div 
                  key={joint} 
                  className="h-80 cursor-pointer hover:bg-accent transition-colors p-2 rounded-md" 
                  onClick={() => openTargetActualModal(
                    targetPositionData(joint),
                    joint,
                    `Joint ${joint} Position Tracking (Target vs. Actual)`
                  )}
                >
                  <TargetActualChart data={targetPositionData(joint)} />
                </div>
              ))}
            </CardContent>
            <CardDescription className="p-6 pt-0">Data: `ts_target_position` vs. `ts_actual_position`</CardDescription>
          </Card>
        </TabsContent>

        {/* =======================
              TAB 2: DYNAMICS
           ======================= */}
        <TabsContent value="dynamics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="h-full flex flex-col cursor-pointer hover:bg-accent transition-colors" onClick={() => openChartModal(
              tcpForceData,
              [
                { key: "j1", name: "Force X", color: "#8884d8" },
                { key: "j2", name: "Force Y", color: "#82ca9d" },
                { key: "j3", name: "Force Z", color: "#ffc658" },
              ],
              "Measured Tool Force (TCP) vs. Time (Detailed View)",
              "chart"
            )}>
              <CardHeader><CardTitle>Measured Tool Force (TCP) vs. Time</CardTitle></CardHeader>
              <CardContent className="flex-grow h-80">
                <Chart
                  data={tcpForceData}
                  lines={[
                    { key: "j1", name: "Force X", color: "#8884d8" },
                    { key: "j2", name: "Force Y", color: "#82ca9d" },
                    { key: "j3", name: "Force Z", color: "#ffc658" },
                  ]}
                />
                <CardDescription className="mt-2">Data: `ts_tcp_force`</CardDescription>
              </CardContent>
            </Card>
            <Card className="h-full flex flex-col cursor-pointer hover:bg-accent transition-colors" onClick={() => openChartModal(
              tcpTorqueData,
              [
                { key: "j1", name: "Torque Rx", color: "#db348e" },
                { key: "j2", name: "Torque Ry", color: "#34d3db" },
                { key: "j3", name: "Torque Rz", color: "#db6234" },
              ],
              "Measured Tool Torque (TCP) vs. Time (Detailed View)",
              "chart"
            )}>
              <CardHeader><CardTitle>Measured Tool Torque (TCP) vs. Time</CardTitle></CardHeader>
              <CardContent className="flex-grow h-80">
                <Chart
                  data={tcpTorqueData}
                  lines={[
                    { key: "j1", name: "Torque Rx", color: "#db348e" },
                    { key: "j2", name: "Torque Ry", color: "#34d3db" },
                    { key: "j3", name: "Torque Rz", color: "#db6234" },
                  ]}
                />
                <CardDescription className="mt-2">Data: `ts_tcp_torque`</CardDescription>
              </CardContent>
            </Card>
            <Card className="h-full flex flex-col cursor-pointer hover:bg-accent transition-colors" onClick={() => openChartModal(
              targetTorqueData,
              [
                { key: "j1", name: "J1 Torque", color: "#8884d8" },
                { key: "j2", name: "J2 Torque", color: "#82ca9d" },
                { key: "j3", name: "J3 Torque", color: "#ffc658" },
                { key: "j4", name: "J4 Torque", color: "#db348e" },
                { key: "j5", name: "J5 Torque", color: "#34d3db" },
                { key: "j6", name: "J6 Torque", color: "#db6234" },
              ],
              "Target Joint Torque vs. Time (Detailed View)",
              "chart"
            )}>
              <CardHeader><CardTitle>Target Joint Torque vs. Time</CardTitle></CardHeader>
              <CardContent className="flex-grow h-80">
                <Chart data={targetTorqueData} lines={[
                  { key: "j1", name: "J1 Torque", color: "#8884d8" },
                  { key: "j2", name: "J2 Torque", color: "#82ca9d" },
                  { key: "j3", name: "J3 Torque", color: "#ffc658" },
                  { key: "j4", name: "J4 Torque", color: "#db348e" },
                  { key: "j5", name: "J5 Torque", color: "#34d3db" },
                  { key: "j6", name: "J6 Torque", color: "#db6234" },
                ]} />
                <CardDescription className="mt-2">Data: `ts_target_torque`</CardDescription>
              </CardContent>
            </Card>
            <Card className="h-full flex flex-col cursor-pointer hover:bg-accent transition-colors" onClick={() => openChartModal(
              targetAccelerationData,
              [
                { key: "j1", name: "J1 Accel", color: "#8884d8" },
                { key: "j2", name: "J2 Accel", color: "#82ca9d" },
                { key: "j3", name: "J3 Accel", color: "#ffc658" },
                { key: "j4", name: "J4 Accel", color: "#db348e" },
                { key: "j5", name: "J5 Accel", color: "#34d3db" },
                { key: "j6", name: "J6 Accel", color: "#db6234" },
              ],
              "Target Joint Acceleration vs. Time (Detailed View)",
              "chart"
            )}>
              <CardHeader><CardTitle>Target Joint Acceleration vs. Time</CardTitle></CardHeader>
              <CardContent className="flex-grow h-80">
                <Chart data={targetAccelerationData} lines={[
                  { key: "j1", name: "J1 Accel", color: "#8884d8" },
                  { key: "j2", name: "J2 Accel", color: "#82ca9d" },
                  { key: "j3", name: "J3 Accel", color: "#ffc658" },
                  { key: "j4", name: "J4 Accel", color: "#db348e" },
                  { key: "j5", name: "J5 Accel", color: "#34d3db" },
                  { key: "j6", name: "J6 Accel", color: "#db6234" },
                ]} />
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
            <Card className="h-full flex flex-col cursor-pointer hover:bg-accent transition-colors" onClick={() => openChartModal(
              actualCurrentData,
              [
                { key: "j1", name: "J1 Current", color: "#8884d8" },
                { key: "j2", name: "J2 Current", color: "#82ca9d" },
                { key: "j3", name: "J3 Current", color: "#ffc658" },
                { key: "j4", name: "J4 Current", color: "#db348e" },
                { key: "j5", name: "J5 Current", color: "#34d3db" },
                { key: "j6", name: "J6 Current", color: "#db6234" },
              ],
              "Actual Joint Current vs. Time (Detailed View)",
              "chart"
            )}>
              <CardHeader><CardTitle>Actual Joint Current vs. Time</CardTitle></CardHeader>
              <CardContent className="flex-grow h-80">
                <Chart data={actualCurrentData} lines={[
                  { key: "j1", name: "J1 Current", color: "#8884d8" },
                  { key: "j2", name: "J2 Current", color: "#82ca9d" },
                  { key: "j3", name: "J3 Current", color: "#ffc658" },
                  { key: "j4", name: "J4 Current", color: "#db348e" },
                  { key: "j5", name: "J5 Current", color: "#34d3db" },
                  { key: "j6", name: "J6 Current", color: "#db6234" },
                ]} />
                <CardDescription className="mt-2">Data: `ts_actual_current`</CardDescription>
              </CardContent>
            </Card>
            <Card className="h-full flex flex-col cursor-pointer hover:bg-accent transition-colors" onClick={() => openChartModal(
              controlCurrentData,
              [
                { key: "j1", name: "J1 Control Current", color: "#8884d8" },
                { key: "j2", name: "J2 Control Current", color: "#82ca9d" },
                { key: "j3", name: "J3 Control Current", color: "#ffc658" },
                { key: "j4", name: "J4 Control Current", color: "#db348e" },
                { key: "j5", name: "J5 Control Current", color: "#34d3db" },
                { key: "j6", name: "J6 Control Current", color: "#db6234" },
              ],
              "Joint Control Current vs. Time (Detailed View)",
              "chart"
            )}>
              <CardHeader><CardTitle>Joint Control Current vs. Time</CardTitle></CardHeader>
              <CardContent className="flex-grow h-80">
                <Chart data={controlCurrentData} lines={[
                  { key: "j1", name: "J1 Control Current", color: "#8884d8" },
                  { key: "j2", name: "J2 Control Current", color: "#82ca9d" },
                  { key: "j3", name: "J3 Control Current", color: "#ffc658" },
                  { key: "j4", name: "J4 Control Current", color: "#db348e" },
                  { key: "j5", name: "J5 Control Current", color: "#34d3db" },
                  { key: "j6", name: "J6 Control Current", color: "#db6234" },
                ]} />
                <CardDescription className="mt-2">Data: `ts_control_current`</CardDescription>
              </CardContent>
            </Card>
            <Card className="h-full flex flex-col cursor-pointer hover:bg-accent transition-colors" onClick={() => {
              setModalData({ data: dummyScatterData });
              setModalTitle("Current vs. Velocity (Joint 1) (Detailed View)");
              setModalType("scatter");
              setIsModalOpen(true);
            }}>
              <CardHeader><CardTitle>Current vs. Velocity (Joint 1)</CardTitle></CardHeader>
              <CardContent className="flex-grow h-80">
                 <ScatterPlot data={dummyScatterData} /> {/* This still uses dummy data as actual_velocity is not in schema */}
                 <CardDescription className="mt-2">Data: `ts_actual_current` vs. `ts_actual_velocity` (not yet in schema)</CardDescription>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* =======================
              TAB 4: DIAGNOSTICS
           ======================= */}
        <TabsContent value="diagnostics" className="space-y-4">
          <Card className="h-full flex flex-col cursor-pointer hover:bg-accent transition-colors" onClick={() => openChartModal(
            tempData,
            [
              { key: "j1", name: "J1 Temp", color: "#8884d8" },
              { key: "j2", name: "J2 Temp", color: "#82ca9d" },
              { key: "j3", name: "J3 Temp", color: "#ffc658" },
              { key: "j4", name: "J4 Temp", color: "#db348e" },
              { key: "j5", name: "J5 Temp", color: "#34d3db" },
              { key: "j6", name: "J6 Temp", color: "#db6234" },
            ],
            "Joint Temperature vs. Time (Detailed View)",
            "chart"
          )}>
            <CardHeader><CardTitle>Joint Temperature vs. Time</CardTitle></CardHeader>
            <CardContent className="flex-grow h-80">
              <Chart
                data={tempData}
                lines={[
                  { key: "j1", name: "J1 Temp", color: "#8884d8" },
                  { key: "j2", name: "J2 Temp", color: "#82ca9d" },
                  { key: "j3", name: "J3 Temp", color: "#ffc658" },
                  { key: "j4", name: "J4 Temp", color: "#db348e" },
                  { key: "j5", name: "J5 Temp", color: "#34d3db" },
                  { key: "j6", name: "J6 Temp", color: "#db6234" },
                ]}
              />
              <CardDescription className="mt-2">Data: `ts_joint_temps`</CardDescription>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
      {/* Modal for detailed chart view */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-[95vh] p-0 m-0 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <div className="p-4 overflow-auto h-[calc(95vh-80px)] w-full">
            {modalType === "chart" && modalData && (
              <div className="h-[calc(95vh-120px)]">
                <Chart 
                  data={modalData.data} 
                  lines={modalData.lines} 
                />
              </div>
            )}
            {modalType === "targetActual" && modalData && (
              <div className="h-[calc(95vh-120px)]">
                <TargetActualChart data={modalData.data} />
              </div>
            )}
            {modalType === "scatter" && modalData && (
              <div className="h-[calc(95vh-120px)]">
                <ScatterPlot data={modalData.data} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}