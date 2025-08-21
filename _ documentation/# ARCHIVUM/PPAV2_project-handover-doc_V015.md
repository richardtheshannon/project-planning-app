Project Planning Application V2 - Technical Handover
Metadata

Project Name: project-planning-V2
Repository URL: GitHub to Railway deployment (specific URL unknown)
Primary Branch: master
Commit Hash: Not specified
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
The project-planning-V2 application is a Next.js-based business management platform designed for project management, financial tracking, team collaboration, and document management. The application is currently stable with both production (MySQL) and development (PostgreSQL) environments deployed on Railway. Most recent development activity involved fixing timezone-related display issues for dates in the Operations Dashboard Today/Tomorrow cards (completed January 21, 2025), following earlier resolutions for Feature Requests and Invoices timezone issues.
Core Architectural Model
Core Architectural Model
This application is designed as a collaborative, multi-user platform. It is not a user-centric application. All authenticated users have access to and manage a single, shared database. Any data created or modified by one user will be visible to all other users.
Technical Overview and Current State
Overall Architecture

Framework: Next.js 13.5.6 with TypeScript
Database: PostgreSQL (migrated from MySQL)
ORM: Prisma 5.22.0
Authentication: NextAuth.js with Google OAuth
Deployment: Railway with automated deployments from GitHub master branch

Current Development State

Production Environment: Stable, running on Railway with MySQL database (legacy, should not be modified)
Development Environment: Active, running on Railway with PostgreSQL database
Local Development: Configured with local PostgreSQL containing backup of cloud development database

Recent Active Development

Operations Dashboard Today/Tomorrow cards timezone fix (completed January 21, 2025)
Timezone issue resolution for date displays in Feature Requests and Invoices (completed January 2025)
Client management enum value mismatch fix between frontend and backend (completed January 2025)
Feature Request system enhancement with due date functionality (completed)
Integration of Feature Requests into Operations Dashboard (completed)

Key Functionalities
Core Modules

Projects Management (/src/app/dashboard/projects/)

Project creation, editing, deletion
Timeline events tracking
Task management
Contact management
Document attachments


Feature Requests (/src/app/dashboard/FeatureRequests.tsx)

Request submission with priority levels
Due date tracking
Status management (Pending, In Progress, Done, Canceled)
Edit and delete capabilities


Operations Dashboard (/src/app/dashboard/operations/page.tsx)

Daily overview of time-sensitive items
Today/Tomorrow cards
Activity Calendar with month/week/day views
Integration of projects, tasks, timeline events, invoices, and feature requests


Financial Management (/src/app/dashboard/financials/)

Invoice tracking with DRAFT, PENDING, PAID, OVERDUE statuses
Client contract management
Expense tracking
Subscription management
Financial reporting


Team Management (/src/app/dashboard/team/)

Team member management
User authentication via Google OAuth
Role-based access (ADMIN, USER, VIEWER)


Documents Management (/src/app/dashboard/documents/)

File upload and storage
Project-linked documents



System Architecture
Component Structure
Client (Browser)
    ↕
Next.js Application
├── Pages/Routes (App Router)
├── API Routes
├── Components (UI)
└── Hooks/Utils
    ↕
Prisma ORM
    ↕
PostgreSQL Database (Railway)
    ↕
External Services
├── Google OAuth
└── Railway Platform
Data Flow

User authentication via NextAuth.js/Google OAuth
Client-side React components fetch data via API routes
API routes use Prisma ORM for database operations
PostgreSQL database stores all application data
Railway handles deployment and database hosting

Data Model
Schema Location

Primary schema: /prisma/schema.prisma
Migrations: /prisma/migrations/

Key Entities
prisma// /prisma/schema.prisma - lines 391-408
enum ContractTerm {
  ONE_MONTH
  ONE_TIME
  THREE_MONTH
  SIX_MONTH
  ONE_YEAR
}

model Client {
  id                String       @id @default(cuid())
  name              String
  email             String?
  website           String?
  notes             String?
  contractTerm      ContractTerm @default(ONE_TIME)
  contractAmount    Float?
  contractStartDate DateTime?
  frequency         String?
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  invoices  Invoice[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
prisma// /prisma/schema.prisma - lines 410-425
model Invoice {
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
Environment Variables
DATABASE_URL=postgresql://... (Railway PostgreSQL connection string)
NEXTAUTH_URL=...
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
APIs and Integrations
Internal API Routes
Feature Requests API
typescript// /src/app/api/feature-requests/route.ts
GET  /api/feature-requests - Fetch all feature requests
POST /api/feature-requests - Create new feature request

// /src/app/api/feature-requests/[id]/route.ts
GET    /api/feature-requests/[id] - Fetch single request
PUT    /api/feature-requests/[id] - Update request
DELETE /api/feature-requests/[id] - Delete request
Financial APIs
typescript// /src/app/api/financials/clients/route.ts
GET  /api/financials/clients - Fetch all clients
POST /api/financials/clients - Create new client

// /src/app/api/financials/clients/[id]/route.ts
GET    /api/financials/clients/[id] - Fetch single client with invoices
PATCH  /api/financials/clients/[id] - Update client
DELETE /api/financials/clients/[id] - Delete client

// /src/app/api/financials/invoices/route.ts
GET  /api/financials/invoices - Fetch all invoices
POST /api/financials/invoices - Create new invoice

// /src/app/api/financials/invoices/[id]/route.ts
GET    /api/financials/invoices/[id] - Fetch single invoice
PATCH  /api/financials/invoices/[id] - Update invoice
DELETE /api/financials/invoices/[id] - Delete invoice
External Integrations

NextAuth.js with Google OAuth for authentication
Railway for deployment and database hosting

Frontend
Framework and Tools

Framework: React 18.2.0 with Next.js 13.5.6
UI Library: Tailwind CSS 3.3.0
Component Library: Radix UI, shadcn/ui components
Icons: Lucide React
Charts: Recharts
State Management: React hooks (useState, useEffect, useMemo)

Key Components
Operations Dashboard Date Filtering
typescript// /src/app/dashboard/operations/page.tsx - lines 30-35
async function getOperationalData() {
  // Get the LOCAL date components (not UTC)
  const now = new Date();
  const localYear = now.getFullYear();
  const localMonth = now.getMonth();
  const localDay = now.getDate();
  
  // Create dates at midnight UTC for the LOCAL calendar date
  const today = new Date(Date.UTC(localYear, localMonth, localDay, 0, 0, 0));
  const tomorrow = new Date(Date.UTC(localYear, localMonth, localDay + 1, 0, 0, 0));
UTC Date Comparison Helper
typescript// /src/app/dashboard/operations/components/InteractiveCalendar.tsx - lines 42-46
const isSameDayUTC = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1).toLocaleDateString('en-US', { timeZone: 'UTC' });
  const d2 = new Date(date2).toLocaleDateString('en-US', { timeZone: 'UTC' });
  return d1 === d2;
};
Client Management Dialog
typescript// /src/components/financials/EditClientDialog.tsx - lines 206-210
<SelectContent>
  {/* Fixed: Use the EXACT enum values from Prisma schema */}
  <SelectItem value="ONE_MONTH">1 Month</SelectItem>
  <SelectItem value="THREE_MONTH">3 Month</SelectItem>
  <SelectItem value="SIX_MONTH">6 Month</SelectItem>
  <SelectItem value="ONE_YEAR">1 Year</SelectItem>
  <SelectItem value="ONE_TIME">One-Time</SelectItem>
</SelectContent>
Backend/Services
Framework

Next.js API Routes with TypeScript
Prisma ORM for database operations
NextAuth.js for authentication

Request Handling Pattern
typescript// Standard API route pattern
export async function GET/POST/PUT/DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });
  
  // Business logic with Prisma
  const data = await prisma.model.operation();
  
  return NextResponse.json(data);
}
Client Update Validation
typescript// /src/app/api/financials/clients/[id]/route.ts - lines 9-20
const clientUpdateSchema = z.object({
  name: z.string().min(2, {
    message: "Client name must be at least 2 characters.",
  }).optional(),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  contractStartDate: z.coerce.date().optional().nullable(),
  // Fixed: Use the actual Prisma enum values
  contractTerm: z.enum(['ONE_MONTH', 'ONE_TIME', 'THREE_MONTH', 'SIX_MONTH', 'ONE_YEAR']).optional(),
  frequency: z.string().optional(),
  contractAmount: z.number().positive("Amount must be a positive number.").optional().nullable(),
  notes: z.string().optional(),
}).partial();
Background Jobs/Workers
No background jobs or workers documented in current implementation.
Infrastructure and DevOps
Deployment Configuration
railway.json
json{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100
  }
}
package.json Scripts
json{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "db:deploy": "prisma migrate deploy",
    "start:prod": "npm run db:deploy && npm run start"
  }
}
Deployment Flow

Push to master branch triggers Railway deployment
Railway executes npm run build (generates Prisma client, builds Next.js)
Railway executes npm run start:prod (applies migrations, starts server)

Environments

Production: Railway project with MySQL database (legacy)
Development: Railway project with PostgreSQL database
Local: Local PostgreSQL with development data backup

Dependencies
Package.json Dependencies
json{
  "dependencies": {
    "next": "13.5.6",
    "react": "^18.2.0",
    "prisma": "^5.7.0",
    "@prisma/client": "^5.7.0",
    "next-auth": "4.24.5",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.3.0",
    "date-fns": "^[version]",
    "@radix-ui/[components]": "^[versions]",
    "lucide-react": "^[version]",
    "recharts": "^[version]",
    "sonner": "^[version]"
  }
}
Setup, Configuration, and Running
Local Development Setup

Clone repository
Install dependencies: npm install
Set up PostgreSQL locally
Configure .env with DATABASE_URL and auth credentials
Run migrations: npx prisma migrate deploy
Generate Prisma client: npx prisma generate
Start development server: npm run dev

Database Backup Location
/railway_backup_with_data.sql
Testing and Quality
Testing strategy not documented in provided sources - marked as Unknown.
Directory Map
project-planning-V2/
├── .husky/                          # Git hooks
├── .next/                          # Build output
├── .vscode/                        # VS Code settings
├── backups/                        # Database backups
├── documentation/                  # Project documentation
├── logs/                          # Application logs
├── node_modules/                  # Dependencies
├── prisma/
│   ├── migrations/                # Database migrations
│   │   ├── 20250820063145_init_postgres/
│   │   └── 20250820083801_add_due_date_to_feature_requests/
│   └── schema.prisma             # Database schema
├── public/                        # Static assets
│   ├── media/
│   └── uploads/
├── scripts/
│   ├── analyze-structure.js
│   ├── backup-database.js
│   ├── migrate-data.js
│   └── validate-migration.js
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── api/                  # API routes
│   │   │   ├── auth/
│   │   │   ├── feature-requests/
│   │   │   ├── financials/
│   │   │   │   ├── clients/
│   │   │   │   ├── expenses/
│   │   │   │   ├── invoices/
│   │   │   │   └── subscriptions/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   └── timeline-events/
│   │   ├── dashboard/            # Dashboard pages
│   │   │   ├── operations/
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/
│   │   │   │       ├── DailyItemsCard.tsx
│   │   │   │       └── InteractiveCalendar.tsx
│   │   │   ├── financials/
│   │   │   │   ├── income/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── expenses/
│   │   │   │   └── clients/
│   │   │   ├── projects/
│   │   │   ├── settings/
│   │   │   │   └── feature-requests/
│   │   │   ├── team/
│   │   │   └── documents/
│   │   └── FeatureRequests.tsx  # Feature requests component
│   ├── components/               # Reusable components
│   │   ├── financials/
│   │   │   ├── NewInvoiceDialog.tsx
│   │   │   ├── EditInvoiceDialog.tsx
│   │   │   ├── EditClientDialog.tsx
│   │   │   └── AddClientDialog.tsx
│   │   └── ui/                  # UI components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities
│   │   └── prisma.ts           # Prisma client
│   └── types/                    # TypeScript types
├── .env                          # Environment variables
├── .gitignore
├── next-env.d.ts
├── package-lock.json
├── package.json
├── railway.json                  # Railway deployment config
├── railway_backup_with_data.sql # Database backup
├── tailwind.config.js
└── tsconfig.json
Challenges, Errors, Failures, Revisions, and Resolutions
Operations Dashboard Timezone Issue (January 21, 2025)
Issue
Today and Tomorrow cards in Operations Dashboard displayed items for wrong dates (showing items 1-2 days ahead).
Root Cause
Server-side date creation was using UTC-shifted dates for comparison. When new Date() was called at 7:16 PM PDT on Aug 20, it created a date that when converted to UTC became Aug 21 at 2:16 AM.
Debug Output
today (raw): Wed Aug 20 2025 19:16:47 GMT-0700 (Pacific Daylight Time)
today (ISO): 2025-08-21T02:16:47.865Z
today (UTC string): 8/21/2025
today (local string): 8/20/2025
Resolution
Modified /src/app/dashboard/operations/page.tsx to use local date components when creating UTC comparison dates:
typescriptconst localYear = now.getFullYear();
const localMonth = now.getMonth();
const localDay = now.getDate();
const today = new Date(Date.UTC(localYear, localMonth, localDay, 0, 0, 0));
Timezone Issue Resolution (December 2024 - January 2025)
Issue
Feature requests and invoices with due dates displayed one day behind in Activity Calendar and didn't appear in Today/Tomorrow cards.
Root Cause
JavaScript Date object and HTML date inputs handle timezones differently:

HTML date inputs create dates at midnight in browser's local timezone
PostgreSQL stores dates as UTC timestamps
JavaScript Date comparisons use local timezone by default

Resolution Timeline

Initial attempts: Modified API to save dates at noon UTC (T12:00:00Z) - unsuccessful
Analysis: Discovered successful pattern in Timeline Events implementation
Final fix: Display dates using toLocaleDateString('en-US', { timeZone: 'UTC' })

Files Modified

/src/app/FeatureRequests.tsx - Added UTC timezone to date displays
/src/app/dashboard/operations/page.tsx - UTC date string comparison
/src/app/dashboard/operations/components/InteractiveCalendar.tsx - Custom UTC comparison
/src/app/dashboard/financials/income/page.tsx - UTC date display for invoices
/src/components/financials/EditInvoiceDialog.tsx - Removed timezone adjustment function

Client Update Enum Mismatch (January 2025)
Issue
Client update operations failing with Prisma validation error for contractTerm field.
Root Cause
Frontend sending values like "ANNUAL", "QUARTERLY" while Prisma schema defined:

ONE_MONTH
ONE_TIME
THREE_MONTH
SIX_MONTH
ONE_YEAR

Resolution

Updated /src/app/api/financials/clients/[id]/route.ts validation schema
Fixed /src/components/financials/EditClientDialog.tsx SelectItem values

Historical Deployment Issues
Silent Deployment Failures

Issue: Railway deployments failing without error messages
Cause: Database migrations failing during build phase
Fix: Moved migrations to deploy phase via start:prod script

DATABASE_URL Configuration

Issue: Migrations failed to connect to database
Cause: DATABASE_URL pointing to old MySQL database
Fix: Updated Railway environment variable to PostgreSQL connection string

Known Issues and Limitations
Current Limitations

Modal scrolling for long feature request descriptions - RESOLVED
Feature request due dates in operations dashboard - RESOLVED
Timezone display issues - RESOLVED
Client enum value mismatch - RESOLVED

Open Issues
No critical open issues documented at time of handover.
Update/Change Management Policy
Always ask to review files before updating them so we can maintain current development and not break existing developments.
Security, Privacy, and Compliance
Authentication

Google OAuth via NextAuth.js
Session-based authentication
Server-side session validation on all API routes

Environment Variables
NEXTAUTH_SECRET=[secret_value]
GOOGLE_CLIENT_ID=[client_id]
GOOGLE_CLIENT_SECRET=[client_secret]
DATABASE_URL=[postgresql_connection_string]
Data Access
All authenticated users have full access to shared database as per Core Architectural Model.
Glossary and Acronyms

ORM: Object-Relational Mapping
UTC: Coordinated Universal Time
CRUD: Create, Read, Update, Delete
SSR: Server-Side Rendering
API: Application Programming Interface
OAuth: Open Authorization
IaC: Infrastructure as Code
CI/CD: Continuous Integration/Continuous Deployment
Railway: Platform-as-a-Service deployment platform
Prisma: TypeScript ORM for database operations
Next.js: React framework for production applications
PostgreSQL: Open-source relational database
shadcn/ui: Component library built on Radix UI
PDT: Pacific Daylight Time
ISO: International Organization for Standardization (date format)