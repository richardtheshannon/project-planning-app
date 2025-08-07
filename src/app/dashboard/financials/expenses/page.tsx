import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function ExpensesPage() {
  return (
    <div className="space-y-8">
      {/* Section: Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>
              Log and categorize your business expenses.
            </CardDescription>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Log Expense
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A table of your logged expenses will be displayed here.
          </p>
          {/* Placeholder for future Expenses table */}
        </CardContent>
      </Card>

      {/* Section: Subscriptions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subscriptions</CardTitle>
            <CardDescription>
              Track your recurring monthly and annual subscriptions.
            </CardDescription>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Subscription
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A table of your recurring subscriptions will be displayed here.
          </p>
          {/* Placeholder for future Subscriptions table */}
        </CardContent>
      </Card>

      {/* Section: Budgeting */}
      <Card>
        <CardHeader>
          <CardTitle>Budgeting</CardTitle>
          <CardDescription>
            Set and track your monthly spending goals by category.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground">
            Your budgeting tools and progress bars will be displayed here.
          </p>
          {/* Placeholder for future Budgeting tool */}
        </CardContent>
      </Card>
    </div>
  );
}
