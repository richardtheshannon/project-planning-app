'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Clock, AlertCircle } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpEnabledTitle } from '@/components/ui/help-enabled-title';
import { useHelpMode } from '@/hooks/use-help-mode';

interface OverdueItem {
  id: string;
  title: string;
  type: 'task' | 'timeline_event' | 'invoice' | 'project' | 'feature_request';
  dueDate: Date;
  projectName?: string;
  projectId?: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high';
  clientName?: string;
}

interface OverdueCardProps {
  items: OverdueItem[];
  className?: string;
}

export function OverdueCard({ items, className }: OverdueCardProps) {
  const today = new Date();
  const { isHelpModeEnabled } = useHelpMode();

  const getDaysOverdue = (dueDate: Date) => {
    return differenceInDays(today, new Date(dueDate));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'timeline_event':
        return <Clock className="h-4 w-4" />;
      case 'invoice':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'timeline_event':
        return 'Timeline Event';
      case 'invoice':
        return 'Invoice';
      case 'task':
        return 'Task';
      case 'project':
        return 'Project';
      case 'feature_request':
        return 'Feature Request';
      default:
        return type;
    }
  };

  const getItemLink = (item: OverdueItem) => {
    switch (item.type) {
      case 'project':
        return `/dashboard/projects/${item.id}`;
      case 'task':
        return `/dashboard/projects/${item.projectId}`;
      case 'timeline_event':
        return `/dashboard/projects/${item.projectId}`;
      case 'invoice':
        return `/dashboard/financials/invoices/${item.id}`;
      case 'feature_request':
        return `/dashboard/settings/feature-requests/${item.id}`;
      default:
        return '#';
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <Accordion type="single" collapsible>
        <AccordionItem value="overdue-items" className="border-0">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {isHelpModeEnabled ? (
                <HelpEnabledTitle
                  title={`Overdue (${items.length} ${items.length === 1 ? 'item' : 'items'})`}
                  summary="Lists all overdue items that are past their due date and require immediate attention."
                  details={
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold mb-2">Item Types Displayed</h5>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li><strong>Tasks:</strong> Incomplete tasks past their due date</li>
                          <li><strong>Timeline Events:</strong> Uncompleted project milestones that have passed</li>
                          <li><strong>Feature Requests:</strong> Pending or in-progress features past their due date</li>
                          <li><strong>Invoices:</strong> Pending or draft invoices past their payment due date</li>
                          <li><strong>Projects:</strong> Active projects past their target end date</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold mb-2">Priority Indicators</h5>
                        <p className="text-sm mb-2">Items are displayed with:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li><strong>Days overdue:</strong> Shows how urgent the item is</li>
                          <li><strong>Original due date:</strong> When it was supposed to be completed</li>
                          <li><strong>Priority badges:</strong> High priority items shown in red</li>
                          <li><strong>Type badges:</strong> Quickly identify the kind of overdue item</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold mb-2">Actions</h5>
                        <p className="text-sm mb-2">Click any item to navigate to its detail page for more information or to take action.</p>
                        <p className="text-sm mb-2">Recommended workflow:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Review overdue items daily</li>
                          <li>Prioritize based on business impact</li>
                          <li>Update stakeholders on delayed items</li>
                          <li>Reschedule or delegate as needed</li>
                        </ul>
                      </div>
                    </div>
                  }
                  className="text-base font-semibold"
                  as="p"
                />
              ) : (
                <span className="text-base font-semibold">
                  Overdue ({items.length} {items.length === 1 ? 'item' : 'items'})
                </span>
              )}
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-3">
              {items.map((item) => {
                const daysOverdue = getDaysOverdue(item.dueDate);
                const itemLink = getItemLink(item);
                
                return (
                  <Link
                    key={item.id}
                    href={itemLink}
                    className="block"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors gap-2 sm:gap-4 cursor-pointer">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-0.5">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="font-medium text-sm">{item.title}</div>
                          {item.projectName && (
                            <div className="text-xs text-muted-foreground">
                              {item.projectName}
                            </div>
                          )}
                          {item.clientName && (
                            <div className="text-xs text-muted-foreground">
                              Client: {item.clientName}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="outline" className="h-5">
                              {getTypeLabel(item.type)}
                            </Badge>
                            {item.priority && (
                              <Badge 
                                variant={item.priority === 'high' ? 'destructive' : 'secondary'}
                                className="h-5"
                              >
                                {item.priority}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-destructive">
                          {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Due {format(new Date(item.dueDate), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}