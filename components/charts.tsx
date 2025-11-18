"use client";

import React from "react";
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

interface LineChartData {
  time?: number;
  [key: string]: any;
}

interface LineProps {
  key: string;
  name: string;
  color: string;
}

interface ChartProps {
  data: LineChartData[];
  lines: LineProps[];
}

// Chart component to display multiple line series
export const Chart: React.FC<ChartProps> = ({ data, lines }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-4 text-gray-500">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color}
            name={line.name}
            activeDot={{ r: 8 }}
            dot={false} // Disable dots to improve performance
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

// Component to display target vs actual values for a joint
interface TargetActualChartProps {
  data: LineChartData[];
}

export const TargetActualChart: React.FC<TargetActualChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-4 text-gray-500">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="target" stroke="#8884d8" name="Target" activeDot={{ r: 8 }} dot={false} />
        <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Actual" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Component for scatter plot
interface ScatterChartPropsType {
  data: any[];
}

export const ScatterPlot: React.FC<ScatterChartPropsType> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-4 text-gray-500">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid />
        <XAxis type="number" dataKey="x" name="X" />
        <YAxis type="number" dataKey="y" name="Y" />
        <ZAxis type="number" range={[200, 2000]} dataKey="z" name="Z" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Legend />
        <Scatter name="Joint Data" data={data} fill="#8884d8" />
      </ScatterChart>
    </ResponsiveContainer>
  );
};