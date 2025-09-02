import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { prisma } from "@/lib/prisma";
import InteractiveCalendar from "../components/InteractiveCalendar";
import { OperationalItem } from "../components/DailyItemsCard";
import { startOfMonth, endOfMonth } from "date-fns";

async function getCalendarData() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  const [
    projects,
    tasks,
    timelineEvents,
    invoices,
    featureRequests
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
      where: { 
        dueDate: { gte: monthStart, lte: monthEnd },
        status: { in: ['DRAFT', 'PENDING'] }
      },
      select: { id: true, invoiceNumber: true, dueDate: true, status: true, client: { select: { name: true } } }
    }),
    prisma.featureRequest.findMany({
      where: { 
        dueDate: { 
          not: null,
          gte: monthStart, 
          lte: monthEnd 
        },
        status: { 
          notIn: ['Done', 'Canceled']
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
    ...featureRequests
      .filter(fr => fr.dueDate !== null)
      .map(fr => ({
        id: `feature-${fr.id}`, 
        title: fr.title, 
        type: 'Feature Request' as const, 
        dueDate: new Date(fr.dueDate!),
        link: `/dashboard/settings/feature-requests/${fr.id}`,
        priority: fr.priority,
        status: fr.status,
        submittedBy: fr.submittedBy
      }))
  );

  return allItems;
}

export default async function OperationsCalendarPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return <div>Please sign in to view this page.</div>;
  }

  const allItems = await getCalendarData();

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Operations Calendar</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            A comprehensive calendar view of all time-sensitive items across your projects and financials.
          </p>
        </div>

        <InteractiveCalendar allItems={allItems} />
      </div>
    </div>
  );
}