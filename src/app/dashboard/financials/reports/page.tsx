"use client";

import { useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, Printer, FileDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Define a type for our summary data
interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  startDate: string;
  endDate: string;
}

// Component to display the generated report summary
function ReportView({ summary }: { summary: FinancialSummary }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle>Total Income</CardTitle>
                    <CardDescription>Based on PAID invoices</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalIncome)}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Total Expenses</CardTitle>
                    <CardDescription>Includes all logged expenses</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Net Profit</CardTitle>
                    <CardDescription>Income minus Expenses</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className={cn(
                        "text-2xl font-bold",
                        summary.netProfit >= 0 ? "text-gray-800" : "text-red-600"
                    )}>
                        {formatCurrency(summary.netProfit)}
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}


export default function ReportsPage() {
  const [date, setDate] = useState<DateRange | undefined>();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    if (!date?.from || !date?.to) {
      setError("Please select a complete date range.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      const response = await fetch('/api/financials/reports/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: date.from.toISOString(),
          endDate: date.to.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate report.");
      }

      const data = await response.json();
      setSummary(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };


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
          <div className="flex flex-col gap-4 rounded-md border p-4 md:flex-row md:items-center md:justify-between">
            <div className="grid gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date range</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
            </div>
            <Button onClick={handleGenerateReport} disabled={isLoading || !date?.from || !date?.to}>
                {isLoading ? "Generating..." : "Generate Report"}
            </Button>
          </div>

          {/* Section: Report View */}
          <div className="rounded-md border">
            {isLoading && (
                <div className="p-8 text-center text-muted-foreground">
                    Calculating your financial summary...
                </div>
            )}
            {error && (
                <div className="p-8 text-center text-destructive">
                    {error}
                </div>
            )}
            {!isLoading && !error && !summary && (
                <div className="p-8 text-center text-muted-foreground">
                    Your generated report will be displayed here.
                </div>
            )}
            {summary && <ReportView summary={summary} />}
          </div>

           {/* Section: Report Actions - Placeholder functionality */}
           {summary && (
            <div className="flex justify-end gap-2">
                <Button variant="outline" disabled>
                    <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
                <Button disabled>
                    <FileDown className="mr-2 h-4 w-4" /> Export as PDF
                </Button>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
