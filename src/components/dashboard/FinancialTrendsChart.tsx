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
import { FinancialTrendsDataPoint } from "@/lib/financial-data";

interface FinancialTrendsChartProps {
  data: FinancialTrendsDataPoint[];
  height?: number;
  className?: string;
  title?: string;
  description?: string;
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

export function FinancialTrendsChart({ 
  data, 
  height = 350,
  className = "",
  title = "Financial Trends (YTD)",
  description = "A comprehensive year-to-date summary of your financial performance across all key metrics."
}: FinancialTrendsChartProps) {
  // Formatter for the Y-axis labels
  const yAxisFormatter = (value: number) => {
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };

  return (
    <Card className={`col-span-1 lg:col-span-4 ${className}`}>
      <CardHeader>
        <HelpEnabledTitle
          title={title}
          summary="Comprehensive financial dashboard showing revenue, expenses, net income, taxes, subscriptions, and draft/pending invoice forecasts over the full year."
          details={
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold mb-2">Chart Data Lines (7 Series)</h5>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Revenue (Green):</strong> Monthly revenue from paid invoices</li>
                  <li><strong>Expenses (Red):</strong> One-time expenses + subscription costs per month</li>
                  <li><strong>Net Income (Blue):</strong> Revenue - taxes - expenses</li>
                  <li><strong>Taxes Due (Yellow Dashed):</strong> 20% tax provision on revenue</li>
                  <li><strong>Subscriptions (Orange):</strong> Monthly recurring subscription costs</li>
                  <li><strong>Upcoming (Purple Dashed):</strong> Scheduled payments and subscriptions</li>
                  <li><strong>Forecast (Cyan Dashed):</strong> Draft and pending invoice revenue minus expenses</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-semibold mb-2">Data Processing Logic</h5>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`// Full year monthly data aggregation
const monthlyData = Array.from({ length: 12 }, (_, i) => ({
  month: monthNames[i],
  totalRevenue: 0,    // PAID invoices for month
  expenses: 0,        // One-time + subscription costs
  subscriptions: 0,   // Monthly subscription total
  netIncome: 0,       // Revenue - taxes - expenses
  taxesDue: 0,        // 20% of revenue
  upcomingPayments: 0, // Same as subscriptions
  forecast: 0         // Draft/pending invoices - expenses
}));

// Revenue calculation: PAID invoices by issuedDate
invoices.forEach(inv => {
  if (inv.status === 'PAID' && getYear(inv.issuedDate) === currentYear) {
    const monthIndex = getMonth(inv.issuedDate);
    monthlyData[monthIndex].totalRevenue += inv.amount;
  }
});

// Forecast calculation: Draft and pending invoices only
invoices.forEach(inv => {
  if (['DRAFT', 'PENDING', 'OVERDUE'].includes(inv.status)) {
    const monthIndex = getMonth(inv.issuedDate);
    monthlyData[monthIndex].forecast += inv.amount;
  }
});

// Final calculations per month
for (let i = 0; i < 12; i++) {
  monthlyData[i].taxesDue = monthlyData[i].totalRevenue * 0.20;
  monthlyData[i].netIncome = monthlyData[i].totalRevenue - 
                           monthlyData[i].taxesDue - 
                           monthlyData[i].expenses;
  monthlyData[i].forecast = monthlyData[i].forecast - 
                          monthlyData[i].expenses;
}`}
                </pre>
              </div>
              
              <div>
                <h5 className="font-semibold mb-2">Advanced Features</h5>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Interactive tooltips with currency formatting for all 7 data series</li>
                  <li>Legend allows individual line visibility control</li>
                  <li>Dotted lines distinguish projections from actual data</li>
                  <li>Responsive design adapts to container size</li>
                  <li>Auto-scaling Y-axis with abbreviated values ($1k, $5k, etc.)</li>
                  <li>Full year view with forecast up to current month + 3 months</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-semibold mb-2">Data Sources</h5>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Invoices: Revenue and forecast calculations</li>
                  <li>Expenses: One-time expense tracking</li>
                  <li>Subscriptions: Recurring monthly and annual costs</li>
                  <li>Clients: Client information and contact management</li>
                  <li>Tax calculations: 20% provision on all revenue</li>
                </ul>
              </div>
            </div>
          }
          className="text-2xl font-semibold"
          as="h3"
        />
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
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
            
            {/* Main revenue line - solid green */}
            <Line 
              name="Revenue" 
              type="monotone" 
              dataKey="totalRevenue" 
              stroke="#22c55e" 
              strokeWidth={2}
              dot={{ r: 4, fill: "#22c55e" }}
              activeDot={{ r: 6 }}
            />
            
            {/* Expenses line - solid red */}
            <Line 
              name="Expenses" 
              type="monotone" 
              dataKey="expenses" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ r: 4, fill: "#ef4444" }}
              activeDot={{ r: 6 }}
            />
            
            {/* Net Income line - solid blue */}
            <Line 
              name="Net Income" 
              type="monotone" 
              dataKey="netIncome" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 4, fill: "#3b82f6" }}
              activeDot={{ r: 6 }}
            />
            
            {/* Subscriptions line - solid orange */}
            <Line 
              name="Subscriptions" 
              type="monotone" 
              dataKey="subscriptions" 
              stroke="#f97316" 
              strokeWidth={2}
              dot={{ r: 4, fill: "#f97316" }}
              activeDot={{ r: 6 }}
            />
            
            {/* Taxes Due line - dashed yellow */}
            <Line 
              name="Taxes Due" 
              type="monotone" 
              dataKey="taxesDue" 
              stroke="#eab308" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: "#eab308" }}
              activeDot={{ r: 6 }}
            />
            
            {/* Upcoming Payments line - dashed purple */}
            <Line 
              name="Upcoming" 
              type="monotone" 
              dataKey="upcomingPayments" 
              stroke="#a855f7" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: "#a855f7" }}
              activeDot={{ r: 6 }}
            />
            
            {/* Forecast line - dashed cyan */}
            <Line 
              name="Forecast" 
              type="monotone" 
              dataKey="forecast" 
              stroke="#06b6d4" 
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={{ r: 4, fill: "#06b6d4" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}