// src/app/dashboard/MonthlyTimeline.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, FileText, AlertCircle, DollarSign, CheckSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { MonthlyActivity, OverdueItem } from './page';

interface MonthlyTimelineProps {
  overdueItems: OverdueItem[];
  thisMonthActivity: MonthlyActivity[];
  nextMonthActivity: MonthlyActivity[];
}

const MonthlyTimeline: React.FC<MonthlyTimelineProps> = ({ overdueItems, thisMonthActivity, nextMonthActivity }) => {
  // State for managing collapsed/expanded state of each card
  const [expandedCards, setExpandedCards] = useState({
    overdue: false,      // Start collapsed
    thisMonth: false,    // Start collapsed
    nextMonth: false     // Start collapsed
  });

  const toggleCard = (cardName: 'overdue' | 'thisMonth' | 'nextMonth') => {
    setExpandedCards(prev => ({
      ...prev,
      [cardName]: !prev[cardName]
    }));
  };

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  const getDaysOverdue = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'Project':
        return <Calendar className="h-4 w-4" />;
      case 'TimelineEvent':
        return <Clock className="h-4 w-4" />;
      case 'Invoice':
        return <DollarSign className="h-4 w-4" />;
      case 'FeatureRequest':
        return <CheckSquare className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getItemLink = (item: OverdueItem) => {
    switch (item.type) {
      case 'Project':
        return `/dashboard/projects/${item.projectId}`;
      case 'TimelineEvent':
        return `/dashboard/projects/${item.projectId}`;
      case 'Invoice':
        return `/dashboard/financials/income`;  // Fixed: was /dashboard/financials/invoices
      case 'FeatureRequest':
        return `/dashboard/settings/feature-requests`;  // Fixed: was /dashboard/feature-requests
      default:
        return '#';
    }
  };

  const groupOverdueItems = () => {
    const grouped = {
      projects: [] as OverdueItem[],
      timelineEvents: [] as OverdueItem[],
      invoices: [] as OverdueItem[],
      featureRequests: [] as OverdueItem[]
    };

    overdueItems.forEach(item => {
      switch (item.type) {
        case 'Project':
          grouped.projects.push(item);
          break;
        case 'TimelineEvent':
          grouped.timelineEvents.push(item);
          break;
        case 'Invoice':
          grouped.invoices.push(item);
          break;
        case 'FeatureRequest':
          grouped.featureRequests.push(item);
          break;
      }
    });

    return grouped;
  };

  const groupedOverdue = groupOverdueItems();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Monthly Activity Overview</h2>
      
      {/* Stack cards vertically with space between them */}
      <div className="space-y-4">
        
        {/* Overdue Card */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="cursor-pointer" onClick={() => toggleCard('overdue')}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Overdue
                {overdueItems.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({overdueItems.length} {overdueItems.length === 1 ? 'item' : 'items'})
                  </span>
                )}
              </CardTitle>
              {expandedCards.overdue ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          {expandedCards.overdue && (
            <CardContent>
              {overdueItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No overdue items</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Projects Section */}
                  {groupedOverdue.projects.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Projects</h4>
                      <ul className="space-y-2">
                        {groupedOverdue.projects.map((item) => (
                          <li key={item.id}>
                            <Link href={getItemLink(item)} className="block p-2 rounded-lg hover:bg-accent transition-colors">
                              <div className="flex items-start gap-2">
                                <Calendar className="h-4 w-4 mt-0.5 text-red-500" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{item.title}</p>
                                  <p className="text-xs text-red-600 dark:text-red-400">
                                    {getDaysOverdue(item.date)} days overdue
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Timeline Events Section */}
                  {groupedOverdue.timelineEvents.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Timeline Events</h4>
                      <ul className="space-y-2">
                        {groupedOverdue.timelineEvents.map((item) => (
                          <li key={item.id}>
                            <Link href={getItemLink(item)} className="block p-2 rounded-lg hover:bg-accent transition-colors">
                              <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 mt-0.5 text-orange-500" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{item.title}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {item.projectName}
                                  </p>
                                  <p className="text-xs text-red-600 dark:text-red-400">
                                    {getDaysOverdue(item.date)} days overdue
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Invoices Section */}
                  {groupedOverdue.invoices.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Draft Invoices</h4>
                      <ul className="space-y-2">
                        {groupedOverdue.invoices.map((item) => (
                          <li key={item.id}>
                            <Link href={getItemLink(item)} className="block p-2 rounded-lg hover:bg-accent transition-colors">
                              <div className="flex items-start gap-2">
                                <DollarSign className="h-4 w-4 mt-0.5 text-green-500" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{item.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.clientName} - {new Intl.NumberFormat('en-US', { 
                                      style: 'currency', 
                                      currency: 'USD' 
                                    }).format(item.amount || 0)}
                                  </p>
                                  <p className="text-xs text-red-600 dark:text-red-400">
                                    {getDaysOverdue(item.date)} days overdue
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Feature Requests Section */}
                  {groupedOverdue.featureRequests.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Feature Requests</h4>
                      <ul className="space-y-2">
                        {groupedOverdue.featureRequests.map((item) => (
                          <li key={item.id}>
                            <Link href={getItemLink(item)} className="block p-2 rounded-lg hover:bg-accent transition-colors">
                              <div className="flex items-start gap-2">
                                <CheckSquare className="h-4 w-4 mt-0.5 text-blue-500" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{item.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Status: {item.status}
                                  </p>
                                  <p className="text-xs text-red-600 dark:text-red-400">
                                    {getDaysOverdue(item.date)} days overdue
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* This Month Card */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleCard('thisMonth')}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  This Month
                  {thisMonthActivity.length > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({thisMonthActivity.length} {thisMonthActivity.length === 1 ? 'item' : 'items'})
                    </span>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{currentMonth}</p>
              </div>
              {expandedCards.thisMonth ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          {expandedCards.thisMonth && (
            <CardContent>
              {thisMonthActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No activities for this period.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {thisMonthActivity.map((activity) => (
                    <li key={activity.id}>
                      <Link 
                        href={`/dashboard/projects/${activity.projectId}`}
                        className="block p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          {activity.type === 'Project' ? (
                            <Calendar className="h-4 w-4 mt-0.5 text-blue-500" />
                          ) : (
                            <Clock className="h-4 w-4 mt-0.5 text-purple-500" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {activity.type === 'Project' ? 'Project Due: ' : ''}{activity.title}
                            </p>
                            {activity.type === 'TimelineEvent' && (
                              <p className="text-xs text-muted-foreground truncate">
                                {activity.projectName}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Due: {formatDate(activity.date)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          )}
        </Card>

        {/* Next Month Card */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleCard('nextMonth')}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Next Month
                  {nextMonthActivity.length > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({nextMonthActivity.length} {nextMonthActivity.length === 1 ? 'item' : 'items'})
                    </span>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{nextMonth}</p>
              </div>
              {expandedCards.nextMonth ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          {expandedCards.nextMonth && (
            <CardContent>
              {nextMonthActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No activities for this period.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {nextMonthActivity.map((activity) => (
                    <li key={activity.id}>
                      <Link 
                        href={`/dashboard/projects/${activity.projectId}`}
                        className="block p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          {activity.type === 'Project' ? (
                            <Calendar className="h-4 w-4 mt-0.5 text-blue-500" />
                          ) : (
                            <Clock className="h-4 w-4 mt-0.5 text-purple-500" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {activity.type === 'Project' ? 'Project Due: ' : ''}{activity.title}
                            </p>
                            {activity.type === 'TimelineEvent' && (
                              <p className="text-xs text-muted-foreground truncate">
                                {activity.projectName}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Due: {formatDate(activity.date)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          )}
        </Card>
        
      </div>
    </div>
  );
};

export default MonthlyTimeline;