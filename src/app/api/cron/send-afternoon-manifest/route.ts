// src/app/api/cron/send-afternoon-manifest/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import nodemailer from 'nodemailer';
import { ContractTerm } from "@prisma/client";
import { addMonths, isWithinInterval, format } from "date-fns";

// --- TYPES AND INTERFACES ---

interface OperationalItem {
    id: string;
    title: string;
    type: 'Project' | 'Task' | 'Timeline Event' | 'Invoice' | 'Client Contract';
    dueDate: Date;
    link: string;
    projectName?: string;
    clientName?: string;
}

// --- DATA FETCHING LOGIC (Adapted from Operations Page) ---

const getDayBounds = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const start = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
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

/**
 * Fetches all operational items due for the next day for a specific user.
 * @param userId - The ID of the user to fetch data for.
 * @returns A promise that resolves to an array of operational items.
 */
async function getTomorrowsOperationalData(userId: string): Promise<OperationalItem[]> {
  const tomorrow = new Date();
  tomorrow.setDate(new Date().getDate() + 1);
  const tomorrowBounds = getDayBounds(tomorrow);

  const [
    projects,
    tasks,
    timelineEvents,
    invoices,
    recurringClients
  ] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId, endDate: { gte: tomorrowBounds.start, lte: tomorrowBounds.end } },
      select: { id: true, name: true, endDate: true }
    }),
    prisma.task.findMany({
      where: { project: { ownerId: userId }, dueDate: { gte: tomorrowBounds.start, lte: tomorrowBounds.end } },
      select: { id: true, title: true, dueDate: true, projectId: true, project: { select: { name: true } } }
    }),
    prisma.timelineEvent.findMany({
      where: { project: { ownerId: userId }, eventDate: { gte: tomorrowBounds.start, lte: tomorrowBounds.end }, isCompleted: false },
      select: { id: true, title: true, eventDate: true, projectId: true, project: { select: { name: true } } }
    }),
    prisma.invoice.findMany({
      where: { userId: userId, dueDate: { gte: tomorrowBounds.start, lte: tomorrowBounds.end } },
      select: { id: true, invoiceNumber: true, dueDate: true, client: { select: { name: true } } }
    }),
    prisma.client.findMany({
        where: { userId, contractStartDate: { not: null }, contractTerm: { not: 'ONE_TIME' }, frequency: 'monthly' },
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
          if (isWithinInterval(paymentDate, { start: tomorrowBounds.start, end: tomorrowBounds.end })) {
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
    ...projects.map(p => ({ id: p.id, title: p.name, type: 'Project' as const, dueDate: p.endDate!, link: `/dashboard/projects/${p.id}` })),
    ...tasks.map(t => ({ id: t.id, title: t.title, type: 'Task' as const, dueDate: t.dueDate!, link: `/dashboard/projects/${t.projectId}`, projectName: t.project.name })),
    ...timelineEvents.map(te => ({ id: te.id, title: te.title, type: 'Timeline Event' as const, dueDate: te.eventDate!, link: `/dashboard/projects/${te.projectId}`, projectName: te.project.name })),
    ...invoices.map(i => ({ id: i.id, title: `Invoice #${i.invoiceNumber}`, type: 'Invoice' as const, dueDate: i.dueDate, link: `/dashboard/financials`, clientName: i.client.name })),
    ...clientContractItems
  ];

  allItems.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return allItems;
}

// --- EMAIL SENDING LOGIC ---

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

function createEmailHtml(userName: string, items: OperationalItem[]): string {
    const tomorrowDate = format(new Date(new Date().setDate(new Date().getDate() + 1)), 'EEEE, MMMM do');
    
    if (items.length === 0) {
        return `<p>Hi ${userName},</p><p>You have no items scheduled for tomorrow, ${tomorrowDate}.</p><p>Have a great afternoon!</p>`;
    }

    const itemsHtml = items.map(item => {
        let context = '';
        if (item.projectName) context = ` (Project: ${item.projectName})`;
        if (item.clientName) context = ` (Client: ${item.clientName})`;
        return `<li><strong>${item.type}:</strong> ${item.title}${context}</li>`;
    }).join('');

    return `
        <div style="font-family: sans-serif; line-height: 1.6;">
            <h2>Afternoon Manifest for ${tomorrowDate}</h2>
            <p>Hi ${userName},</p>
            <p>Here is a summary of your operational items due tomorrow:</p>
            <ul>${itemsHtml}</ul>
            <p>Have a productive afternoon!</p>
        </div>
    `;
}

async function sendManifestEmail(user: { id: string; name?: string | null; email?: string | null; }, items: OperationalItem[]) {
    if (!user.email || !user.name) {
        throw new Error(`User ${user.id} is missing email or name.`);
    }

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: `Your Afternoon Manifest for Tomorrow`,
        html: createEmailHtml(user.name, items),
    };

    await transporter.sendMail(mailOptions);
}


// --- API ROUTE HANDLERS ---

/**
 * GET handler for scheduled cron jobs.
 * Fetches all users subscribed to the afternoon manifest and sends them an email.
 */
export async function GET(request: Request) {
    // Add a security check for cron jobs if needed (e.g., a secret key in the URL)
    try {
        const subscribedUsers = await prisma.user.findMany({
            where: { sendAfternoonManifest: true, isActive: true },
        });

        for (const user of subscribedUsers) {
            const items = await getTomorrowsOperationalData(user.id);
            await sendManifestEmail(user, items);
        }

        return NextResponse.json({ success: true, message: `Manifests sent to ${subscribedUsers.length} users.` });
    } catch (error) {
        console.error("Error sending afternoon manifests:", error);
        return NextResponse.json({ error: "Failed to send manifests" }, { status: 500 });
    }
}

/**
 * POST handler for manual "Send Now" button.
 * Sends the afternoon manifest only to the currently logged-in user.
 */
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { user } = session;

        const items = await getTomorrowsOperationalData(user.id);
        await sendManifestEmail(user, items);

        return NextResponse.json({ success: true, message: `Afternoon manifest sent to ${user.email}.` });
    } catch (error) {
        console.error("Error sending manual afternoon manifest:", error);
        return NextResponse.json({ error: "Failed to send manifest" }, { status: 500 });
    }
}
