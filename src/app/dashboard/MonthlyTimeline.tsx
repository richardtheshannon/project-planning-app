import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FolderKanban } from 'lucide-react';
import Link from "next/link";
import { MonthlyActivity } from "./page";

// Props structure remains the same
interface MonthlyTimelineProps {
  lastMonthActivity: MonthlyActivity[];
  thisMonthActivity: MonthlyActivity[];
  nextMonthActivity: MonthlyActivity[];
}

// Icon helper remains mostly the same, just removed the 'Task' case
const ActivityIcon = ({ activity }: { activity: MonthlyActivity }) => {
  switch (activity.type) {
    case 'Project':
      return <FolderKanban className="h-5 w-5 mt-0.5 text-blue-500" />;
    case 'TimelineEvent':
      return <Calendar className={`h-5 w-5 mt-0.5 ${activity.isCompleted ? 'text-purple-500' : 'text-muted-foreground'}`} />;
    default:
      return null;
  }
};

// The ActivityList component now groups items by type
const ActivityList = ({ activities }: { activities: MonthlyActivity[] }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8">
        <Calendar className="h-8 w-8 mb-2" />
        <p>No activities for this period.</p>
      </div>
    );
  }

  // Filter activities into separate arrays for projects and events
  const projects = activities.filter(a => a.type === 'Project');
  const timelineEvents = activities.filter(a => a.type === 'TimelineEvent');

  // MODIFIED: Helper to render a single list item with contextual titles
  const renderActivityItem = (activity: MonthlyActivity) => (
    <li key={`${activity.type}-${activity.id}`} className="flex items-start space-x-3">
      <div>
        <ActivityIcon activity={activity} />
      </div>
      <div className="flex-1 min-w-0">
        <Link href={`/dashboard/projects/${activity.projectId || activity.id}`} className="text-sm font-medium text-foreground truncate hover:underline">
          {activity.type === 'TimelineEvent' && activity.projectName 
            ? `${activity.projectName}: ${activity.title}` 
            : activity.title}
        </Link>
        <p className="text-sm text-muted-foreground">
          {activity.type === 'Project' ? 'Due: ' : 'Date: '}
          {activity.date.toLocaleDateString()}
        </p>
      </div>
    </li>
  );

  return (
    <div className="space-y-6">
      {projects.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Projects Due</h4>
          <hr/>
          <ul className="space-y-4 pt-2">
            {projects.map(renderActivityItem)}
          </ul>
        </div>
      )}

      {timelineEvents.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Timeline Events</h4>
          <hr/>
          <ul className="space-y-4 pt-2">
            {timelineEvents.map(renderActivityItem)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function MonthlyTimeline({ lastMonthActivity, thisMonthActivity, nextMonthActivity }: MonthlyTimelineProps) {
  return (
    <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">Monthly Activity Overview</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle>Last Month</CardTitle>
                </CardHeader>
                <CardContent>
                    <ActivityList activities={lastMonthActivity} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>This Month</CardTitle>
                </CardHeader>
                <CardContent>
                    <ActivityList activities={thisMonthActivity} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Next Month</CardTitle>
                </CardHeader>
                <CardContent>
                    <ActivityList activities={nextMonthActivity} />
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
