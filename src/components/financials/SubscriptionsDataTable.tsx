"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { format } from "date-fns";

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
import { Subscription } from "@prisma/client";
import { ArrowUpDown } from "lucide-react";

// Define the types for sorting
type SortKey = keyof Subscription | '';
type SortDirection = 'ascending' | 'descending';

interface SubscriptionsDataTableProps {
  data: Subscription[];
}

export function SubscriptionsDataTable({ data }: SubscriptionsDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'ascending' });

  // Filter subscriptions based on the search term
  const filteredSubscriptions = useMemo(() => {
    return data.filter(subscription =>
      subscription.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Sort the filtered subscriptions based on the sort configuration
  const sortedSubscriptions = useMemo(() => {
    let sortableItems = [...filteredSubscriptions];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Subscription];
        const bValue = b[sortConfig.key as keyof Subscription];

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
  }, [filteredSubscriptions, sortConfig]);

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
          placeholder="Filter subscriptions by name..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader sortKey="name">Name</SortableHeader>
              <SortableHeader sortKey="billingCycle">Billing Cycle</SortableHeader>
              <SortableHeader sortKey="dueDate">Due Date</SortableHeader>
              <SortableHeader sortKey="amount" className="text-right">Amount</SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSubscriptions.length > 0 ? (
              sortedSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">{subscription.name}</TableCell>
                  <TableCell>{subscription.billingCycle}</TableCell>
                  <TableCell>
                    {subscription.dueDate ? format(new Date(subscription.dueDate), "MMM dd, yyyy") : <span className="text-muted-foreground">N/A</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(subscription.amount)}
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
