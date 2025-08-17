// src/app/api/cron/send-afternoon-manifest/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import nodemailer from 'nodemailer';
import { ContractTerm, User } from "@prisma/client";
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

// --- HELPER FUNCTIONS ---

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

// --- DATA FETCHING LOGIC ---

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
        prisma.project.findMany({ where: { ownerId: userId, endDate: { gte: tomorrowBounds.start, lte: tomorrowBounds.end } }, select: { id: true, name: true, endDate: true } }),
        prisma.task.findMany({ where: { project: { ownerId: userId }, dueDate: { gte: tomorrowBounds.start, lte: tomorrowBounds.end } }, select: { id: true, title: true, projectId: true, dueDate: true, project: { select: { name: true } } } }),
        prisma.timelineEvent.findMany({ where: { project: { ownerId: userId }, eventDate: { gte: tomorrowBounds.start, lte: tomorrowBounds.end }, isCompleted: false }, select: { id: true, title: true, projectId: true, eventDate: true, project: { select: { name: true } } } }),
        prisma.invoice.findMany({ where: { userId: userId, dueDate: { gte: tomorrowBounds.start, lte: tomorrowBounds.end } }, select: { id: true, invoiceNumber: true, dueDate: true, client: { select: { name: true } } } }),
        prisma.client.findMany({ where: { userId, contractStartDate: { not: null }, contractTerm: { not: 'ONE_TIME' }, frequency: 'monthly' }, select: { id: true, name: true, contractStartDate: true, contractTerm: true } })
    ]);

    const clientContractItems: OperationalItem[] = [];
    recurringClients.forEach(client => {
        if (!client.contractStartDate) return;
        const startDate = new Date(client.contractStartDate);
        const termInMonths = getMonthsFromTerm(client.contractTerm);
        for (let i = 0; i < termInMonths; i++) {
            const paymentDate = addMonths(startDate, i);
            if (isWithinInterval(paymentDate, { start: tomorrowBounds.start, end: tomorrowBounds.end })) {
                clientContractItems.push({ id: `${client.id}-month-${i}`, title: `Recurring Payment`, type: 'Client Contract' as const, dueDate: paymentDate, link: `/dashboard/financials`, clientName: client.name });
            }
        }
    });

    // --- FIX APPLIED HERE ---
    // Added .filter() to each mapping to ensure the date field is not null, satisfying the OperationalItem interface.
    const allItems: OperationalItem[] = [
        ...projects.filter(p => p.endDate).map(p => ({ id: p.id, title: p.name, type: 'Project' as const, dueDate: p.endDate!, link: `/dashboard/projects/${p.id}` })),
        ...tasks.filter(t => t.dueDate).map(t => ({ id: t.id, title: t.title, type: 'Task' as const, dueDate: t.dueDate!, link: `/dashboard/projects/${t.projectId}`, projectName: t.project.name })),
        ...timelineEvents.filter(te => te.eventDate).map(te => ({ id: te.id, title: te.title, type: 'Timeline Event' as const, dueDate: te.eventDate!, link: `/dashboard/projects/${te.projectId}`, projectName: te.project.name })),
        ...invoices.filter(i => i.dueDate).map(i => ({ id: i.id, title: `Invoice #${i.invoiceNumber}`, type: 'Invoice' as const, dueDate: i.dueDate!, link: `/dashboard/financials`, clientName: i.client.name })),
        ...clientContractItems
    ];
    
    return allItems.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

// --- EMAIL SENDING LOGIC ---

// A type guard to ensure the session user object is complete
type SessionUser = { id: string; email: string; name: string | null; };
function isSessionUser(user: any): user is SessionUser {
    return user && typeof user.id === 'string' && typeof user.email === 'string';
}


async function sendManifestEmail(user: SessionUser, items: OperationalItem[]) {
    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);
    const tomorrowFormatted = format(tomorrow, 'EEEE, MMMM d, yyyy');
    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const renderItems = (itemList: OperationalItem[]) => {
        if (itemList.length === 0) return '<li>No items due tomorrow.</li>';
        return itemList.map(item => `
        <li style="margin-bottom: 15px; padding: 10px; border-left: 3px solid #7c3aed; background-color: #f3f4f6;">
            <strong>${item.title}</strong> (${item.type})<br>
            <span style="font-size: 12px; color: #6b7280;">
            ${item.projectName ? `Project: ${item.projectName}` : ''}
            ${item.clientName ? `Client: ${item.clientName}` : ''}
            </span><br>
            <a href="${appUrl}${item.link}" style="font-size: 12px; color: #4f46e5;">View Details</a>
        </li>
        `).join('');
    };

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h1 style="font-size: 24px; color: #111827;">Your Afternoon Manifest for ${tomorrowFormatted}</h1>
            <p>Hi ${user.name || 'User'}, here is a summary of your items due tomorrow:</p>
            
            ${items.length > 0 ? `
              <ul style="list-style-type: none; padding: 0;">
                ${renderItems(items)}
              </ul>
            ` : `<p>You have no items due tomorrow. Enjoy your evening!</p>`}
    
            <p style="margin-top: 30px;">
              <a href="${appUrl}/dashboard/operations" style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Operations Dashboard
              </a>
            </p>
          </div>
        </div>
      `;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: `"Project Planning App" <${process.env.EMAIL_SERVER_USER}>`,
        to: user.email,
        subject: `Your Afternoon Manifest for ${tomorrowFormatted}`,
        html: emailHtml,
    });
}


// --- API ROUTE HANDLERS ---

/**
 * GET handler for scheduled cron jobs.
 * This will run automatically to send manifests to all subscribed users.
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const subscribedUsers = await prisma.user.findMany({
            where: { sendAfternoonManifest: true, isActive: true, email: { not: null } },
        });

        for (const user of subscribedUsers) {
            if(isSessionUser(user)) {
                const items = await getTomorrowsOperationalData(user.id);
                if (items.length > 0) {
                    await sendManifestEmail(user, items);
                }
            }
        }

        return NextResponse.json({ success: true, message: `Afternoon manifests processed for ${subscribedUsers.length} users.` });
    } catch (error) {
        console.error("Error sending scheduled afternoon manifests:", error);
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
        if (!session || !isSessionUser(session.user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { user } = session;

        const items = await getTomorrowsOperationalData(user.id);
        await sendManifestEmail(user, items);

        return NextResponse.json({ success: true, message: `Afternoon manifest sent to ${user.email}.` });
    } catch (error) {
        console.error("Error sending manual afternoon manifest:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
