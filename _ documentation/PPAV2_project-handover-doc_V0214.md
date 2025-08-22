Project Planning Application V2 - Technical Handover Documentation
Metadata

Project Name: project-planning-V2
Repository URL: GitHub to Railway deployment
Primary Branch: master
Commit Hash: Uncommitted changes (Session 2025-01-21)
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
The project-planning-V2 application is a comprehensive project management platform built with Next.js 13.5.6, TypeScript, PostgreSQL, and Prisma ORM, deployed on Railway. The system includes project tracking, task management, financial management (invoices, expenses, subscriptions), timeline events, feature requests, team collaboration, and document management. Recent development has focused on converting invoice viewing from modal-based to URL-based individual pages and fixing collaborative model inconsistencies in API routes.
Core Architectural Model
Core Architectural Model
This application is designed as a collaborative, multi-user platform. It is not a user-centric application. All authenticated users have access to and manage a single, shared database. Any data created or modified by one user will be visible to all other users.
Technical Overview and Current State
Overall Architecture

Framework: Next.js 13.5.6 with App Router
Language: TypeScript
Database: PostgreSQL via Prisma ORM
Authentication: NextAuth.js with Google OAuth
Email Service: Nodemailer with Gmail SMTP
Deployment: Railway platform
Styling: Tailwind CSS with shadcn/ui components

Current Development State
Active uncommitted changes from current session (2025-01-21):

/src/app/api/financials/invoices/[id]/route.ts - Modified to remove userId filters for collaborative model
/src/app/layout.tsx - Updated with explicit favicon configuration

Previously uncommitted changes from prior session:

/src/app/dashboard/financials/invoices/[id]/page.tsx - New file created
/src/app/dashboard/financials/income/page.tsx - Modified to use navigation
/src/components/financials/NewInvoiceDialog.tsx - Updated to redirect after creation
/src/app/dashboard/financials/page.tsx - Updated invoice links
/src/app/api/cron/send-manifest/route.ts - Updated invoice links
/src/app/api/cron/send-afternoon-manifest/route.ts - Updated invoice links

Key Functionalities
Project Management

Projects Module: /src/app/dashboard/projects/ - CRUD operations for projects
Tasks System: Task creation, assignment, status tracking within projects
Timeline Events: Date-based milestones and events for projects

Financial Management

Invoices: /src/app/dashboard/financials/income/page.tsx - List view with individual pages
Invoice Details: /src/app/dashboard/financials/invoices/[id]/page.tsx - Individual invoice pages
Expenses: Expense tracking and categorization
Subscriptions: Recurring payment management
Clients: /src/app/dashboard/financials/clients/ - Client management

Operations Dashboard

Dashboard: /src/app/dashboard/operations/page.tsx - Activity calendar and due items
Feature Requests: /src/app/dashboard/settings/feature-requests/ - Development feature tracking
Quick Actions: /src/app/dashboard/components/QuickActionsCard.tsx - Rapid access to common tasks

Team & Documents

Team Management: /src/app/dashboard/team/ - User collaboration
Documents: /src/app/dashboard/documents/ - File upload and management

System Architecture
Component Interaction Flow
User Interface Layer:
├── Dashboard Pages
│   ├── Main Dashboard
│   ├── Projects
│   ├── Financials
│   │   ├── Income (Invoices)
│   │   ├── Expenses
│   │   └── Reports
│   ├── Operations
│   └── Settings
│
API Layer:
├── /api/auth/[...nextauth]
├── /api/financials/
│   ├── invoices/
│   ├── expenses/
│   └── clients/
├── /api/projects/
├── /api/tasks/
├── /api/feature-requests/
└── /api/cron/
    ├── send-manifest/
    └── send-afternoon-manifest/
│
Data Layer:
└── PostgreSQL → Prisma ORM → Application Models
Data Model
Core Entities
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

model FeatureRequest {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  status      String   @default("Pending")
  priority    String   @default("Medium")
  submittedBy String
  dueDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
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
typescript// GET /api/financials/invoices
// Returns all invoices with client information
// No user filtering (collaborative model)

// POST /api/financials/invoices
// Creates new invoice
// Auto-generates invoice number: INV-${Date.now().toString(36).toUpperCase()}

// GET /api/financials/invoices/[id]
// Returns single invoice by ID
// Authentication required, no ownership check (collaborative)

// PATCH /api/financials/invoices/[id]
// Updates invoice fields
// Authentication required

// DELETE /api/financials/invoices/[id]
// Deletes invoice
// Authentication required
Feature Request API
typescript// POST /api/feature-requests
// Request body: { title, description, priority, status, submittedBy, dueDate }
// Response: Created feature request with ID
Frontend
Framework and Tools

Next.js 13.5.6 with App Router
TypeScript
Tailwind CSS
shadcn/ui components
Fonts: Roboto (titles), Nunito (paragraphs)

Key Components
typescript// /src/app/dashboard/components/QuickActionsCard.tsx, lines 94-123
<Card>
  <CardHeader>
    <CardTitle>Quick Actions</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex flex-col space-y-4">
      <Link href="/dashboard/projects/new">
        <Button className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Project
        </Button>
      </Link>
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <FileText className="mr-2 h-4 w-4" />
        Feature Request
      </Button>
    </div>
  </CardContent>
</Card>
Backend/Services
Request Handling

NextAuth for authentication with Google OAuth
Prisma ORM for database operations
Server-side data fetching in page components

Business Logic Entry Points

API routes in /src/app/api/
Server components for data fetching
Form actions for mutations

Background Jobs/Workers
Email Manifests

Morning Manifest: /src/app/api/cron/send-manifest/route.ts

Sends daily summary of items due today
Triggered via GET with CRON_SECRET bearer token


Afternoon Manifest: /src/app/api/cron/send-afternoon-manifest/route.ts

Sends summary of items due tomorrow
Both support manual trigger via POST



Infrastructure and DevOps
Deployment Configuration

Platform: Railway
Build Command: prisma generate && next build
Start Command: npm start
Environment Variables: Managed in Railway dashboard

Database

PostgreSQL hosted on Railway
Migrations managed via Prisma: npx prisma migrate dev
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
All variables listed in Data Model section must be configured.
Testing and Quality
No automated tests documented. Manual testing performed during development sessions.
Directory Map
C:.
├───documentation/
├───prisma/
│   ├───migrations/
│   └───schema.prisma
├───public/
│   ├───favicon.ico (to be removed - duplicate)
│   └───uploads/
├───src/
│   ├───app/
│   │   ├───api/
│   │   │   ├───auth/[...nextauth]/
│   │   │   ├───financials/
│   │   │   │   ├───invoices/
│   │   │   │   │   ├───route.ts
│   │   │   │   │   └───[id]/route.ts (modified)
│   │   │   ├───feature-requests/
│   │   │   └───cron/
│   │   ├───dashboard/
│   │   │   ├───page.tsx
│   │   │   ├───components/
│   │   │   │   └───QuickActionsCard.tsx
│   │   │   ├───financials/
│   │   │   │   ├───income/page.tsx (modified)
│   │   │   │   └───invoices/
│   │   │   │       └───[id]/page.tsx (new)
│   │   ├───favicon.ico (primary location)
│   │   └───layout.tsx (modified)
│   ├───components/
│   │   └───financials/
│   │       ├───NewInvoiceDialog.tsx (modified)
│   │       └───EditInvoiceDialog.tsx (to be deleted)
│   └───lib/
│       └───prisma.ts
Challenges, Errors, Failures, Revisions, and Resolutions
Session 2025-01-21 Issues and Resolutions
Issue 1: Invoice 404 Error

Problem: Invoice cmeklrpsy0001wz7fhp66dvrc returned 404 when clicked
Root Cause: Mismatch between collaborative model and userId ownership checks in API
Resolution: Removed userId filters from /src/app/api/financials/invoices/[id]/route.ts
Files Modified: GET, PATCH, DELETE methods updated to remove ownership restriction

Issue 2: Favicon 500 Error

Problem: Favicon.ico returning 500 error on all pages
Root Cause: Duplicate favicon files in /public and /src/app directories
Resolution: Removed /public/favicon.ico, updated metadata in layout.tsx
Files Modified: /src/app/layout.tsx with explicit favicon configuration

Previous Session Issues
Invoice Modal to Page Transition

Problem: Invoices opening in modals instead of dedicated pages
Resolution: Created new detail page component at /src/app/dashboard/financials/invoices/[id]/page.tsx

Timezone Issue (Resolved Previously)

Problem: Dates displaying one day behind due to timezone handling
Resolution: Implemented UTC date display and comparison throughout application

Known Issues and Limitations
Current Limitations

Changes are uncommitted to repository
No automated tests for invoice pages
No breadcrumb navigation on detail pages
No bulk operations on invoices
EditInvoiceDialog component needs to be deleted
No export functionality for invoices

Update/Change Management Policy
Always ask to review files before updating them so we can maintain current development and not break existing developments.
Security, Privacy, and Compliance
Authentication

NextAuth session required for all protected routes
Google OAuth for user authentication
Session check in API routes: getServerSession(authOptions)

Data Access

Collaborative model: All authenticated users see same data
No row-level security on data access
Authentication required but no ownership restrictions

Environment Variables

NEXTAUTH_URL: Application URL
NEXTAUTH_SECRET: Session encryption key
GOOGLE_CLIENT_ID: OAuth client identifier
GOOGLE_CLIENT_SECRET: OAuth client secret
DATABASE_URL: PostgreSQL connection string
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
Feature Request: User-submitted development request
Timeline Event: Project milestone or scheduled event