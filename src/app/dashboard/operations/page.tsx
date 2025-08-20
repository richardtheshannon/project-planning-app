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

async function getOperationalData() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const todayBounds = getDayBounds(today);
  const tomorrowBounds = getDayBounds(tomorrow);

  // --- MODIFICATION: Fetch data for the entire current month for the calendar ---
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  
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
    // FIX: Handle feature request dates the same as other dates
    ...featureRequests
      .filter(fr => fr.dueDate !== null)
      .map(fr => ({
        id: `feature-${fr.id}`, 
        title: fr.title, 
        type: 'Feature Request' as const, 
        dueDate: new Date(fr.dueDate!),
        link: `/dashboard/settings/feature-requests`,
        priority: fr.priority,
        status: fr.status,
        submittedBy: fr.submittedBy
      }))
  );

  // FIX: Use UTC date string comparison to avoid timezone issues
  const todayDateStr = today.toLocaleDateString('en-US', { timeZone: 'UTC' });
  const tomorrowDateStr = tomorrow.toLocaleDateString('en-US', { timeZone: 'UTC' });

  const todayItems = allItems.filter(item => {
    const itemDateStr = new Date(item.dueDate).toLocaleDateString('en-US', { timeZone: 'UTC' });
    return itemDateStr === todayDateStr;
  });

  const tomorrowItems = allItems.filter(item => {
    const itemDateStr = new Date(item.dueDate).toLocaleDateString('en-US', { timeZone: 'UTC' });
    return itemDateStr === tomorrowDateStr;
  });
  
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