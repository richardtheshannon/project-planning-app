// src/app/api/cron/send-manifest/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { ContractTerm } from "@prisma/client";
import { addMonths, isWithinInterval } from "date-fns";

// --- Types for our operational data ---
interface OperationalItem {
  id: string;
  title: string;
  type: 'Project' | 'Task' | 'Timeline Event' | 'Invoice' | 'Client Contract';
  link: string;
  projectName?: string;
  clientName?: string;
}

// --- Helper Functions ---
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

// --- Data Fetching Logic (adapted from Operations page) ---
async function getTodaysOperationalData(userId: string) {
  const todayBounds = getDayBounds(new Date());

  const [
    projects,
    tasks,
    timelineEvents,
    invoices,
    recurringClients
  ] = await Promise.all([
    prisma.project.findMany({ where: { ownerId: userId, endDate: { gte: todayBounds.start, lte: todayBounds.end } }, select: { id: true, name: true } }),
    prisma.task.findMany({ where: { project: { ownerId: userId }, dueDate: { gte: todayBounds.start, lte: todayBounds.end } }, select: { id: true, title: true, projectId: true, project: { select: { name: true } } } }),
    prisma.timelineEvent.findMany({ where: { project: { ownerId: userId }, eventDate: { gte: todayBounds.start, lte: todayBounds.end }, isCompleted: false }, select: { id: true, title: true, projectId: true, project: { select: { name: true } } } }),
    prisma.invoice.findMany({ where: { userId: userId, dueDate: { gte: todayBounds.start, lte: todayBounds.end } }, select: { id: true, invoiceNumber: true, client: { select: { name: true } } } }),
    prisma.client.findMany({ where: { userId, contractStartDate: { not: null }, contractTerm: { not: 'ONE_TIME' }, frequency: 'monthly' }, select: { id: true, name: true, contractStartDate: true, contractTerm: true } })
  ]);

  const clientContractItems: OperationalItem[] = [];
  recurringClients.forEach(client => {
      if (!client.contractStartDate) return;
      const startDate = new Date(client.contractStartDate);
      const termInMonths = getMonthsFromTerm(client.contractTerm);
      for (let i = 0; i < termInMonths; i++) {
          const paymentDate = addMonths(startDate, i);
          if (isWithinInterval(paymentDate, { start: todayBounds.start, end: todayBounds.end })) {
              clientContractItems.push({ id: `${client.id}-month-${i}`, title: `Recurring Payment`, type: 'Client Contract' as const, link: `/dashboard/financials`, clientName: client.name });
          }
      }
  });

  const allItems: OperationalItem[] = [
    ...projects.map(p => ({ id: p.id, title: p.name, type: 'Project' as const, link: `/dashboard/projects/${p.id}` })),
    ...tasks.map(t => ({ id: t.id, title: t.title, type: 'Task' as const, link: `/dashboard/projects/${t.projectId}`, projectName: t.project.name })),
    ...timelineEvents.map(te => ({ id: te.id, title: te.title, type: 'Timeline Event' as const, link: `/dashboard/projects/${te.projectId}`, projectName: te.project.name })),
    ...invoices.map(i => ({ id: i.id, title: `Invoice #${i.invoiceNumber}`, type: 'Invoice' as const, link: `/dashboard/financials`, clientName: i.client.name })),
    ...clientContractItems
  ];
  
  return allItems;
}

// --- HTML Email Template ---
function createManifestEmailHtml(userName: string, items: OperationalItem[], appUrl: string): string {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const projectItems = items.filter(item => ['Project', 'Task', 'Timeline Event'].includes(item.type));
  const financialItems = items.filter(item => ['Invoice', 'Client Contract'].includes(item.type));

  const renderItems = (itemList: OperationalItem[]) => {
    if (itemList.length === 0) return '<li>No items due today.</li>';
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

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h1 style="font-size: 24px; color: #111827;">Your Daily Manifest for ${today}</h1>
        <p>Hi ${userName}, here is a summary of your items due today:</p>
        
        ${projectItems.length > 0 ? `
          <h2 style="font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-top: 20px;">Projects & Tasks</h2>
          <ul style="list-style-type: none; padding: 0;">
            ${renderItems(projectItems)}
          </ul>
        ` : ''}

        ${financialItems.length > 0 ? `
          <h2 style="font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-top: 20px;">Financials</h2>
          <ul style="list-style-type: none; padding: 0;">
            ${renderItems(financialItems)}
          </ul>
        ` : ''}

        ${items.length === 0 ? `<p>You have no items due today. Great job staying on top of things!</p>` : ''}

        <p style="margin-top: 30px;">
          <a href="${appUrl}/dashboard/operations" style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Operations Dashboard
          </a>
        </p>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
          You are receiving this email because you opted in for the Daily Morning Manifest in your settings.
        </p>
      </div>
    </div>
  `;
}


// --- Main API Route Handler ---
export async function GET(request: Request) {
  // Security: Protect this route with a secret key
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const usersToSend = await prisma.user.findMany({
      where: { sendDailyManifest: true, email: { not: null } },
      select: { id: true, email: true, name: true }
    });

    if (usersToSend.length === 0) {
      return NextResponse.json({ message: 'No users to email.' });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    let emailsSent = 0;

    for (const user of usersToSend) {
      const items = await getTodaysOperationalData(user.id);
      
      // Only send an email if there are items due
      if (items.length > 0) {
        const emailHtml = createManifestEmailHtml(user.name || 'User', items, appUrl);
        await transporter.sendMail({
          from: `"Project Planning App" <${process.env.EMAIL_SERVER_USER}>`,
          to: user.email!,
          subject: `Your Daily Manifest for ${new Date().toLocaleDateString()}`,
          html: emailHtml,
        });
        emailsSent++;
      }
    }

    return NextResponse.json({ success: true, message: `Sent ${emailsSent} manifest emails.` });

  } catch (error) {
    console.error("Failed to send manifest emails:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
