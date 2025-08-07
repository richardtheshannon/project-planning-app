"use client"; // Needed for usePathname hook

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from 'react';

// Define the navigation items based on the feature outline
const navItems = [
  { name: 'Overview', href: '/dashboard/financials' },
  { name: 'Income', href: '/dashboard/financials/income' },
  { name: 'Expenses', href: '/dashboard/financials/expenses' },
  { name: 'Reports', href: '/dashboard/financials/reports' },
  { name: 'Documents', href: '/dashboard/financials/documents' },
];

export default function FinancialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-10">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Financials</h2>
        <p className="text-muted-foreground">
          Manage your clients, invoices, expenses, and view financial reports.
        </p>
      </div>

      {/* Horizontal Navigation - always horizontal and wraps on smaller screens */}
      <nav className="flex flex-wrap items-center gap-2 border-b pb-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
              pathname === item.href
                ? 'bg-muted font-bold text-primary'
                : 'text-muted-foreground'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Page Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
