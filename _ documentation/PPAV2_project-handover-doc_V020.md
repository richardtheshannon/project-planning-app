Project Planning Application V2 - File-Based Templates Implementation Handover

Metadata



Project Name: project-planning-V2

Repository URL: GitHub to Railway deployment

Primary Branch: master

Commit Hash: Pending (uncommitted changes)

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

The project-planning-V2 application is a collaborative project management platform built with Next.js 13.5.6, TypeScript, PostgreSQL via Prisma ORM, and deployed on Railway. The application features a newly refactored template system that has been migrated from database storage to a file-based system, allowing developers to edit HTML templates directly in VS Code and see changes on refresh during development. The system includes layout templates for different application views, with the ability to preview templates with sample data and view them in full browser windows.

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

Template System: File-based HTML templates with JSON metadata

Environment: Windows development with VS Code and CMD terminal



Current Development State



Template system successfully migrated from database to file-based storage

Templates stored in /src/templates/ directory structure

Template metadata managed via templates.json configuration file

Preview functionality working with variable substitution

Full view capability implemented via API route

Layouts accessible via Settings submenu in main navigation



Key Functionalities

Template System



Template Storage: /src/templates/ directory



HTML files editable in VS Code

JSON metadata configuration

Category-based organization





Template Service: /src/lib/template-service.ts



Reads templates from filesystem

Provides template listing and retrieval

Handles metadata parsing





Template Preview: /src/app/dashboard/settings/layouts/\[id]/page.tsx



Server component with forced dynamic rendering

Variable substitution with sample data

Three-tab interface (Preview, Code, Variables)





Template Viewer: /src/app/dashboard/settings/layouts/\[id]/TemplateViewer.tsx



Client component for interactive features

Copy code functionality

Full view in new window

Variable display with sample values





API Routes:



/api/templates/preview/\[id] - Serves full HTML with variables replaced







Dashboard Features



Dashboard Page: /src/app/dashboard/page.tsx



Overdue items tracking

Monthly timeline with collapsible cards

Project and task statistics





Settings Navigation: Expandable sidebar with Layouts submenu



System Architecture

Component Hierarchy

Dashboard Layout (/src/app/dashboard/layout.tsx)

├── Sidebar (with Settings > Layouts navigation)

└── Main Content

&nbsp;   └── Settings (/src/app/dashboard/settings/)

&nbsp;       └── Layouts (/src/app/dashboard/settings/layouts/)

&nbsp;           ├── Template List (page.tsx)

&nbsp;           └── Template Preview (\[id]/page.tsx)

&nbsp;               └── TemplateViewer (client component)

Data Flow



User navigates to /dashboard/settings/layouts

Page reads templates.json via template-service

Templates displayed in categorized card grid

Clicking Preview navigates to /dashboard/settings/layouts/\[id]

Template HTML loaded from filesystem

Variables replaced with sample data

Template rendered in iframe or new window



Data Model

File-Based Templates

typescript// Template structure in templates.json

{

&nbsp; "templates": \[

&nbsp;   {

&nbsp;     "id": "full-app",

&nbsp;     "name": "Full Application Layout",

&nbsp;     "description": "Complete application template",

&nbsp;     "category": "application",

&nbsp;     "file": "application/full-app.html",

&nbsp;     "isDefault": true,

&nbsp;     "isActive": true,

&nbsp;     "variables": \["businessName", "userName", ...]

&nbsp;   }

&nbsp; ]

}

Legacy Database Schema (Retained but unused)

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

Other Models



Project - with endDate for overdue tracking

TimelineEvent - with eventDate and isCompleted

Invoice - with dueDate and status

FeatureRequest - with dueDate and status



Environment Variables



DATABASE\_URL - PostgreSQL connection string for Railway



APIs and Integrations

Template Preview API

Endpoint: /api/templates/preview/\[id]



Method: GET

Response: HTML with Content-Type: text/html

Variables: Automatically substituted with sample data



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

lucide-react icons



Key Components

Template Service

typescript// src/lib/template-service.ts

export async function getTemplates(): Promise<Template\[]> {

&nbsp; const configContent = await fs.readFile(TEMPLATES\_CONFIG, 'utf-8');

&nbsp; const config = JSON.parse(configContent);

&nbsp; return config.templates;

}

Template Viewer

typescript// src/app/dashboard/settings/layouts/\[id]/TemplateViewer.tsx

"use client";

const openFullView = () => {

&nbsp; window.open(`/api/templates/preview/${templateId}`, '\_blank');

};

Routing



/dashboard - Main dashboard

/dashboard/settings - Settings overview

/dashboard/settings/layouts - Template list

/dashboard/settings/layouts/\[id] - Template preview

/dashboard/settings/feature-requests - Feature requests

/dashboard/financials/income - Invoices



Backend/Services

Template Service Architecture



File System Based: Templates stored as HTML files

Metadata Management: JSON configuration file

No Database Dependency: Filesystem is source of truth



Server Components



Most pages are React Server Components

Direct filesystem access via Node.js fs module

Forced dynamic rendering for template pages



Client Components



TemplateViewer for interactivity

MonthlyTimeline for dashboard

Copy and full view functionality



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



File Structure for Templates

src/templates/

├── application/

│   └── full-app.html

├── dashboard/

│   └── (future templates)

└── templates.json

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

Sidebar components

Sheet, Accordion, Tooltip, Popover



Setup, Configuration, and Running

Local Development

cmdnpm install

npx prisma generate

npx prisma migrate dev

npm run dev

Template Setup

cmdmkdir src\\templates

mkdir src\\templates\\application

mkdir src\\templates\\dashboard

Create templates.json and HTML files in appropriate directories.

Database Setup (Legacy - kept for compatibility)

cmdnpx prisma migrate dev --name add-layout-templates

npx prisma generate

npx prisma studio

Testing and Quality

Manual testing completed for:



Template file loading from filesystem

Template preview functionality

Variable substitution

Full view in new window

Settings navigation with Layouts submenu

Copy code functionality



No automated tests documented.

Directory Map

src/

├── app/

│   ├── dashboard/

│   │   ├── layout.tsx                          # Main dashboard layout with sidebar

│   │   ├── page.tsx                            # Dashboard with overdue items

│   │   ├── MonthlyTimeline.tsx                 # Collapsible timeline cards

│   │   ├── settings/

│   │   │   ├── layout.tsx                      # Settings layout

│   │   │   ├── page.tsx                        # Settings overview

│   │   │   └── layouts/

│   │   │       ├── page.tsx                    # Template list (file-based)

│   │   │       └── \[id]/

│   │   │           ├── page.tsx                # Template preview

│   │   │           └── TemplateViewer.tsx      # Client component

│   │   └── components/

│   │       ├── FinancialOverviewChart.tsx

│   │       ├── ContactForm.tsx

│   │       └── QuickActionsCard.tsx

│   └── api/

│       ├── templates/

│       │   └── preview/

│       │       └── \[id]/

│       │           └── route.ts                # Serve full HTML template

│       ├── feature-requests/

│       │   └── route.ts

│       ├── invoices/

│       │   └── route.ts

│       └── timeline-events/

│           └── route.ts

├── lib/

│   ├── prisma.ts                              # Prisma client instance

│   └── template-service.ts                    # File-based template service

├── templates/                                 # HTML template files

│   ├── application/

│   │   └── full-app.html                      # Full application template

│   └── templates.json                         # Template metadata

└── components/

&nbsp;   └── ui/                                     # shadcn/ui components

&nbsp;       ├── badge.tsx

&nbsp;       ├── button.tsx

&nbsp;       ├── card.tsx

&nbsp;       ├── tabs.tsx

&nbsp;       └── sidebar.tsx



prisma/

├── schema.prisma                              # Database schema (LayoutTemplate unused)

└── migrations/

&nbsp;   └── \[timestamp]\_add\_layout\_templates/

&nbsp;       └── migration.sql

Challenges, Errors, Failures, Revisions, and Resolutions

Issue 1: Template Caching Problem (January 21, 2025)

Error: Template preview showed old cached version despite database updates

Root Cause: Next.js Server Component caching

Resolution:



Added export const dynamic = 'force-dynamic'

Added export const revalidate = 0

Migrated to file-based system for better developer experience

Files Modified: All template-related pages



Issue 2: Database vs File-Based Templates (January 21, 2025)

Challenge: Database storage made template editing cumbersome

Resolution: Migrated to file-based system



Templates now stored as HTML files in /src/templates/

Metadata in templates.json

Created template-service.ts for file operations

Benefits: Direct VS Code editing, version control, instant refresh



Issue 3: Navigation Structure (January 21, 2025)

Challenge: Layouts not accessible from main navigation

Resolution: Added Layouts to Settings submenu

Files Modified: /src/app/dashboard/layout.tsx



Added Layout icon import

Added submenu item under Settings



Known Issues and Limitations

Current Limitations



No Template Editing UI: Templates must be edited directly in VS Code

Manual Template Creation: New templates require manual file creation and JSON update

Legacy Database Table: layout\_templates table exists but unused (kept to avoid migration errors)

Single Active Template: System tracks active/default but doesn't apply templates yet

No Template Upload: Cannot upload HTML files through UI



Documented Workarounds



Edit templates directly in /src/templates/ directory

Update templates.json manually for new templates

Use VS Code for all template modifications

Refresh browser to see template changes in development



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



DATABASE\_URL: PostgreSQL connection string

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

CMD: Windows Command Prompt

VS Code: Visual Studio Code editor

