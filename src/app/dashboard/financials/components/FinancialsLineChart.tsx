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
export type FinancialsChartDataPoint = {
  month: string;
  totalRevenue: number;
  expenses: number;
  subscriptions: number;
  netIncome: number;
  taxesDue: number;
  upcomingPayments: number;
};

interface FinancialsLineChartProps {
  data: FinancialsChartDataPoint[];
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
        {payload.map((pld: any) => (
          <p key={pld.dataKey} style={{ color: pld.stroke }}>
            {`${pld.name}: ${formatCurrency(pld.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function FinancialsLineChart({ data }: FinancialsLineChartProps) {
  // Formatter for the Y-axis labels
  const yAxisFormatter = (value: number) => {
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-6">
      <CardHeader>
        <CardTitle>YTD Financials Overview</CardTitle>
        <CardDescription>
          A year-to-date summary of your key financial metrics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
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
            <Line name="Revenue" type="monotone" dataKey="totalRevenue" stroke="#22c55e" strokeWidth={2} />
            <Line name="Expenses" type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
            <Line name="Subscriptions" type="monotone" dataKey="subscriptions" stroke="#f97316" strokeWidth={2} />
            <Line name="Net Income" type="monotone" dataKey="netIncome" stroke="#3b82f6" strokeWidth={2} />
            <Line name="Taxes Due" type="monotone" dataKey="taxesDue" stroke="#eab308" strokeWidth={2} strokeDasharray="5 5" />
            <Line name="Upcoming" type="monotone" dataKey="upcomingPayments" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
