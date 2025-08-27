// src/app/dashboard/MonthlyTimeline.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, AlertCircle, DollarSign, CheckSquare, ChevronDown, ChevronUp, Briefcase, CheckCircle2, Lightbulb } from 'lucide-react';
import { HelpEnabledTitle } from '@/components/ui/help-enabled-title';
import { MonthlyActivity } from './page';

interface MonthlyTimelineProps {
  thisMonthActivity: MonthlyActivity[];
  nextMonthActivity: MonthlyActivity[];
}

const MonthlyTimeline: React.FC<MonthlyTimelineProps> = ({ thisMonthActivity, nextMonthActivity }) => {
  // State for managing collapsed/expanded state of each card
  const [expandedCards, setExpandedCards] = useState({
    thisMonth: false,    // Start collapsed
    nextMonth: false     // Start collapsed
  });

  const toggleCard = (cardName: 'thisMonth' | 'nextMonth') => {
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

  const getItemIcon = (activity: MonthlyActivity) => {
    switch (activity.type) {
      case 'Project':
        return <Briefcase className="h-4 w-4 mt-0.5 text-blue-500" />;
      case 'Task':
        return <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />;
      case 'TimelineEvent':
        return <Clock className="h-4 w-4 mt-0.5 text-purple-500" />;
      case 'Invoice':
        return <FileText className="h-4 w-4 mt-0.5 text-orange-500" />;
      case 'FeatureRequest':
        return <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-500" />;
      default:
        return <Calendar className="h-4 w-4 mt-0.5 text-gray-500" />;
    }
  };

  const getItemLink = (activity: MonthlyActivity) => {
    switch (activity.type) {
      case 'Project':
        return `/dashboard/projects/${activity.id}`;
      case 'Task':
        return `/dashboard/projects/${activity.projectId}`;
      case 'TimelineEvent':
        return `/dashboard/projects/${activity.projectId}`;
      case 'Invoice':
        return `/dashboard/financials/invoices/${activity.id}`;
      case 'FeatureRequest':
        return `/dashboard/settings/feature-requests/${activity.id.replace('feature-', '')}`;
      default:
        return '#';
    }
  };

  const getItemPrefix = (activity: MonthlyActivity) => {
    switch (activity.type) {
      case 'Project':
        return 'Project Due: ';
      case 'Task':
        return 'Task Due: ';
      case 'TimelineEvent':
        return '';
      case 'Invoice':
        return '';
      case 'FeatureRequest':
        return 'Feature Due: ';
      default:
        return '';
    }
  };


  return (
    <div className="space-y-4">
      <HelpEnabledTitle
        title="Monthly Activity Overview"
        summary="Displays comprehensive monthly activity overview including all item types due in the current and next month."
        details={
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold mb-2">Item Types Displayed</h5>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Projects:</strong> Projects with end dates in the month</li>
                <li><strong>Tasks:</strong> Tasks with due dates in the month</li>
                <li><strong>Timeline Events:</strong> Uncompleted project milestones scheduled for the month</li>
                <li><strong>Invoices:</strong> Pending or draft invoices due for payment in the month</li>
                <li><strong>Feature Requests:</strong> Active feature requests due in the month</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-2">Month Sections</h5>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>This Month:</strong> All items due in the current month</li>
                <li><strong>Next Month:</strong> All items due in the next month (forward planning)</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-2">Interactive Features</h5>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Click card headers to expand/collapse sections</li>
                <li>Click any item to navigate to its detail page</li>
                <li>Items display with type-specific icons and colors</li>
                <li>Priority and status badges for relevant items</li>
                <li>Project names shown for tasks and timeline events</li>
                <li>Client names shown for invoices</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-2">Filtering Logic</h5>
              <p className="text-sm">Consistent with Operations Dashboard filtering:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Only DRAFT/PENDING invoices are shown</li>
                <li>Only active feature requests (not Done/Canceled)</li>
                <li>Only uncompleted timeline events</li>
                <li>All task and project statuses included</li>
              </ul>
            </div>
          </div>
        }
        className="text-2xl font-bold"
        as="h2"
      />
      
      {/* Stack cards vertically with space between them */}
      <div className="space-y-4">
        
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
                        href={getItemLink(activity)}
                        className="block p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          {getItemIcon(activity)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {getItemPrefix(activity)}{activity.title}
                            </p>
                            {activity.projectName && activity.type !== 'Project' && (
                              <p className="text-xs text-muted-foreground truncate">
                                Project: {activity.projectName}
                              </p>
                            )}
                            {activity.clientName && (
                              <p className="text-xs text-muted-foreground truncate">
                                Client: {activity.clientName}
                              </p>
                            )}
                            {activity.submittedBy && activity.type === 'FeatureRequest' && (
                              <p className="text-xs text-muted-foreground truncate">
                                Submitted by: {activity.submittedBy}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-muted-foreground">
                                Due: {formatDate(activity.date)}
                              </p>
                              {activity.priority && (
                                <Badge 
                                  variant={activity.priority === 'HIGH' || activity.priority === 'high' ? 'destructive' : 'secondary'}
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {activity.priority}
                                </Badge>
                              )}
                              {activity.status && activity.type === 'Invoice' && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {activity.status}
                                </Badge>
                              )}
                            </div>
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
                        href={getItemLink(activity)}
                        className="block p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          {getItemIcon(activity)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {getItemPrefix(activity)}{activity.title}
                            </p>
                            {activity.projectName && activity.type !== 'Project' && (
                              <p className="text-xs text-muted-foreground truncate">
                                Project: {activity.projectName}
                              </p>
                            )}
                            {activity.clientName && (
                              <p className="text-xs text-muted-foreground truncate">
                                Client: {activity.clientName}
                              </p>
                            )}
                            {activity.submittedBy && activity.type === 'FeatureRequest' && (
                              <p className="text-xs text-muted-foreground truncate">
                                Submitted by: {activity.submittedBy}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-muted-foreground">
                                Due: {formatDate(activity.date)}
                              </p>
                              {activity.priority && (
                                <Badge 
                                  variant={activity.priority === 'HIGH' || activity.priority === 'high' ? 'destructive' : 'secondary'}
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {activity.priority}
                                </Badge>
                              )}
                              {activity.status && activity.type === 'Invoice' && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {activity.status}
                                </Badge>
                              )}
                            </div>
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