import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import DailyItemsCard, { OperationalItem } from "./components/DailyItemsCard";
import InteractiveCalendar from "./components/InteractiveCalendar"; // Import the new calendar component
import { ContractTerm } from "@prisma/client";
import { addMonths, isWithinInterval, startOfMonth, endOfMonth, startOfDay, endOfDay, format } from "date-fns";

const getDayBounds = (date: Date) => {
  const start = startOfDay(date);
  const end = endOfDay(date);
  return { start, end };
};

const getMonthsFromTerm = (term: ContractTerm): number => {
    switch (term) {
        case ContractTerm.ONE_MONTH: return 1;
        case ContractTerm.THREE_MONTH: return 3;
        case ContractTerm.SIX_MONTH: return 6;
        case ContractTerm.ONE_YEAR: return 12;
        default: return 0;
    }
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

  // --- MODIFICATION: Fetch data for the entire current month for the calendar ---
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  const [
    projects,
    tasks,
    timelineEvents,
    invoices,
    recurringClients,
    featureRequests // Added feature requests to the fetch
  ] = await Promise.all([
    prisma.project.findMany({
      where: { endDate: { gte: monthStart, lte: monthEnd } },
      select: { id: true, name: true, endDate: true }
    }),
    prisma.task.findMany({
      where: { dueDate: { gte: monthStart, lte: monthEnd } },
      select: { id: true, title: true, dueDate: true, projectId: true, project: { select: { name: true } } }
    }),
    prisma.timelineEvent.findMany({
      where: { eventDate: { gte: monthStart, lte: monthEnd }, isCompleted: false },
      select: { id: true, title: true, eventDate: true, projectId: true, project: { select: { name: true } } }
    }),
    prisma.invoice.findMany({
      where: { dueDate: { gte: monthStart, lte: monthEnd } },
      select: { id: true, invoiceNumber: true, dueDate: true, client: { select: { name: true } } }
    }),
    prisma.client.findMany({
        where: { contractStartDate: { not: null }, contractTerm: { not: 'ONE_TIME' }, frequency: 'monthly' },
        select: { id: true, name: true, contractStartDate: true, contractTerm: true }
    }),
    // New: Fetch feature requests with due dates in the current month
    prisma.featureRequest.findMany({
      where: { 
        dueDate: { 
          not: null,
          gte: monthStart, 
          lte: monthEnd 
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

  recurringClients.forEach(client => {
      if (!client.contractStartDate) return;
      const startDate = new Date(client.contractStartDate);
      const termInMonths = getMonthsFromTerm(client.contractTerm);
      for (let i = 0; i < termInMonths * 4; i++) { // Extend recurring items for visibility in calendar
          const paymentDate = addMonths(startDate, i);
          if (isWithinInterval(paymentDate, { start: monthStart, end: addMonths(monthEnd, 12) })) { // Look ahead 12 months
              allItems.push({
                  id: `${client.id}-month-${i}`,
                  title: `Recurring Payment`,
                  type: 'Client Contract' as const,
                  dueDate: paymentDate,
                  link: `/dashboard/financials`,
                  clientName: client.name
              });
          }
      }
  });

  allItems.push(
    ...projects.filter(p => p.endDate).map(p => ({ id: p.id, title: p.name, type: 'Project' as const, dueDate: p.endDate!, link: `/dashboard/projects/${p.id}` })),
    ...tasks.filter(t => t.dueDate).map(t => ({ id: t.id, title: t.title, type: 'Task' as const, dueDate: t.dueDate!, link: `/dashboard/projects/${t.projectId}`, projectName: t.project.name })),
    ...timelineEvents.filter(te => te.eventDate).map(te => ({ id: te.id, title: te.title, type: 'Timeline Event' as const, dueDate: te.eventDate!, link: `/dashboard/projects/${te.projectId}`, projectName: te.project.name })),
    ...invoices.filter(i => i.dueDate).map(i => ({ id: i.id, title: `Invoice #${i.invoiceNumber}`, type: 'Invoice' as const, dueDate: i.dueDate!, link: `/dashboard/financials`, clientName: i.client.name })),
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

  // Return all items for the calendar, plus specific items for the cards
  return { allItems, todayItems, tomorrowItems };
}


export default async function OperationsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return <div>Please sign in to view this page.</div>;
  }

  const { allItems, todayItems, tomorrowItems } = await getOperationalData();

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Operations Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          A daily overview of all time-sensitive items across your projects and financials.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <DailyItemsCard title="Today" items={todayItems} />
        <DailyItemsCard title="Tomorrow" items={tomorrowItems} />
      </div>

      {/* --- NEW: Interactive Calendar Section --- */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">Activity Calendar</h2>
        <InteractiveCalendar allItems={allItems} />
      </div>
    </div>
  );
}