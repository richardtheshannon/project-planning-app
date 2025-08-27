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
import { HelpEnabledTitle } from "@/components/ui/help-enabled-title";

// Define the structure of the data the chart expects
export type FinancialsChartDataPoint = {
  month: string;
  totalRevenue: number;
  expenses: number;
  subscriptions: number;
  netIncome: number;
  taxesDue: number;
  upcomingPayments: number;
  forecast: number; // ADD THIS LINE
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
        <HelpEnabledTitle
          title="Financial Trends (YTD)"
          summary="Displays monthly financial trends including revenue, expenses, net income, taxes, subscriptions, and forecast data as interactive line chart."
          details={
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold mb-2">Chart Data Lines</h5>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Total Revenue (Green):</strong> Monthly revenue from paid invoices</li>
                  <li><strong>Expenses (Red):</strong> One-time expenses + subscription costs per month</li>
                  <li><strong>Net Income (Blue):</strong> Revenue - taxes - expenses</li>
                  <li><strong>Taxes Due (Orange):</strong> 20% tax provision on revenue</li>
                  <li><strong>Subscriptions (Purple):</strong> Monthly subscription costs</li>
                  <li><strong>Forecast (Dashed):</strong> Projected revenue from contracts</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-semibold mb-2">Data Processing</h5>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`// Monthly data aggregation (up to current + 3 months forecast)
const monthlyData = Array.from({ length: 12 }, (_, i) => ({
  month: monthNames[i],
  totalRevenue: 0,    // PAID invoices for month
  expenses: 0,        // One-time + subscription costs
  subscriptions: 0,   // Monthly subscription total
  netIncome: 0,       // Revenue - taxes - expenses
  taxesDue: 0,        // 20% of revenue
  upcomingPayments: 0, // Same as subscriptions
  forecast: 0         // Unpaid invoices + contracts
}));

// Revenue: PAID invoices by issuedDate
invoices.forEach(inv => {
  if (inv.status === 'PAID' && getYear(inv.issuedDate) === currentYear) {
    const monthIndex = getMonth(inv.issuedDate);
    monthlyData[monthIndex].totalRevenue += inv.amount;
  }
});

// Forecast: DRAFT/PENDING/OVERDUE invoices + contracts
invoices.forEach(inv => {
  if (['DRAFT', 'PENDING', 'OVERDUE'].includes(inv.status)) {
    const monthIndex = getMonth(inv.issuedDate);
    monthlyData[monthIndex].forecast += inv.amount;
  }
});`}
                </pre>
              </div>
              
              <div>
                <h5 className="font-semibold mb-2">Interactive Features</h5>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Hover tooltips show exact values with currency formatting</li>
                  <li>Legend allows toggling individual lines on/off</li>
                  <li>Responsive design scales to container width</li>
                  <li>Y-axis auto-scales and shows abbreviated values ($1k, $5k)</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-semibold mb-2">Time Range</h5>
                <p className="text-sm">Shows up to current month + 3 months forecast. Historical data goes back to beginning of current year.</p>
              </div>
            </div>
          }
          className="text-2xl font-semibold"
          as="h3"
        />
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
            <Line name="Forecast" type="monotone" dataKey="forecast" stroke="#06b6d4" strokeWidth={2} strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}