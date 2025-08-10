"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Expense, ExpenseCategory } from "@prisma/client";
import { ArrowUpDown } from "lucide-react";

// Define the types for sorting
type SortKey = keyof Expense | '';
type SortDirection = 'ascending' | 'descending';

interface ExpensesDataTableProps {
  data: Expense[];
  onExpenseSelect: (expense: Expense) => void;
}

export function ExpensesDataTable({ data, onExpenseSelect }: ExpensesDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'date', direction: 'descending' });

  // Helper to format category names
  const formatCategory = (category: ExpenseCategory) => {
    return category.replace('_', ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  // Filter expenses based on the search term (description)
  const filteredExpenses = useMemo(() => {
    return data.filter(expense =>
      expense.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Sort the filtered expenses
  const sortedExpenses = useMemo(() => {
    let sortableItems = [...filteredExpenses];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Expense];
        const bValue = b[sortConfig.key as keyof Expense];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredExpenses, sortConfig]);

  // Function to request a sort change
  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Reusable component for sortable table headers
  const SortableHeader = ({ sortKey, children, className }: { sortKey: SortKey, children: React.ReactNode, className?: string }) => (
    <TableHead className={className}>
      <Button variant="ghost" onClick={() => requestSort(sortKey)}>
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter expenses by description..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader sortKey="description">Description</SortableHeader>
              <SortableHeader sortKey="category">Category</SortableHeader>
              <SortableHeader sortKey="date">Date</SortableHeader>
              <SortableHeader sortKey="amount" className="text-right">Amount</SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExpenses.length > 0 ? (
              sortedExpenses.map((expense) => (
                <TableRow key={expense.id} onClick={() => onExpenseSelect(expense)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{formatCategory(expense.category)}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(expense.amount)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
