// src/app/api/cron/send-manifest/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { ContractTerm } from "@prisma/client";
import { addMonths, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';

// --- Types for our operational data ---
interface OperationalItem {
  id: string;
  title: string;
  type: 'Project' | 'Task' | 'Timeline Event' | 'Invoice' | 'Client Contract' | 'Feature Request';
  dueDate: Date;
  link: string;
  projectName?: string;
  clientName?: string;
  priority?: string;
  status?: string;
  submittedBy?: string;
}

// --- Helper Functions ---

// FIX: Use the EXACT same helper function as Operations page
const isSameDayUTC = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1).toLocaleDateString('en-US', { timeZone: 'UTC' });
  const d2 = new Date(date2).toLocaleDateString('en-US', { timeZone: 'UTC' });
  return d1 === d2;
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

// --- URL Helper Function ---
const getBaseUrl = (): string => {
  let url = process.env.NEXTAUTH_URL || '';
  
  // If URL exists but doesn't start with http, add https://
  if (url && !url.startsWith('http')) {
    url = `https://${url}`;
  }
  
  // Fallback to default if no URL is set
  if (!url) {
    url = 'https://app.salesfield.net';
  }
  
  return url;
};

// --- Data Fetching Logic (Matches Operations Page Exactly) ---
async function getTodaysOperationalData() {
  // FIX: Create dates that represent the LOCAL calendar date at midnight UTC
  // This matches how the dates are stored in the database
  const now = new Date();
  
  // Get the local date components
  const localYear = now.getFullYear();
  const localMonth = now.getMonth();
  const localDay = now.getDate();
  
  // Create date at midnight UTC for the LOCAL calendar date
  const today = new Date(Date.UTC(localYear, localMonth, localDay, 0, 0, 0));

  // Fetch data for the entire current month (for recurring clients calculation)
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Fetch ALL data without owner filtering (collaborative model)
  const [
    projects,
    tasks,
    timelineEvents,
    invoices,
    recurringClients,
    featureRequests // Added feature requests
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
    // New: Fetch feature requests with due dates
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

  // Process recurring clients
  recurringClients.forEach(client => {
      if (!client.contractStartDate) return;
      const startDate = new Date(client.contractStartDate);
      const termInMonths = getMonthsFromTerm(client.contractTerm);
      for (let i = 0; i < termInMonths * 4; i++) { // Extend recurring items for visibility
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

  // Add all items
  allItems.push(
    ...projects.filter(p => p.endDate).map(p => ({ 
      id: p.id, 
      title: p.name, 
      type: 'Project' as const, 
      dueDate: p.endDate!, 
      link: `/dashboard/projects/${p.id}` 
    })),
    ...tasks.filter(t => t.dueDate).map(t => ({ 
      id: t.id, 
      title: t.title, 
      type: 'Task' as const, 
      dueDate: t.dueDate!, 
      link: `/dashboard/projects/${t.projectId}`, 
      projectName: t.project.name 
    })),
    ...timelineEvents.filter(te => te.eventDate).map(te => ({ 
      id: te.id, 
      title: te.title, 
      type: 'Timeline Event' as const, 
      dueDate: te.eventDate!, 
      link: `/dashboard/projects/${te.projectId}`, 
      projectName: te.project.name 
    })),
...invoices.filter(i => i.dueDate).map(i => ({ 
  id: i.id, 
  title: `Invoice #${i.invoiceNumber}`, 
  type: 'Invoice' as const, 
  dueDate: i.dueDate!, 
  link: `/dashboard/financials/invoices/${i.id}`, // UPDATED: Link to individual invoice
  clientName: i.client.name 
})),
    // UPDATED: Feature requests now link to their individual pages
    ...featureRequests
      .filter(fr => fr.dueDate !== null)
      .map(fr => ({
        id: `feature-${fr.id}`, 
        title: fr.title, 
        type: 'Feature Request' as const, 
        dueDate: new Date(fr.dueDate!),
        link: `/dashboard/settings/feature-requests/${fr.id}`, // CHANGED: Now links to individual page
        priority: fr.priority,
        status: fr.status,
        submittedBy: fr.submittedBy
      }))
  );

  // Filter for today's items using the same UTC comparison
  const todayItems = allItems.filter(item => isSameDayUTC(item.dueDate, today));
  
  // Sort by due date
  todayItems.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return todayItems;
}

// --- HTML Email Template ---
function createManifestEmailHtml(userName: string, items: OperationalItem[], appUrl: string): string {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const projectItems = items.filter(item => ['Project', 'Task', 'Timeline Event'].includes(item.type));
  const financialItems = items.filter(item => ['Invoice', 'Client Contract'].includes(item.type));
  const featureItems = items.filter(item => item.type === 'Feature Request');

  const renderItems = (itemList: OperationalItem[]) => {
    if (itemList.length === 0) return '<li>No items due today.</li>';
    return itemList.map(item => `
      <li style="margin-bottom: 15px; padding: 10px; border-left: 3px solid #7c3aed; background-color: #f3f4f6;">
        <strong>${item.title}</strong> (${item.type})<br>
        <span style="font-size: 12px; color: #6b7280;">
          ${item.projectName ? `Project: ${item.projectName}<br>` : ''}
          ${item.clientName ? `Client: ${item.clientName}<br>` : ''}
          ${item.priority ? `Priority: ${item.priority}<br>` : ''}
          ${item.status ? `Status: ${item.status}<br>` : ''}
          ${item.submittedBy ? `Submitted by: ${item.submittedBy}` : ''}
        </span><br>
        <a href="${appUrl}${item.link}" style="font-size: 12px; color: #4f46e5;">View Details</a>
      </li>
    `).join('');
  };

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h1 style="font-size: 24px; color: #111827;">Your Morning Manifest for ${today}</h1>
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

        ${featureItems.length > 0 ? `
          <h2 style="font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-top: 20px;">Feature Requests</h2>
          <ul style="list-style-type: none; padding: 0;">
            ${renderItems(featureItems)}
          </ul>
        ` : ''}

        ${items.length === 0 ? `<p>You have no items due today. Great job staying on top of things!</p>` : ''}

        <p style="margin-top: 30px;">
          <a href="${appUrl}/dashboard/operations" style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Operations Dashboard
          </a>
        </p>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
          This is an automated morning manifest email.
        </p>
      </div>
    </div>
  `;
}

// --- Cron Job Handler (GET) ---
export async function GET(request: Request) {
  // Security for scheduled cron jobs
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const usersToSend = await prisma.user.findMany({
      where: { sendDailyManifest: true, email: { not: null }, isActive: true },
      select: { id: true, email: true, name: true }
    });

    if (usersToSend.length === 0) {
      return NextResponse.json({ message: 'No users to email.' });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', 
      port: 465, 
      secure: true,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const appUrl = getBaseUrl();
    const items = await getTodaysOperationalData(); // Get items once for all users
    let emailsSent = 0;

    for (const user of usersToSend) {
      if (user.email) {
        // Send email even if no items (to confirm the service is working)
        const emailHtml = createManifestEmailHtml(user.name || 'User', items, appUrl);
        await transporter.sendMail({
          from: `"Project Planning App" <${process.env.EMAIL_SERVER_USER}>`,
          to: user.email,
          subject: `Your Morning Manifest for ${new Date().toLocaleDateString()}`,
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

// --- Manual Send Handler (POST) ---
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email;
    const userName = session.user.name || 'User';

    const items = await getTodaysOperationalData();

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', 
      port: 465, 
      secure: true,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const appUrl = getBaseUrl();
    const emailHtml = createManifestEmailHtml(userName, items, appUrl);

    await transporter.sendMail({
      from: `"Project Planning App" <${process.env.EMAIL_SERVER_USER}>`,
      to: userEmail,
      subject: `Your Morning Manifest for ${new Date().toLocaleDateString()}`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true, message: `Manifest sent to ${userEmail}.` });

  } catch (error) {
    console.error("Failed to send manual manifest:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
