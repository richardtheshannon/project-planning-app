'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, AlertCircle } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
              <span className="text-base font-semibold">
                Overdue ({items.length} {items.length === 1 ? 'item' : 'items'})
              </span>
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-3">
              {items.map((item) => {
                const daysOverdue = getDaysOverdue(item.dueDate);
                
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors gap-2 sm:gap-4"
                  >
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
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}