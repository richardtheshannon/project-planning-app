import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import DailyItemsCard, { OperationalItem } from "./components/DailyItemsCard";
import { ContractTerm } from "@prisma/client";
import { addMonths, isWithinInterval } from "date-fns";

const getDayBounds = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const start = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  return { start, end };
};

// Helper to convert contract term enum to a number of months
const getMonthsFromTerm = (term: ContractTerm): number => {
    switch (term) {
        case ContractTerm.ONE_MONTH: return 1;
        case ContractTerm.THREE_MONTH: return 3;
        case ContractTerm.SIX_MONTH: return 6;
        case ContractTerm.ONE_YEAR: return 12;
        default: return 0;
    }
};

// MODIFIED: The userId parameter is no longer needed as we are fetching all data.
async function getOperationalData() {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const yesterdayBounds = getDayBounds(yesterday);
  const todayBounds = getDayBounds(today);
  const tomorrowBounds = getDayBounds(tomorrow);
  
  const relevantInterval = { start: yesterdayBounds.start, end: tomorrowBounds.end };

  const [
    projects,
    tasks,
    timelineEvents,
    invoices,
    recurringClients
  ] = await Promise.all([
    // MODIFIED: Removed 'ownerId: userId' to fetch all projects
    prisma.project.findMany({
      where: { endDate: { gte: yesterdayBounds.start, lte: tomorrowBounds.end } },
      select: { id: true, name: true, endDate: true }
    }),
    // MODIFIED: Removed 'project: { ownerId: userId }' to fetch all tasks
    prisma.task.findMany({
      where: { dueDate: { gte: yesterdayBounds.start, lte: tomorrowBounds.end } },
      select: { id: true, title: true, dueDate: true, projectId: true, project: { select: { name: true } } }
    }),
    // MODIFIED: Removed 'project: { ownerId: userId }' to fetch all timeline events
    prisma.timelineEvent.findMany({
      where: { eventDate: { gte: yesterdayBounds.start, lte: tomorrowBounds.end }, isCompleted: false },
      select: { id: true, title: true, eventDate: true, projectId: true, project: { select: { name: true } } }
    }),
    // MODIFIED: Removed 'userId: userId' to fetch all invoices
    prisma.invoice.findMany({
      where: { dueDate: { gte: yesterdayBounds.start, lte: tomorrowBounds.end } },
      select: { id: true, invoiceNumber: true, dueDate: true, client: { select: { name: true } } }
    }),
    // MODIFIED: Removed 'userId' to fetch all recurring clients
    prisma.client.findMany({
        where: { contractStartDate: { not: null }, contractTerm: { not: 'ONE_TIME' }, frequency: 'monthly' },
        select: { id: true, name: true, contractStartDate: true, contractTerm: true }
    })
  ]);

  const clientContractItems: OperationalItem[] = [];
  recurringClients.forEach(client => {
      if (!client.contractStartDate) return;
      
      const startDate = new Date(client.contractStartDate);
      const termInMonths = getMonthsFromTerm(client.contractTerm);

      for (let i = 0; i < termInMonths; i++) {
          const paymentDate = addMonths(startDate, i);
          
          if (isWithinInterval(paymentDate, relevantInterval)) {
              clientContractItems.push({
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


  const allItems: OperationalItem[] = [
    ...projects.filter(p => p.endDate).map(p => ({ id: p.id, title: p.name, type: 'Project' as const, dueDate: p.endDate!, link: `/dashboard/projects/${p.id}` })),
    ...tasks.filter(t => t.dueDate).map(t => ({ id: t.id, title: t.title, type: 'Task' as const, dueDate: t.dueDate!, link: `/dashboard/projects/${t.projectId}`, projectName: t.project.name })),
    ...timelineEvents.filter(te => te.eventDate).map(te => ({ id: te.id, title: te.title, type: 'Timeline Event' as const, dueDate: te.eventDate!, link: `/dashboard/projects/${te.projectId}`, projectName: te.project.name })),
    ...invoices.filter(i => i.dueDate).map(i => ({ id: i.id, title: `Invoice #${i.invoiceNumber}`, type: 'Invoice' as const, dueDate: i.dueDate!, link: `/dashboard/financials`, clientName: i.client.name })),
    ...clientContractItems
  ];

  const yesterdayItems = allItems.filter(item => isWithinInterval(item.dueDate, { start: yesterdayBounds.start, end: yesterdayBounds.end }));
  const todayItems = allItems.filter(item => isWithinInterval(item.dueDate, { start: todayBounds.start, end: todayBounds.end }));
  const tomorrowItems = allItems.filter(item => isWithinInterval(item.dueDate, { start: tomorrowBounds.start, end: tomorrowBounds.end }));
  
  const sortFn = (a: OperationalItem, b: OperationalItem) => a.dueDate.getTime() - b.dueDate.getTime();
  yesterdayItems.sort(sortFn);
  todayItems.sort(sortFn);
  tomorrowItems.sort(sortFn);

  return { yesterdayItems, todayItems, tomorrowItems };
}


export default async function OperationsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return <div>Please sign in to view this page.</div>;
  }

  // MODIFIED: The function no longer requires a userId to be passed.
  const { yesterdayItems, todayItems, tomorrowItems } = await getOperationalData();

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Operations Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          A daily overview of all time-sensitive items across your projects and financials.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <DailyItemsCard title="Yesterday" items={yesterdayItems} />
        <DailyItemsCard title="Today" items={todayItems} />
        <DailyItemsCard title="Tomorrow" items={tomorrowItems} />
      </div>
    </div>
  );
}
