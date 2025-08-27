// src/app/api/cron/send-afternoon-manifest/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { prisma } from "@/lib/prisma";
import { sendGoogleEmail, sendBatchGoogleEmails } from '@/lib/google-email';
import { ContractTerm } from "@prisma/client";
import { addMonths, isWithinInterval, startOfMonth, endOfMonth, format } from "date-fns";

// --- TYPES AND INTERFACES ---

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

// --- HELPER FUNCTIONS ---

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

// --- DATA FETCHING LOGIC (Matches Operations Page Exactly) ---

async function getTomorrowsOperationalData(): Promise<OperationalItem[]> {
    // FIX: Create dates that represent the LOCAL calendar date at midnight UTC
    // This matches how the dates are stored in the database
    const now = new Date();
    
    // Get the local date components
    const localYear = now.getFullYear();
    const localMonth = now.getMonth();
    const localDay = now.getDate();
    
    // Create date at midnight UTC for tomorrow's LOCAL calendar date
    const tomorrow = new Date(Date.UTC(localYear, localMonth, localDay + 1, 0, 0, 0));

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
            link: `/dashboard/financials`, 
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

    // Filter for tomorrow's items using the same UTC comparison
    const tomorrowItems = allItems.filter(item => isSameDayUTC(item.dueDate, tomorrow));
    
    // Sort by due date
    tomorrowItems.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    return tomorrowItems;
}

// --- EMAIL SENDING LOGIC ---

function createManifestEmailHtml(userName: string, items: OperationalItem[]) {
    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);
    const tomorrowFormatted = format(tomorrow, 'EEEE, MMMM d, yyyy');
    const appUrl = getBaseUrl();

    const projectItems = items.filter(item => ['Project', 'Task', 'Timeline Event'].includes(item.type));
    const financialItems = items.filter(item => ['Invoice', 'Client Contract'].includes(item.type));
    const featureItems = items.filter(item => item.type === 'Feature Request');

    const renderItems = (itemList: OperationalItem[]) => {
        if (itemList.length === 0) return '<li>No items in this category.</li>';
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

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h1 style="font-size: 24px; color: #111827;">Your Afternoon Manifest for ${tomorrowFormatted}</h1>
            <p>Hi ${userName}, here is a summary of your items due tomorrow:</p>
            
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

            ${items.length === 0 ? `<p>You have no items due tomorrow. Enjoy your evening!</p>` : ''}
    
            <p style="margin-top: 30px;">
              <a href="${appUrl}/dashboard/operations" style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Operations Dashboard
              </a>
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
              This is an automated afternoon manifest email.
            </p>
          </div>
        </div>
      `;

    return { html: emailHtml, subject: `Your Afternoon Manifest for ${tomorrowFormatted}` };
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
            select: { id: true, email: true, name: true }
        });

        if (subscribedUsers.length === 0) {
            return NextResponse.json({ message: 'No users to email.' });
        }

        const items = await getTomorrowsOperationalData(); // Get items once for all users
        
        // Prepare batch emails
        const emailBatch = subscribedUsers
            .filter(user => user.email)
            .map(user => {
                const { html, subject } = createManifestEmailHtml(user.name || 'User', items);
                return {
                    to: user.email!,
                    subject,
                    html
                };
            });
        
        // Send emails in batch
        const results = await sendBatchGoogleEmails(emailBatch);
        const emailsSent = results.filter(r => r.success).length;
        const failedEmails = results.filter(r => !r.success);
        
        if (failedEmails.length > 0) {
            console.error('[CRON] Failed to send afternoon emails to:', failedEmails);
        }

        return NextResponse.json({ 
            success: true, 
            message: `Afternoon manifests processed for ${emailsSent} of ${emailBatch.length} users.`,
            failed: failedEmails.length
        });
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
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userEmail = session.user.email;
        const userName = session.user.name || 'User';

        const items = await getTomorrowsOperationalData();
        const { html, subject } = createManifestEmailHtml(userName, items);
        
        await sendGoogleEmail({
            to: userEmail,
            subject,
            html
        });

        return NextResponse.json({ success: true, message: `Afternoon manifest sent to ${userEmail}.` });
    } catch (error) {
        console.error("Error sending manual afternoon manifest:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
