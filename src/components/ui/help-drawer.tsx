'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpDrawerProps {
  trigger: React.ReactNode;
  title: string;
  summary: string;
  details: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function HelpDrawer({
  trigger,
  title,
  summary,
  details,
  open,
  onOpenChange
}: HelpDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        {trigger}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
        <Dialog.Content
          className={cn(
            "fixed right-0 top-0 h-full w-full sm:w-[400px] bg-background border-l",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
            "duration-300 z-50"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                <Dialog.Title className="text-lg font-semibold">
                  Help & Documentation
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Card/Graph Title */}
                <div>
                  <h3 className="text-xl font-semibold mb-2">{title}</h3>
                  <div className="h-px bg-border" />
                </div>

                {/* Summary Section */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Summary
                  </h4>
                  <p className="text-sm leading-relaxed">{summary}</p>
                </div>

                {/* Detailed Explanation */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Detailed Logic & Calculations
                  </h4>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {details}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-muted/10">
              <p className="text-xs text-muted-foreground text-center">
                Documentation mode can be disabled in Settings → Notifications
              </p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}