import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertTriangle, BarChart2, Plus, Upload } from "lucide-react";

export default function FinancialsOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Section: Quick Actions - REVISED FOR RESPONSIVENESS */}
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Invoice
        </Button>
        <Button variant="secondary">
          <Plus className="mr-2 h-4 w-4" /> Log Expense
        </Button>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Upload Document
        </Button>
      </div>

      {/* Section: Key Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue (YTD)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">
              Based on paid invoices this year.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses (YTD)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">
              Based on logged expenses this year.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">
              Total Revenue - Total Expenses.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Payments
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">
              Invoices due in the next 30 days.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section: Alerts and Visualizations */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Alerts for overdue invoices and upcoming subscriptions will appear here.
            </p>
            {/* Placeholder for future list of alerts */}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-primary" />
              Income vs. Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">
              A chart comparing monthly income and expenses will be displayed here.
            </p>
            {/* Placeholder for future chart component */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
