import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle2, FolderKanban } from 'lucide-react';
import Link from "next/link";
import { MonthlyActivity } from "./page"; // Import the shared type from the main dashboard page

// Define the props structure for our component, now expecting unified activity lists.
interface MonthlyTimelineProps {
  lastMonthActivity: MonthlyActivity[];
  thisMonthActivity: MonthlyActivity[];
  nextMonthActivity: MonthlyActivity[];
}

// A helper component to render the correct icon based on the activity type.
const ActivityIcon = ({ activity }: { activity: MonthlyActivity }) => {
  switch (activity.type) {
    case 'Project':
      return <FolderKanban className="h-5 w-5 mt-0.5 text-blue-500" />;
    case 'Task':
      // Show a green check for completed tasks, otherwise a standard icon.
      return <CheckCircle2 className={`h-5 w-5 mt-0.5 ${activity.isCompleted ? 'text-green-500' : 'text-muted-foreground'}`} />;
    case 'TimelineEvent':
       // Show a purple calendar for completed events, otherwise a standard icon.
      return <Calendar className={`h-5 w-5 mt-0.5 ${activity.isCompleted ? 'text-purple-500' : 'text-muted-foreground'}`} />;
    default:
      return null;
  }
};

// A helper component to render a list of activities or a placeholder message.
const ActivityList = ({ activities }: { activities: MonthlyActivity[] }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8">
        <Calendar className="h-8 w-8 mb-2" />
        <p>No activities for this period.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {activities.map((activity) => (
        <li key={`${activity.type}-${activity.id}`} className="flex items-start space-x-3">
          <div>
            <ActivityIcon activity={activity} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {activity.title}
            </p>
            <p className="text-sm text-muted-foreground">
              {/* Show a different prefix for project creation vs. other due dates */}
              {activity.type === 'Project' ? 'Created: ' : 'Date: '}
              {activity.date.toLocaleDateString()}
            </p>
            {/* For tasks and events, provide a convenient link back to their parent project. */}
            {activity.projectId && activity.projectName && activity.type !== 'Project' && (
                 <Link href={`/dashboard/projects/${activity.projectId}`} className="text-xs text-blue-500 hover:underline">
                    Project: {activity.projectName}
                </Link>
            )}
          </div>
        </li>
      ))}
    </ul>
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
