import { prisma } from '@/lib/prisma';

export async function getOverdueItems() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch overdue timeline events
  const overdueTimelineEvents = await prisma.timelineEvent.findMany({
    where: {
      eventDate: {
        lt: today
      },
      isCompleted: false
    },
    include: {
      project: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      eventDate: 'asc'
    }
  });

  // Fetch overdue tasks
  const overdueTasks = await prisma.task.findMany({
    where: {
      dueDate: {
        lt: today
      },
      status: {
        notIn: ['COMPLETED', 'CANCELLED']
      }
    },
    include: {
      project: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      dueDate: 'asc'
    }
  });

  // Fetch overdue invoices
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      dueDate: {
        lt: today
      },
      status: {
        notIn: ['PAID']
      }
    },
    include: {
      client: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      dueDate: 'asc'
    }
  });

  // Fetch overdue projects
  const overdueProjects = await prisma.project.findMany({
    where: {
      endDate: {
        lt: today
      },
      status: {
        notIn: ['COMPLETED', 'CANCELLED', 'ON_HOLD']
      }
    },
    orderBy: {
      endDate: 'asc'
    }
  });

  // Fetch overdue feature requests
  const overdueFeatureRequests = await prisma.featureRequest.findMany({
    where: {
      dueDate: {
        lt: today
      },
      status: {
        in: ['Pending', 'In Progress']
      }
    },
    orderBy: {
      dueDate: 'asc'
    }
  });

  // Transform and combine all overdue items
  const allOverdueItems = [
    ...overdueTimelineEvents.map(event => ({
      id: event.id,
      title: event.title,
      type: 'timeline_event' as const,
      dueDate: event.eventDate!,
      projectName: event.project?.name,
      projectId: event.project?.id,
      status: event.isCompleted ? 'COMPLETED' : 'PENDING',
      priority: 'medium' as const
    })),
    ...overdueTasks.map(task => ({
      id: task.id,
      title: task.title,
      type: 'task' as const,
      dueDate: task.dueDate!,
      projectName: task.project?.name,
      projectId: task.project?.id,
      status: task.status,
      priority: task.priority?.toLowerCase() as 'low' | 'medium' | 'high'
    })),
    ...overdueInvoices.map(invoice => ({
      id: invoice.id,
      title: `Invoice #${invoice.invoiceNumber}`,
      type: 'invoice' as const,
      dueDate: invoice.dueDate!,
      clientName: invoice.client?.name,
      status: invoice.status,
      priority: 'high' as const
    })),
    ...overdueProjects.map(project => ({
      id: project.id,
      title: project.name,
      type: 'project' as const,
      dueDate: project.endDate!,
      status: project.status,
      priority: project.priority?.toLowerCase() as 'low' | 'medium' | 'high'
    })),
    ...overdueFeatureRequests.map(request => ({
      id: request.id.toString(),
      title: request.title,
      type: 'feature_request' as const,
      dueDate: request.dueDate!,
      status: request.status,
      priority: request.priority?.toLowerCase() as 'low' | 'medium' | 'high'
    }))
  ];

  // Sort by how overdue they are (most overdue first)
  return allOverdueItems.sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}