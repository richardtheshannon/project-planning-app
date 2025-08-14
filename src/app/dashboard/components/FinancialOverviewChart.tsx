"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// Define the structure of the data the chart expects
export type ChartDataPoint = {
  month: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  forecast: number;
};

interface FinancialOverviewChartProps {
  data: ChartDataPoint[];
}

// Custom Tooltip for better formatting
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const formatCurrency = (value: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);

    return (
      <div className="p-4 bg-background border rounded-lg shadow-sm">
        <p className="font-bold text-foreground mb-2">{label}</p>
        <p style={{ color: payload[0].stroke }}>
          {`Revenue: ${formatCurrency(payload[0].value)}`}
        </p>
        <p style={{ color: payload[1].stroke }}>
          {`Expenses: ${formatCurrency(payload[1].value)}`}
        </p>
        <p style={{ color: payload[2].stroke }}>
          {`Net Income: ${formatCurrency(payload[2].value)}`}
        </p>
        <p style={{ color: payload[3].stroke }}>
          {`Forecast: ${formatCurrency(payload[3].value)}`}
        </p>
      </div>
    );
  }
  return null;
};

export default function FinancialOverviewChart({ data }: FinancialOverviewChartProps) {
  // Formatter for the Y-axis labels
  const yAxisFormatter = (value: number) => {
    if (value >= 1000) {
      return `$${value / 1000}k`;
    }
    return `$${value}`;
  };

  return (
    <Card className="col-span-1 lg:col-span-4">
      <CardHeader>
        <CardTitle>Financial Overview (YTD)</CardTitle>
        <CardDescription>
          A year-to-date summary of your revenue, expenses, and net income.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis
              dataKey="month"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={yAxisFormatter}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#22c55e" // green-500
              strokeWidth={2}
              dot={{ r: 4, fill: "#22c55e" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444" // red-500
              strokeWidth={2}
              dot={{ r: 4, fill: "#ef4444" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="netIncome"
              stroke="#3b82f6" // blue-500
              strokeWidth={2}
              dot={{ r: 4, fill: "#3b82f6" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#a855f7" // purple-500
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: "#a855f7" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
