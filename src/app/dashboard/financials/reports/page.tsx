import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Printer, FileDown } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Income & Expense Statement</CardTitle>
          <CardDescription>
            Generate a Profit & Loss (P&L) style report for a specific period.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Section: Report Filters */}
          <div className="flex flex-col space-y-2 rounded-md border p-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <p className="font-medium">Select a date range:</p>
            <div className="text-muted-foreground">
              [Date range picker will go here]
            </div>
          </div>

          {/* Section: Report Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button>
              <FileDown className="mr-2 h-4 w-4" /> Export as PDF
            </Button>
          </div>

          {/* Section: Report View */}
          <div className="rounded-md border">
            <div className="p-8 text-center text-muted-foreground">
              Your generated report will be displayed here.
            </div>
            {/* Placeholder for future report table */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
