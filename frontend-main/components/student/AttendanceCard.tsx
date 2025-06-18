"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarCheck } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// Define TypeScript interface for props
interface AttendanceCardProps {
  daysPresent: number;
  attendanceRate: string; // e.g., "75%"
  daysAbsent: number;
}

// Colors for the chart
const COLORS = ["#2563eb", "#e5e7eb"];

const AttendanceCard: React.FC<AttendanceCardProps> = ({
  daysPresent,
  attendanceRate,
}) => {
  // Prepare data for the donut chart
  const attendancePercentage = parseFloat(attendanceRate.replace('%', '')) || 0;
  const absentPercentage = 100 - attendancePercentage;

  const chartData = [
    { name: "Present", value: attendancePercentage, fill: COLORS[0] },
    { name: "Absent", value: absentPercentage, fill: COLORS[1] },
  ];

  // Chart configuration for shadcn
  const chartConfig = {
    Present: {
      label: "Present",
      color: COLORS[0],
    },
    Absent: {
      label: "Absent", 
      color: COLORS[1],
    },
  };

  return (
    <Card className="">
      <CardHeader className="flex flex-row items-center gap-3">
        <CalendarCheck className="w-6 h-6 text-blue-600" />
        <CardTitle>Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{daysPresent}</div>
            <div className="text-sm text-gray-500">Days Present</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{attendanceRate}</div>
            <div className="text-sm text-gray-500">Attendance Rate</div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="h-48 w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [`${value}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="text-sm text-gray-600">Present ({attendancePercentage}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <span className="text-sm text-gray-600">Absent ({absentPercentage.toFixed(1)}%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceCard;


