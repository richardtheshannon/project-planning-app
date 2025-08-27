'use client';

import React from 'react';
import { CloseableNotification } from '@/components/ui/closeable-notification';
import { useCloseableNotifications } from '@/lib/hooks/useCloseableNotifications';

export function FinancialChartNotification() {
  const { enableCloseableNotifications, closedNotifications } = useCloseableNotifications();

  return (
    <CloseableNotification
      id="dashboard-graph-logic"
      title="Graph Logic"
      message="This graph displays monthly revenue trends calculated from completed project invoices. Data points represent the sum of all paid invoices for each month, with projections based on active project timelines."
      type="info"
      isEnabled={enableCloseableNotifications}
      closedNotifications={closedNotifications}
    />
  );
}

export function MetricCardsNotifications() {
  const { enableCloseableNotifications, closedNotifications } = useCloseableNotifications();

  return (
    <>
      {/* Total Forecast Notification */}
      <CloseableNotification
        id="total-forecast-logic"
        message="Total Forecast represents the sum of all active and pending project values, calculated from project budgets and expected completion dates."
        type="info"
        isEnabled={enableCloseableNotifications}
        closedNotifications={closedNotifications}
      />
      
      {/* Total Projects Notification */}
      <CloseableNotification
        id="total-projects-logic"
        message="Shows the count of all projects regardless of status. This includes active, completed, and pending projects."
        type="info"
        isEnabled={enableCloseableNotifications}
        closedNotifications={closedNotifications}
      />
      
      {/* Active Tasks Notification */}
      <CloseableNotification
        id="active-tasks-logic"
        message="Displays tasks currently in progress or pending. Does not include completed or cancelled tasks."
        type="info"
        isEnabled={enableCloseableNotifications}
        closedNotifications={closedNotifications}
      />
      
      {/* Tasks Completed Notification */}
      <CloseableNotification
        id="tasks-completed-logic"
        message="Shows the total number of tasks marked as completed across all projects in the current week."
        type="info"
        isEnabled={enableCloseableNotifications}
        closedNotifications={closedNotifications}
      />
    </>
  );
}