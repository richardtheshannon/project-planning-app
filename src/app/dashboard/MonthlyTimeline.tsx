// src/app/dashboard/MonthlyTimeline.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, FileText, AlertCircle, DollarSign, CheckSquare, ChevronDown, ChevronUp } from 'lucide-react';
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


  return (
    <div className="space-y-4">
      <HelpEnabledTitle
        title="Monthly Activity Overview"
        summary="Displays current month activities and upcoming next month activities for project planning."
        details={
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold mb-2">This Month Section</h5>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`// Get current month activities
const thisMonthStart = startOfMonth(today);
const thisMonthEnd = endOfMonth(today);

// Projects ending this month
projects.where({ 
  endDate: { gte: thisMonthStart, lte: thisMonthEnd } 
})

// Timeline events scheduled this month  
timelineEvents.where({
  eventDate: { gte: thisMonthStart, lte: thisMonthEnd },
  isCompleted: false
})`}
              </pre>
            </div>
            
            <div>
              <h5 className="font-semibold mb-2">Next Month Section</h5>
              <p className="text-sm">Same logic as "This Month" but for next month's date range. Helps with forward planning.</p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-2">Interactive Features</h5>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Click card headers to expand/collapse sections</li>
                <li>Click items to navigate to their detail pages</li>
                <li>Items are grouped by type with appropriate icons</li>
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