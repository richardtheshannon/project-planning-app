Project Planning Application V2 - Invoice Pages Implementation
Metadata

Project Name: project-planning-V2
Repository URL: GitHub to Railway deployment
Primary Branch: master
Commit Hash: Uncommitted changes
Generation Timestamp: 2025-01-21 UTC
Generator: Automated handover summary

Table of Contents

Executive Summary
Core Architectural Model
Technical Overview and Current State
Key Functionalities
System Architecture
Data Model
APIs and Integrations
Frontend
Backend/Services
Background Jobs/Workers
Infrastructure and DevOps
Dependencies
Setup, Configuration, and Running
Testing and Quality
Directory Map
Challenges, Errors, Failures, Revisions, and Resolutions
Known Issues and Limitations
Update/Change Management Policy
Security, Privacy, and Compliance
Glossary and Acronyms

Executive Summary
The project-planning-V2 application has been enhanced with individual invoice pages, transforming the previous modal-based invoice viewing system into a URL-based page structure. This implementation follows the same pattern as the feature request pages completed in the previous session. The current session involved creating a new invoice detail page component at /src/app/dashboard/financials/invoices/[id]/page.tsx, updating the income page to use navigation instead of modals, and systematically updating all invoice links throughout the application including the financial overview page and email manifests.
Core Architectural Model
Core Architectural Model
This application is designed as a collaborative, multi-user platform. It is not a user-centric application. All authenticated users have access to and manage a single, shared database. Any data created or modified by one user will be visible to all other users.
Technical Overview and Current State
Overall Architecture

Framework: Next.js 13.5.6 with TypeScript
Database: PostgreSQL via Prisma ORM
Authentication: NextAuth.js with Google OAuth
Email Service: Nodemailer with Gmail SMTP
Deployment: Railway platform
Styling: Tailwind CSS with shadcn/ui components

Current Development State
Active development completed in this session (uncommitted):

/src/app/dashboard/financials/invoices/[id]/page.tsx - New file created
/src/app/dashboard/financials/income/page.tsx - Modified to use navigation
/src/components/financials/NewInvoiceDialog.tsx - Updated to redirect after creation
/src/app/dashboard/financials/page.tsx - Updated invoice links to be clickable
/src/app/api/cron/send-manifest/route.ts - Updated invoice links
/src/app/api/cron/send-afternoon-manifest/route.ts - Updated invoice links

Key Functionalities
Invoice Management

List View: /src/app/dashboard/financials/income/page.tsx - Displays all invoices in a sortable table
Detail View: /src/app/dashboard/financials/invoices/[id]/page.tsx - Individual invoice pages with edit/delete functionality
Creation: Available from income page via NewInvoiceDialog component
API Routes: /src/app/api/financials/invoices/route.ts and /src/app/api/financials/invoices/[id]/route.ts

Financial Overview Integration

File: /src/app/dashboard/financials/page.tsx
Displays invoices in monthly summary cards with clickable links
Shows YTD financial metrics and forecasts

Email Manifests

Morning Manifest: /src/app/api/cron/send-manifest/route.ts
Afternoon Manifest: /src/app/api/cron/send-afternoon-manifest/route.ts
Both include invoices with direct links to individual invoice pages

System Architecture
Component Interaction Flow
User Interface Layer:
├── Invoice List Page (Income)
│   └── Navigation to Detail Pages
├── Invoice Detail Page
│   ├── View/Edit/Delete Operations
│   └── Back Navigation
├── Financial Overview
│   └── Invoice Links in Monthly Cards
└── Email Manifests
    └── Invoice Links

API Layer:
├── /api/financials/invoices (GET, POST)
└── /api/financials/invoices/[id] (GET, PATCH, DELETE)

Data Layer:
└── PostgreSQL → Prisma ORM → Invoice Model
Data Model
Invoice Entity
prismamodel Invoice {
  id            String        @id @default(cuid())
  invoiceNumber String        @unique
  status        InvoiceStatus @default(DRAFT)
  amount        Float
  issuedDate    DateTime
  dueDate       DateTime
  clientId      String
  client        Client        @relation(fields: [clientId], references: [id])
  userId        String
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  documents     FinancialDocument[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @default(now()) @updatedAt
}

enum InvoiceStatus {
  DRAFT
  PENDING
  PAID
  OVERDUE
}
Environment Variables

DATABASE_URL - PostgreSQL connection string
NEXTAUTH_URL - Application URL for authentication
NEXTAUTH_SECRET - Session encryption
GOOGLE_CLIENT_ID - OAuth client ID
GOOGLE_CLIENT_SECRET - OAuth client secret
EMAIL_SERVER_USER - Gmail SMTP username
EMAIL_SERVER_PASSWORD - Gmail SMTP password
CRON_SECRET - Bearer token for cron job authentication

APIs and Integrations
Invoice API Endpoints
GET /api/financials/invoices

Returns all invoices with client information
No user filtering (collaborative model)
Response includes client relationship

POST /api/financials/invoices

Creates new invoice
Request body: { clientId, amount, status, issuedDate, dueDate }
Auto-generates invoice number: INV-${Date.now().toString(36).toUpperCase()}

GET /api/financials/invoices/[id]

Returns single invoice by ID
Authentication required via NextAuth session
User ownership check applied

PATCH /api/financials/invoices/[id]

Updates invoice
Request body: { amount?, status?, issuedDate?, dueDate? }
Authentication required

DELETE /api/financials/invoices/[id]

Deletes invoice
Returns 200 with success message
Authentication required

Frontend
Framework and Tools

Next.js 13.5.6 App Router
TypeScript
Tailwind CSS
shadcn/ui components

Key Components
Invoice Detail Page
typescript// /src/app/dashboard/financials/invoices/[id]/page.tsx, lines 30-280
export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  
  // State management for invoice data and editing
  const [invoice, setInvoice] = useState<InvoiceWithClient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch invoice on mount
  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);
}
Invoice List Navigation
typescript// /src/app/dashboard/financials/income/page.tsx, lines 44-47
const handleInvoiceClick = (invoiceId: string) => {
  router.push(`/dashboard/financials/invoices/${invoiceId}`);
};
Backend/Services
Request Handling

NextAuth for authentication
Prisma ORM for database operations
Server-side data fetching in page components

Business Logic Entry Points

Invoice CRUD operations in API routes
Email manifest generation with invoice links
Financial data aggregation in overview page

Background Jobs/Workers
Email Manifests

Morning Manifest: Sends daily summary of items due today
Afternoon Manifest: Sends summary of items due tomorrow
Both triggered via GET endpoints with CRON_SECRET bearer token
Manual trigger available via POST endpoints
Invoice links updated to point to individual pages

Infrastructure and DevOps
Deployment

Platform: Railway
Build command: prisma generate && next build
Start command: npm start
Environment variables: Managed in Railway dashboard

Database

PostgreSQL hosted on Railway
Migrations managed via Prisma
Connection via DATABASE_URL environment variable

Dependencies
Package.json Dependencies
json{
  "next": "13.5.6",
  "react": "^18",
  "@prisma/client": "^[version]",
  "next-auth": "^[version]",
  "nodemailer": "^[version]",
  "date-fns": "^[version]",
  "lucide-react": "^[version]",
  "sonner": "^[version]",
  "@hookform/resolvers": "^[version]",
  "react-hook-form": "^[version]",
  "zod": "^[version]"
}
Setup, Configuration, and Running
Local Development
bashnpm install
npx prisma generate
npm run dev
Database Setup
bashnpx prisma migrate dev
Required Environment Variables

Set all variables listed in Data Model section
Configure Google OAuth credentials
Set up Gmail SMTP credentials

Testing and Quality
No automated tests documented for the invoice functionality. Manual testing performed during development session.
Directory Map
src/
├── app/
│   ├── api/
│   │   ├── financials/
│   │   │   ├── invoices/
│   │   │   │   ├── route.ts                    # GET all, POST new
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts                # GET, PATCH, DELETE by ID
│   │   └── cron/
│   │       ├── send-manifest/
│   │       │   └── route.ts                    # Morning manifest (updated)
│   │       └── send-afternoon-manifest/
│   │           └── route.ts                    # Afternoon manifest (updated)
│   ├── dashboard/
│   │   ├── financials/
│   │   │   ├── page.tsx                        # Financial overview (updated)
│   │   │   ├── income/
│   │   │   │   └── page.tsx                    # Invoice list (updated)
│   │   │   └── invoices/
│   │   │       └── [id]/
│   │   │           └── page.tsx                # Invoice detail (new)
│   └── layout.tsx
├── components/
│   ├── financials/
│   │   ├── NewInvoiceDialog.tsx                # Create invoice (updated)
│   │   ├── EditInvoiceDialog.tsx               # To be deleted
│   │   └── AddClientDialog.tsx
│   └── ui/                                     # shadcn/ui components
└── lib/
    └── prisma.ts                                # Prisma client
Challenges, Errors, Failures, Revisions, and Resolutions
Session Issues and Resolutions
Issue 1: Invoice Modal to Page Transition

Problem: Invoices were opening in modals instead of dedicated pages
Resolution: Created new detail page component at /src/app/dashboard/financials/invoices/[id]/page.tsx
Files Modified: income/page.tsx to remove modal logic and add navigation

Issue 2: TypeScript Circular Dependency

Problem: Circular dependency in fetchInvoices callback dependencies
Resolution: Removed circular references from useCallback dependency array
Lines Changed: /src/app/dashboard/financials/income/page.tsx line 174

Issue 3: Broken Invoice Links

Problem: Invoice links throughout app pointed to list page instead of individual pages
Resolution: Systematically updated all link generation:

Financial Overview: Changed links to /dashboard/financials/invoices/${inv.id}
Email Manifests: Updated both morning and afternoon manifest routes
Added Link components to server-rendered financial overview page



Issue 4: Import Error

Problem: Incorrect import of FinancialsLineChart in income page
Resolution: Removed erroneous import statement

Known Issues and Limitations
Current Limitations

Changes are uncommitted to repository
No automated tests for invoice pages
No breadcrumb navigation on detail pages
No bulk operations on invoices
No export functionality for invoices
EditInvoiceDialog component needs to be deleted

Update/Change Management Policy
Always ask to review files before updating them so we can maintain current development and not break existing developments.
Security, Privacy, and Compliance
Authentication

NextAuth session required for invoice operations
Google OAuth for user authentication
Session check in API routes: getServerSession(authOptions)

Data Access

Collaborative model: All authenticated users see same data
User ownership check on individual invoice operations
No row-level security on invoice listing

Environment Variables

NEXTAUTH_URL: Application URL
NEXTAUTH_SECRET: Session encryption
GOOGLE_CLIENT_ID: OAuth client ID
GOOGLE_CLIENT_SECRET: OAuth client secret
DATABASE_URL: PostgreSQL connection
EMAIL_SERVER_USER: Gmail SMTP username
EMAIL_SERVER_PASSWORD: Gmail SMTP password
CRON_SECRET: Bearer token for cron jobs

Glossary and Acronyms

CRUD: Create, Read, Update, Delete
UTC: Coordinated Universal Time
OAuth: Open Authorization
SMTP: Simple Mail Transfer Protocol
ORM: Object-Relational Mapping
YTD: Year-To-Date
Invoice: Financial document for payment request
Manifest: Daily summary email of due items