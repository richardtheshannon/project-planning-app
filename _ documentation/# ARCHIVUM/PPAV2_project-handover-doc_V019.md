Project Planning Application V2 - Layout Templates Feature Implementation Handover

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

The project-planning-V2 application is a collaborative project management platform built with Next.js 13.5.6, TypeScript, PostgreSQL via Prisma ORM, and deployed on Railway. The application has been extended with a layout templates feature under the settings section, allowing users to view and manage different layout templates for the application. The dashboard previously had an "Overdue" card implementation with collapsible functionality. Current development involves creating a layout templates system, though a caching issue prevents the updated template from displaying correctly in the preview.

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

Environment: Windows development with VS Code and CMD terminal



Current Development State



Layout templates feature partially implemented under /dashboard/settings/layouts

Database model LayoutTemplate added to Prisma schema

Template preview page created at /dashboard/settings/layouts/\[id]

Settings navigation component created

API route for template reset at /api/templates/reset

Active Issue: Template preview showing old cached version despite database updates



Key Functionalities

Layout Templates Feature



Component: /src/app/dashboard/settings/layouts/page.tsx

Lists all layout templates by category

Auto-initializes default dashboard template on first load

Template cards with preview and edit buttons (edit disabled)



Template Preview



Component: /src/app/dashboard/settings/layouts/\[id]/page.tsx

Client Component: /src/app/dashboard/settings/layouts/\[id]/TemplateViewer.tsx

Shows template with three tabs: Preview, Code, Variables

Live HTML preview in iframe with sample data

Copy code functionality with visual feedback



Settings Navigation



Component: /src/app/dashboard/settings/components/SettingsNav.tsx

Sidebar navigation for settings sections

Active state highlighting

Links to: Notifications, Appearance, Feature Requests, Layouts



Dashboard Overdue Items



Component: /src/app/dashboard/page.tsx lines 26-127

Fetches overdue projects, timeline events, invoices, and feature requests

Collapsible cards with chevron indicators

Vertical stacking layout



System Architecture

Component Hierarchy

Dashboard (/src/app/dashboard/page.tsx)

└── MonthlyTimeline (/src/app/dashboard/MonthlyTimeline.tsx)

&nbsp;   ├── Overdue Card (collapsible)

&nbsp;   ├── This Month Card (collapsible)

&nbsp;   └── Next Month Card (collapsible)



Settings (/src/app/dashboard/settings/layout.tsx)

├── SettingsNav (/src/app/dashboard/settings/components/SettingsNav.tsx)

└── Layouts (/src/app/dashboard/settings/layouts/page.tsx)

&nbsp;   └── \[id] (/src/app/dashboard/settings/layouts/\[id]/page.tsx)

&nbsp;       └── TemplateViewer (./TemplateViewer.tsx)

Data Flow



User navigates to /dashboard/settings/layouts

Page fetches templates from database via Prisma

Templates displayed in card grid

Clicking Preview navigates to /dashboard/settings/layouts/\[id]

Preview page loads template and renders in TemplateViewer client component

Template HTML rendered in iframe with variable substitution



Data Model

Prisma Schema Entities

prismamodel LayoutTemplate {

&nbsp; id          String   @id @default(cuid())

&nbsp; name        String

&nbsp; description String?

&nbsp; category    String   @default("dashboard")

&nbsp; htmlContent String   @db.Text

&nbsp; thumbnail   String?

&nbsp; isActive    Boolean  @default(false)

&nbsp; isDefault   Boolean  @default(false)

&nbsp; metadata    String?  @db.Text

&nbsp; createdAt   DateTime @default(now())

&nbsp; updatedAt   DateTime @updatedAt

&nbsp; 

&nbsp; @@map("layout\_templates")

}

Other Relevant Models



Project - with endDate for overdue tracking

TimelineEvent - with eventDate and isCompleted

Invoice - with dueDate and status

FeatureRequest - with dueDate and status



Environment Variables



DATABASE\_URL - PostgreSQL connection string for Railway



APIs and Integrations

Template Reset API



Endpoint: /api/templates/reset

Method: POST

Purpose: Deletes all templates and creates default full application template

Response: JSON with success status and message



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

Framework and Tools



Next.js 13.5.6 App Router

React 18

TypeScript

Tailwind CSS

shadcn/ui components



Key Components

Layout Templates Page

typescript// src/app/dashboard/settings/layouts/page.tsx

const initializeDashboardTemplate = async () => {

&nbsp; const existingTemplate = await prisma.layoutTemplate.findFirst({

&nbsp;   where: { isDefault: true }

&nbsp; });

&nbsp; // Creates default template if none exists

}

Template Viewer Client Component

typescript// src/app/dashboard/settings/layouts/\[id]/TemplateViewer.tsx

"use client";

const handleCopy = () => {

&nbsp; navigator.clipboard.writeText(template.htmlContent);

&nbsp; setCopied(true);

&nbsp; setTimeout(() => setCopied(false), 2000);

};

Routing



/dashboard - Main dashboard

/dashboard/settings - Settings overview

/dashboard/settings/layouts - Layout templates list

/dashboard/settings/layouts/\[id] - Template preview

/dashboard/settings/feature-requests - Feature requests

/dashboard/financials/income - Invoices



Backend/Services

Prisma ORM Configuration



Database: PostgreSQL on Railway

Client generation: npx prisma generate

Migrations: npx prisma migrate dev



Server Components



Most pages are React Server Components

Direct database access via Prisma in server components

Client components used for interactivity (TemplateViewer, MonthlyTimeline)



Background Jobs/Workers

No background jobs or workers documented in current implementation.

Infrastructure and DevOps

Deployment



Platform: Railway

Build Command: prisma generate \&\& next build

Start Command: npm start

Database: PostgreSQL managed by Railway



Development Environment



OS: Windows

Editor: Visual Studio Code

Terminal: CMD (not PowerShell)

Version Control: Git → GitHub → Railway



Migration Strategy

cmdnpx prisma migrate dev --name add-layout-templates

npx prisma generate

git add prisma/migrations

git add prisma/schema.prisma

git commit -m "Add layout templates feature with database migration"

git push

Dependencies

Package.json Dependencies

json{

&nbsp; "next": "13.5.6",

&nbsp; "react": "^18",

&nbsp; "@prisma/client": "^\[version]",

&nbsp; "next-auth": "^\[version]",

&nbsp; "next-themes": "^\[version]",

&nbsp; "lucide-react": "^\[version]",

&nbsp; "tailwindcss": "^\[version]"

}

shadcn/ui Components



Button, Card, Badge, Tabs

Installation: npx shadcn-ui@latest add \[component]



Setup, Configuration, and Running

Local Development

cmdnpm install

npx prisma generate

npx prisma migrate dev

npm run dev

Database Setup

cmdnpx prisma migrate dev --name add-layout-templates

npx prisma generate

npx prisma studio

Reset Templates

cmdcurl -X POST http://localhost:3000/api/templates/reset

Testing and Quality

Manual testing completed for:



Layout templates page loading

Template preview functionality

Settings navigation

Overdue items data fetching

Collapsible card functionality



No automated tests documented.

Directory Map

src/

├── app/

│   ├── dashboard/

│   │   ├── page.tsx                          # Dashboard with overdue items

│   │   ├── MonthlyTimeline.tsx               # Collapsible timeline cards

│   │   ├── settings/

│   │   │   ├── layout.tsx                    # Settings layout with navigation

│   │   │   ├── page.tsx                      # Settings overview page

│   │   │   ├── components/

│   │   │   │   └── SettingsNav.tsx           # Settings navigation sidebar

│   │   │   └── layouts/

│   │   │       ├── page.tsx                  # Layout templates list

│   │   │       └── \[id]/

│   │   │           ├── page.tsx              # Template preview page

│   │   │           └── TemplateViewer.tsx    # Client component for preview

│   │   └── components/

│   │       ├── FinancialOverviewChart.tsx

│   │       ├── ContactForm.tsx

│   │       └── QuickActionsCard.tsx

│   └── api/

│       ├── templates/

│       │   └── reset/

│       │       └── route.ts                  # Reset templates endpoint

│       ├── feature-requests/

│       │   └── route.ts

│       ├── invoices/

│       │   └── route.ts

│       └── timeline-events/

│           └── route.ts

├── lib/

│   └── prisma.ts                            # Prisma client instance

└── components/

&nbsp;   └── ui/                                   # shadcn/ui components

&nbsp;       ├── badge.tsx

&nbsp;       ├── button.tsx

&nbsp;       ├── card.tsx

&nbsp;       └── tabs.tsx

prisma/

├── schema.prisma                            # Database schema with LayoutTemplate

└── migrations/

&nbsp;   └── \[timestamp]\_add\_layout\_templates/

&nbsp;       └── migration.sql

Challenges, Errors, Failures, Revisions, and Resolutions

Issue 1: TypeScript Errors with Prisma Client (January 21, 2025)



Error: "Property 'layoutTemplate' does not exist on type 'PrismaClient'"

Root Cause: Prisma client not regenerated after schema changes

Resolution: Run npx prisma generate and restart TypeScript server

Files Modified: None, client regeneration only



Issue 2: Server/Client Component Conflict (January 21, 2025)



Error: "Event handlers cannot be passed to Client Component props"

Root Cause: onClick handler in Server Component

Resolution: Created TemplateViewer client component

Files Created: /src/app/dashboard/settings/layouts/\[id]/TemplateViewer.tsx



Issue 3: Badge Variant Type Error (January 21, 2025)



Error: "Type 'success' is not assignable to type 'default | secondary | destructive | outline'"

Resolution: Changed variant from "success" to "default"

Files Modified: /src/app/dashboard/settings/layouts/\[id]/page.tsx lines 75, 224



Issue 4: Template Caching (January 21, 2025 - UNRESOLVED)



Error: Template preview shows old version despite database updates

Attempted Solutions:



Hard browser refresh (Ctrl+Shift+R)

Clear Next.js cache (delete .next folder)

Verify database update via Prisma Studio

Force new template creation





Status: Unresolved, requires further investigation



Known Issues and Limitations

Current Open Issues



Template Preview Caching: Preview page displays outdated template content despite successful database updates. Template reset API confirms update but preview remains cached.

Edit Functionality Disabled: Template editing buttons present but intentionally disabled

Single Template Limitation: System currently manages one default template



Documented Workarounds



For caching issue: Clear browser cache, delete .next folder, restart dev server

Check database directly with npx prisma studio to verify updates



Update/Change Management Policy

Always ask to review files before updating them so we can maintain current development and not break existing developments.

Security, Privacy, and Compliance

Authentication



NextAuth.js with Google OAuth provider

All dashboard routes protected by session authentication

Session checks in API routes



Data Access



Collaborative model: all authenticated users access same data

No row-level security implemented

Shared database access for all users



Environment Variables



DATABASE\_URL: PostgreSQL connection string (not redacted per requirements)

NEXTAUTH\_URL: Application URL for authentication

NEXTAUTH\_SECRET: Session encryption secret

GOOGLE\_CLIENT\_ID: OAuth client identifier

GOOGLE\_CLIENT\_SECRET: OAuth client secret



Glossary and Acronyms



YTD: Year-to-Date

CRUD: Create, Read, Update, Delete

OAuth: Open Authorization

shadcn/ui: Component library for UI elements

Prisma ORM: Object-Relational Mapping tool for database access

Railway: Cloud platform for deployment

UTC: Coordinated Universal Time

PST: Pacific Standard Time

API: Application Programming Interface

HTML: HyperText Markup Language

CSS: Cascading Style Sheets

CMD: Windows Command Prompt

