import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { prisma } from "@/lib/prisma";
import DailyItemsCard, { OperationalItem } from "./components/DailyItemsCard";
import { OverdueCard } from "@/components/operations/OverdueCard";
import { getOverdueItems } from "@/lib/operations-data";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";

// Add caching: revalidate every 2 minutes for operations data (more frequent for time-sensitive data)
export const revalidate = 120;

const getDayBounds = (date: Date) => {
  const start = startOfDay(date);
  const end = endOfDay(date);
  return { start, end };
};


// FIX: Use the EXACT same helper function as InteractiveCalendar.tsx
const isSameDayUTC = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1).toLocaleDateString('en-US', { timeZone: 'UTC' });
  const d2 = new Date(date2).toLocaleDateString('en-US', { timeZone: 'UTC' });
  return d1 === d2;
};

async function getOperationalData() {
  // FIX: Create dates that represent the LOCAL calendar date at midnight UTC
  // This matches how the dates are stored in the database
  const now = new Date();
  
  // Get the local date components
  const localYear = now.getFullYear();
  const localMonth = now.getMonth();
  const localDay = now.getDate();
  
  // Create dates at midnight UTC for the LOCAL calendar date
  // This ensures we're comparing the right calendar dates regardless of timezone
  const today = new Date(Date.UTC(localYear, localMonth, localDay, 0, 0, 0));
  const tomorrow = new Date(Date.UTC(localYear, localMonth, localDay + 1, 0, 0, 0));

  const todayBounds = getDayBounds(now);
  const tomorrowBounds = getDayBounds(new Date(now.getTime() + 24 * 60 * 60 * 1000));

  // Fetch data for today and tomorrow only (no longer need full month)
  const todayStart = todayBounds.start;
  const tomorrowEnd = tomorrowBounds.end;
  
  const [
    projects,
    tasks,
    timelineEvents,
    invoices,
    featureRequests // Added feature requests to the fetch
  ] = await Promise.all([
    prisma.project.findMany({
      where: { endDate: { gte: todayStart, lte: tomorrowEnd } },
      select: { id: true, name: true, endDate: true }
    }),
    prisma.task.findMany({
      where: { dueDate: { gte: todayStart, lte: tomorrowEnd } },
      select: { id: true, title: true, dueDate: true, projectId: true, project: { select: { name: true } } }
    }),
    prisma.timelineEvent.findMany({
      where: { eventDate: { gte: todayStart, lte: tomorrowEnd }, isCompleted: false },
      select: { id: true, title: true, eventDate: true, projectId: true, project: { select: { name: true } } }
    }),
    prisma.invoice.findMany({
      where: { 
        dueDate: { gte: todayStart, lte: tomorrowEnd },
        status: { in: ['DRAFT', 'PENDING'] }
      },
      select: { id: true, invoiceNumber: true, dueDate: true, status: true, client: { select: { name: true } } }
    }),
    // Fetch feature requests with due dates for today and tomorrow
    prisma.featureRequest.findMany({
      where: { 
        dueDate: { 
          not: null,
          gte: todayStart, 
          lte: tomorrowEnd 
        },
        status: { 
          notIn: ['Done', 'Canceled'] // Only show active feature requests
        }
      },
      select: { 
        id: true, 
        title: true, 
        dueDate: true, 
        status: true, 
        priority: true,
        submittedBy: true 
      }
    })
  ]);

  const allItems: OperationalItem[] = [];


  allItems.push(
    ...projects.filter(p => p.endDate).map(p => ({ id: p.id, title: p.name, type: 'Project' as const, dueDate: p.endDate!, link: `/dashboard/projects/${p.id}` })),
    ...tasks.filter(t => t.dueDate).map(t => ({ id: t.id, title: t.title, type: 'Task' as const, dueDate: t.dueDate!, link: `/dashboard/projects/${t.projectId}`, projectName: t.project.name })),
    ...timelineEvents.filter(te => te.eventDate).map(te => ({ id: te.id, title: te.title, type: 'Timeline Event' as const, dueDate: te.eventDate!, link: `/dashboard/projects/${te.projectId}`, projectName: te.project.name })),
    ...invoices.filter(i => i.dueDate).map(i => ({ id: i.id, title: `Invoice #${i.invoiceNumber}`, type: 'Invoice' as const, dueDate: i.dueDate!, link: `/dashboard/financials/invoices/${i.id}`, clientName: i.client.name, status: i.status })),
    // UPDATED: Feature requests now link to their individual pages
    ...featureRequests
      .filter(fr => fr.dueDate !== null)
      .map(fr => ({
        id: `feature-${fr.id}`, 
        title: fr.title, 
        type: 'Feature Request' as const, 
        dueDate: new Date(fr.dueDate!),
        link: `/dashboard/settings/feature-requests/${fr.id}`, // CHANGED: Now links to individual feature request page
        priority: fr.priority,
        status: fr.status,
        submittedBy: fr.submittedBy
      }))
  );

  // FIX: Use the same isSameDayUTC function as the calendar for filtering
  const todayItems = allItems.filter(item => isSameDayUTC(item.dueDate, today));
  const tomorrowItems = allItems.filter(item => isSameDayUTC(item.dueDate, tomorrow));
  
  const sortFn = (a: OperationalItem, b: OperationalItem) => a.dueDate.getTime() - b.dueDate.getTime();
  todayItems.sort(sortFn);
  tomorrowItems.sort(sortFn);

  // Return specific items for the cards only (no longer need allItems for calendar)
  return { todayItems, tomorrowItems };
}


export default async function OperationsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return <div>Please sign in to view this page.</div>;
  }

  const { todayItems, tomorrowItems } = await getOperationalData();
  const overdueItems = await getOverdueItems();

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Operations Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            A daily overview of all time-sensitive items across your projects and financials.
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <DailyItemsCard title="Today" items={todayItems} />
          <DailyItemsCard title="Tomorrow" items={tomorrowItems} />
        </div>

        {/* NEW: Overdue Card */}
        {overdueItems.length > 0 && (
          <OverdueCard 
            items={overdueItems}
            className="w-full"
          />
        )}

      </div>
    </div>
  );
}