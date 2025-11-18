"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  FileText,
  Thermometer,
  Zap,
  Network,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import React from "react"; 

// --- DUMMY DATA ---
// In a real app, you'd fetch this data based on the page ID
const kpiData = {
  fileName: "ur5testresult_coldstart_fullspeed_payload4.5lb_1.csv",
  maxFollowingError: {
    value: 0.61,
    unit: "rad",
    joint: 3,
    timestamp: 749.2,
  },
  peakMotorCurrent: {
    value: 5.2,
    unit: "A",
    joint: 2,
    timestamp: 751.4,
  },
  peakTemperature: {
    value: 41.5,
    unit: "°C",
    joint: 2,
  },
  peakTcpForce: {
    value: 12.5,
    unit: "N",
    axis: "z",
    timestamp: 751.5,
  },
};

const anomalyData = [
  {
    timestamp: "749.2s",
    type: "High Following Error",
    joint: 3,
    details: "Error exceeded 0.5 rad (was 0.61 rad)",
  },
  {
    timestamp: "751.4s",
    type: "Current Spike",
    joint: 2,
    details: "Current exceeded 5.0 A (was 5.2 A)",
  },
  {
    timestamp: "751.5s",
    type: "TCP Force Event",
    joint: "N/A",
    details: "Z-Force exceeded 10 N (was 12.5 N)",
  },
  {
    timestamp: "810.3s",
    type: "High Temperature",
    joint: 2,
    details: "Temp exceeded 40°C (was 40.2°C)",
  },
];

// --- COMPONENTS (Mock definitions) ---
// You would import these from "@/components/ui/card" etc.
interface KpiCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, description, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

// --- THE PAGE COMPONENT ---
// This would be at a route like /dashboard
export default function DashboardPage() {
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const supabase = createClient();

  useEffect(() => {
    const id = sessionStorage.getItem('analysisId');
    setAnalysisId(id);
  }, []);

  useEffect(() => {
    if (!analysisId) {
      setIsLoading(false);
      return;
    };
    const fetchAnalysis = async () => {
      const { data, error } = await supabase
        .from("analysis_results")
        .select("file_name, kpi_max_following_error, kpi_peak_current, kpi_peak_temp, kpi_peak_tcp_force, anomalies")
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
    return <div>Loading analysis...</div>;
  }

  if (!analysisData) {
    return <div>No analysis found. Please upload a log file.</div>;
  }
  
  // Using dummy data for now
  // const analysisData = {
  //   file_name: kpiData.fileName,
  //   kpi_max_following_error: kpiData.maxFollowingError,
  //   kpi_peak_current: kpiData.peakMotorCurrent,
  //   kpi_peak_temp: kpiData.peakTemperature,
  //   kpi_peak_tcp_force: kpiData.peakTcpForce,
  //   anomalies: anomalyData,
  // };


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-background text-foreground">
      {/* 1. Page Header & File Name */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Main Dashboard
          </h2>
          <div className="flex items-center text-muted-foreground">
            <FileText className="mr-2 h-4 w-4" />
            <span>{analysisData.file_name}</span>
          </div>
        </div>
      </div>

      {/* 2. "At-a-Glance" KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Max Following Error"
          value={`${analysisData.kpi_max_following_error?.value?.toFixed(2) || '0'} ${analysisData.kpi_max_following_error?.unit || 'rad'}`}
          description={`Joint ${analysisData.kpi_max_following_error?.joint || 'N/A'} @ ${analysisData.kpi_max_following_error?.time || 0}s`}
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Peak Motor Current"
          value={`${analysisData.kpi_peak_current?.value?.toFixed(2) || '0'} ${analysisData.kpi_peak_current?.unit || 'A'}`}
          description={`Joint ${analysisData.kpi_peak_current?.joint || 'N/A'} @ ${analysisData.kpi_peak_current?.time || 0}s`}
          icon={<Zap className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Peak Temperature"
          value={`${analysisData.kpi_peak_temp?.value?.toFixed(1) || '0'} ${analysisData.kpi_peak_temp?.unit || '°C'}`}
          description={`Joint ${analysisData.kpi_peak_temp?.joint || 'N/A'}`}
          icon={<Thermometer className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Peak TCP Force"
          value={`${analysisData.kpi_peak_tcp_force?.value?.toFixed(1) || '0'} ${analysisData.kpi_peak_tcp_force?.unit || 'N'}`}
          description={`@ ${analysisData.kpi_peak_tcp_force?.time || 0}s (${analysisData.kpi_peak_tcp_force?.axis || 'N/A'}-axis)`}
          icon={<Network className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

    </div>
  );
}