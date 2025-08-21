Project Planning Application V2 - Dashboard Overdue Items Implementation Handover

Metadata



Project Name: project-planning-V2

Repository URL: GitHub to Railway deployment

Primary Branch: master

Commit Hash: Not yet committed (pending changes)

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

The project-planning-V2 application has been updated to replace the "Last Month" card on the main dashboard with an "Overdue" card that displays overdue items across multiple features including projects, timeline events, invoices, and feature requests. The implementation includes collapsible cards with chevron indicators, vertical stacking layout, and proper segmentation with direct links to respective pages. All cards default to a collapsed state on page load.

Core Architectural Model

Core Architectural Model

This application is designed as a collaborative, multi-user platform. It is not a user-centric application. All authenticated users have access to and manage a single, shared database. Any data created or modified by one user will be visible to all other users.

Technical Overview and Current State

Overall Architecture



Framework: Next.js 13.5.6 with TypeScript

Theme System: next-themes with class-based dark mode

Database: PostgreSQL via Prisma ORM

Authentication: NextAuth.js with Google OAuth

Deployment: Railway platform

Styling: Tailwind CSS with custom shadcn/ui components



Current Development State



Dashboard main page updated with overdue items functionality

MonthlyTimeline component converted to client component for state management

Collapsible cards implemented with chevron icons

Vertical stacking layout for all screen sizes

Links corrected to proper routes



Key Functionalities

Dashboard Overdue Items Feature



Component: /src/app/dashboard/page.tsx lines 26-127

Fetches overdue projects with end dates before today

Retrieves pending timeline events past due date

Shows draft invoices with overdue due dates

Displays pending/in-progress feature requests past due date



Collapsible Timeline Cards



Component: /src/app/dashboard/MonthlyTimeline.tsx

Client-side state management for expand/collapse functionality

Chevron icons in top-right corner

Default collapsed state on page load

Item count display in card headers



System Architecture

Component Hierarchy

Dashboard (/src/app/dashboard/page.tsx)

└── MonthlyTimeline (/src/app/dashboard/MonthlyTimeline.tsx)

&nbsp;   ├── Overdue Card (collapsible)

&nbsp;   ├── This Month Card (collapsible)

&nbsp;   └── Next Month Card (collapsible)

Data Flow



Dashboard page fetches overdue items via getOverdueItems() function

Data passed as props to MonthlyTimeline component

MonthlyTimeline manages collapse state locally

Items grouped by type and displayed with appropriate links



Data Model

Relevant Schema Entities

prismamodel Project {

&nbsp; id           String         @id @default(cuid())

&nbsp; name         String

&nbsp; status       ProjectStatus  @default(PLANNING)

&nbsp; endDate      DateTime?

&nbsp; // ... other fields

}



model TimelineEvent {

&nbsp; id          String   @id @default(cuid())

&nbsp; title       String

&nbsp; eventDate   DateTime?

&nbsp; isCompleted Boolean  @default(false)

&nbsp; projectId   String

&nbsp; // ... other fields

}



model Invoice {

&nbsp; id            String        @id @default(cuid())

&nbsp; invoiceNumber String        @unique

&nbsp; status        InvoiceStatus @default(DRAFT)

&nbsp; dueDate       DateTime

&nbsp; clientId      String

&nbsp; // ... other fields

}



model FeatureRequest {

&nbsp; id          Int      @id @default(autoincrement())

&nbsp; title       String

&nbsp; status      String   @default("Pending")

&nbsp; dueDate     DateTime?

&nbsp; // ... other fields

}

APIs and Integrations

Feature Requests API



Endpoint: /api/feature-requests

Methods: GET, POST

Authentication: Required via NextAuth session



Invoices API



Endpoint: /api/invoices

Methods: GET, POST

Authentication: Required via NextAuth session



Timeline Events API



Endpoint: /api/timeline-events

Methods: GET, POST

Query Parameters: projectId (required for GET)

Authentication: Required via NextAuth session



Frontend

Modified Components

Dashboard Page (/src/app/dashboard/page.tsx)



Added OverdueItem type definition (lines 26-35)

Implemented getOverdueItems() async function (lines 41-127)

Replaced lastMonthActivity with overdueItems in data fetching

Props updated for MonthlyTimeline component



MonthlyTimeline Component (/src/app/dashboard/MonthlyTimeline.tsx)



Converted to client component with 'use client' directive

Added state management with useState hook

Vertical stacking layout with space-y-4

Collapsible card headers with cursor-pointer

Chevron icons (ChevronUp/ChevronDown) from lucide-react



Routing Updates



Feature Requests: /dashboard/settings/feature-requests

Invoices: /dashboard/financials/income

Projects: /dashboard/projects/${projectId}

Timeline Events: /dashboard/projects/${projectId}



Backend/Services

No backend changes were required for this implementation. All existing API routes remain unchanged.

Background Jobs/Workers

No changes to background jobs or workers.

Infrastructure and DevOps

Deployment



Platform: Railway

Environment Variables: DATABASE\_URL (PostgreSQL connection string)

No infrastructure changes required for this update



Dependencies

Existing Dependencies Used

json{

&nbsp; "next": "13.5.6",

&nbsp; "react": "^18",

&nbsp; "@prisma/client": "^\[version]",

&nbsp; "next-auth": "^\[version]",

&nbsp; "next-themes": "^\[version]",

&nbsp; "lucide-react": "^\[version]",

&nbsp; "tailwindcss": "^\[version]"

}

Setup, Configuration, and Running

No additional setup required beyond existing configuration. The overdue items functionality uses existing database queries and components.

Testing and Quality

Manual testing completed for:



Overdue items data fetching accuracy

Collapsible card functionality

Link navigation to correct pages

Responsive behavior on mobile and desktop

Default collapsed state on page load



Directory Map

src/

├── app/

│   ├── dashboard/

│   │   ├── page.tsx                # MODIFIED: Added overdue items logic

│   │   ├── MonthlyTimeline.tsx     # MODIFIED: Client component with collapsible cards

│   │   └── components/

│   │       ├── FinancialOverviewChart.tsx

│   │       ├── ContactForm.tsx

│   │       └── QuickActionsCard.tsx

│   └── api/

│       ├── feature-requests/

│       │   └── route.ts

│       ├── invoices/

│       │   └── route.ts

│       └── timeline-events/

│           └── route.ts

└── lib/

&nbsp;   └── prisma.ts

Challenges, Errors, Failures, Revisions, and Resolutions

Issue 1: Incorrect Link Paths (January 21, 2025)



Error: Feature requests link pointed to /dashboard/feature-requests

Resolution: Corrected to /dashboard/settings/feature-requests

Files Modified: /src/app/dashboard/MonthlyTimeline.tsx line 74



Issue 2: Incorrect Invoice Link (January 21, 2025)



Error: Invoice link pointed to /dashboard/financials/invoices

Resolution: Corrected to /dashboard/financials/income

Files Modified: /src/app/dashboard/MonthlyTimeline.tsx line 72



Known Issues and Limitations

None identified at this time.

Update/Change Management Policy

Always ask to review files before updating them so we can maintain current development and not break existing developments.

Security, Privacy, and Compliance

Authentication



All dashboard data protected by NextAuth session authentication

Overdue items accessible to all authenticated users

No user-specific filtering applied (collaborative platform model)



Data Access



All users can view all overdue items across the system

No row-level security implemented

Shared database access model as per architectural design



Glossary and Acronyms



UTC: Coordinated Universal Time

PST: Pacific Standard Time

CRUD: Create, Read, Update, Delete

OAuth: Open Authorization

shadcn/ui: Component library for UI elements

Prisma ORM: Object-Relational Mapping tool for database access

