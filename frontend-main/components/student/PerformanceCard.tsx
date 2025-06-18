"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// Define TypeScript interface for props
interface PerformanceCardProps {
  finalScore: number;
  maxScore?: number; // Optional, defaults to 1000
}

// Colors for the chart
const COLORS = ["#10b981", "#e5e7eb"]; // Green for score, gray for remaining

// Chart configuration for shadcn
const chartConfig = {
  Score: {
    label: "Score",
    color: COLORS[0],
  },
  Remaining: {
    label: "Remaining",
    color: COLORS[1],
  },
} satisfies ChartConfig;

const PerformanceCard: React.FC<PerformanceCardProps> = ({
  finalScore,
  maxScore = 1000,
}) => {
  // Calculate percentage for the donut chart
  const scorePercentage = (finalScore / maxScore) * 100;
  const remainingPercentage = 100 - scorePercentage;

  // Chart data
  const chartData = [
    { name: "Score", value: scorePercentage, fill: COLORS[0] },
    { name: "Remaining", value: remainingPercentage, fill: COLORS[1] },
  ];

  return (
    <Card className="">
      <CardHeader className="flex flex-row items-center gap-3">
        <TrendingUp className="w-6 h-6 text-green-600" />
        <CardTitle>Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{finalScore}</div>
            <div className="text-sm text-gray-500">Final Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{scorePercentage.toFixed(1)}%</div>
            <div className="text-sm text-gray-500">Score Percentage</div>
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
                  formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span className="text-sm text-gray-600">Score ({scorePercentage.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <span className="text-sm text-gray-600">Remaining ({remainingPercentage.toFixed(1)}%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceCard;