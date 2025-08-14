"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// Define the structure of a single timeline event
interface TimelineEvent {
  id: string;
  title: string;
  isCompleted: boolean;
}

// Define the props for our component
interface TimelineProgressChartProps {
  events: TimelineEvent[];
}

// Define colors for the chart slices
const COLORS = {
  Completed: "#10B981", // Green
  Pending: "#6B7280",   // Gray
};

// MODIFIED: Tooltip now shows the count for the aggregated slice
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const status = data.name;
    const count = data.value;
    const color = COLORS[status as keyof typeof COLORS];
    
    return (
      <div className="p-2 text-sm bg-background border rounded-lg shadow-sm">
        <p className="font-bold" style={{ color }}>
          {status}: {count} event(s)
        </p>
      </div>
    );
  }
  return null;
};

// Custom legend component to avoid TypeScript errors
const CustomLegend = () => {
    return (
      <div className="flex justify-center items-center gap-4 text-sm mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.Completed }}></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.Pending }}></div>
          <span>Pending</span>
        </div>
      </div>
    );
  };

export default function TimelineProgressChart({
  events,
}: TimelineProgressChartProps) {
  if (!events || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline Progress</CardTitle>
          <CardDescription>
            No timeline events have been created for this project yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">No data to display</p>
        </CardContent>
      </Card>
    );
  }

  const completedCount = events.filter(event => event.isCompleted).length;
  const pendingCount = events.length - completedCount;
  const totalCount = events.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // MODIFIED: Chart data is now two aggregated slices
  const chartData = [
    { name: "Completed", value: completedCount },
    { name: "Pending", value: pendingCount },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline Progress</CardTitle>
        <CardDescription>
          {completedCount} of {totalCount} events completed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 250, position: 'relative' }}>
          <ResponsiveContainer>
            <PieChart>
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name as keyof typeof COLORS]}
                  />
                ))}
              </Pie>
              <Legend content={<CustomLegend />} verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-4">
            <p className="text-2xl font-bold">{percentage}%</p>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
        </div>
      </CardContent>
    </Card>
  );
}
