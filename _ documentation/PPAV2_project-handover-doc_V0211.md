Project Planning Application V2 - Email Manifest Fix Documentation
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
The project-planning-V2 application's daily email manifest system has been updated to align with the Operations Dashboard display logic. The morning and afternoon manifest emails previously showed only Timeline Events and used owner-based filtering inconsistent with the application's collaborative model. Both email routes have been refactored to include all item types (Projects, Tasks, Timeline Events, Invoices, Client Contracts, and Feature Requests) and use the same UTC date comparison logic as the Operations Dashboard.
Core Architectural Model
Core Architectural Model
This application is designed as a collaborative, multi-user platform. It is not a user-centric application. All authenticated users have access to and manage a single, shared database. Any data created or modified by one user will be visible to all other users.
Technical Overview and Current State
Overall Architecture

Framework: Next.js 13.5.6 with TypeScript
Database: PostgreSQL via Prisma ORM
Email Service: Nodemailer with Gmail SMTP
Authentication: NextAuth.js with Google OAuth
Deployment: Railway platform

Current Development State

Morning manifest (/src/app/api/cron/send-manifest/route.ts) updated
Afternoon manifest (/src/app/api/cron/send-afternoon-manifest/route.ts) updated
Both manifests now match Operations Dashboard logic exactly
Changes uncommitted, pending testing

Key Functionalities
Email Manifest System

Morning Manifest: Sends daily email with items due today
Afternoon Manifest: Sends daily email with items due tomorrow
Trigger Methods:

GET endpoint for cron job automation
POST endpoint for manual trigger


Recipients: Users with sendDailyManifest or sendAfternoonManifest flags enabled

Operations Dashboard Reference

File: /src/app/dashboard/operations/page.tsx
Today Card: Shows all items due today
Tomorrow Card: Shows all items due tomorrow
Item Types: Projects, Tasks, Timeline Events, Invoices, Client Contracts, Feature Requests

System Architecture
Data Flow for Email Manifests

Cron job or manual trigger initiates request
Route handler authenticates request (cron secret or session)
Fetches operational data from PostgreSQL via Prisma
Filters items using UTC date comparison
Generates HTML email with categorized items
Sends via Gmail SMTP using Nodemailer

Data Model
Key Entities for Manifests
prismamodel User {
  id                    String    @id @default(cuid())
  email                 String?   @unique
  name                  String?
  isActive              Boolean   @default(false)
  sendDailyManifest     Boolean   @default(false)
  sendAfternoonManifest Boolean   @default(false)
}

model FeatureRequest {
  id          Int      @id @default(autoincrement())
  title       String
  description String
  status      String   @default("Pending")
  priority    String   @default("Medium")
  submittedBy String
  dueDate     DateTime?
}
APIs and Integrations
Morning Manifest API

Endpoint: /api/cron/send-manifest
GET Method: Cron job handler

Auth: Bearer token with CRON_SECRET
Sends to all users with sendDailyManifest: true


POST Method: Manual trigger

Auth: NextAuth session required
Sends to current user only



Afternoon Manifest API

Endpoint: /api/cron/send-afternoon-manifest
GET Method: Cron job handler

Auth: Bearer token with CRON_SECRET
Sends to all users with sendAfternoonManifest: true


POST Method: Manual trigger

Auth: NextAuth session required
Sends to current user only



Email Service Configuration
typescriptconst transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});
Frontend
Operations Dashboard Components

DailyItemsCard: Displays Today/Tomorrow items
InteractiveCalendar: Monthly calendar view
OperationalItem Interface: Shared type definition

Backend/Services
Date Handling Functions
typescript// src/app/api/cron/send-manifest/route.ts, lines 28-32
const isSameDayUTC = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1).toLocaleDateString('en-US', { timeZone: 'UTC' });
  const d2 = new Date(date2).toLocaleDateString('en-US', { timeZone: 'UTC' });
  return d1 === d2;
};
Data Fetching Logic

Fetches from entire month for recurring client calculations
No owner-based filtering (collaborative model)
Includes all six item types
Filters active items only (excludes Done/Canceled status)

Background Jobs/Workers
Cron Jobs (External Service Required)

Morning manifest scheduled time: Not specified in code
Afternoon manifest scheduled time: Not specified in code
Requires external cron service to call GET endpoints with bearer token

Infrastructure and DevOps
Environment Variables
DATABASE_URL          # PostgreSQL connection string
NEXTAUTH_URL         # Application URL
CRON_SECRET          # Bearer token for cron job authentication
EMAIL_SERVER_USER    # Gmail SMTP username
EMAIL_SERVER_PASSWORD # Gmail SMTP password
Deployment

Platform: Railway
Build: prisma generate && next build
Start: npm start

Dependencies
Core Dependencies
json{
  "next": "13.5.6",
  "react": "^18",
  "@prisma/client": "^[version]",
  "next-auth": "^[version]",
  "nodemailer": "^[version]",
  "date-fns": "^[version]"
}
Setup, Configuration, and Running
Local Development
cmdnpm install
npx prisma generate
npm run dev
Testing Email Manifests
Manual trigger via POST request (requires authentication):
POST /api/cron/send-manifest
POST /api/cron/send-afternoon-manifest
Testing and Quality
No automated tests documented for email manifest functionality. Manual testing performed during development session.
Directory Map
src/
├── app/
│   ├── api/
│   │   ├── cron/
│   │   │   ├── send-manifest/
│   │   │   │   └── route.ts                    # Morning manifest (updated)
│   │   │   └── send-afternoon-manifest/
│   │   │       └── route.ts                    # Afternoon manifest (updated)
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts                    # Auth configuration
│   └── dashboard/
│       └── operations/
│           ├── page.tsx                        # Reference implementation
│           └── components/
│               ├── DailyItemsCard.tsx
│               └── InteractiveCalendar.tsx
├── lib/
│   └── prisma.ts
└── prisma/
    └── schema.prisma                           # Database schema
Challenges, Errors, Failures, Revisions, and Resolutions
Issue: Missing Content in Email Manifests (January 21, 2025)
Problem Identified:

Emails showed only Timeline Events
Used owner-based filtering inconsistent with collaborative model
Different date comparison logic than Operations Dashboard

Root Cause:

Missing Feature Requests fetch in both manifests
Queries filtered by ownerId or userId
Date bounds comparison instead of UTC day comparison

Resolution Applied:
Morning Manifest Changes:

Added Feature Requests fetching with status filtering
Removed all owner-based filtering from queries
Added isSameDayUTC helper function
Aligned date creation logic with Operations page
Fetch items once for all users (collaborative model)

Afternoon Manifest Changes:

Added Feature Requests fetching with status filtering
Removed all owner-based filtering and SessionUser type guard
Added isSameDayUTC helper function
Aligned date creation logic for tomorrow
Simplified email sending function

Files Modified:

/src/app/api/cron/send-manifest/route.ts
/src/app/api/cron/send-afternoon-manifest/route.ts

Known Issues and Limitations
Current Limitations

Cron job scheduling times not specified in code
No automated tests for email functionality
Manual testing of cron endpoints requires bearer token
Email templates inline in route files (not templated)

Open Items

Changes uncommitted to repository
Deployment to Railway pending

Update/Change Management Policy
Always ask to review files before updating them so we can maintain current development and not break existing developments.
Security, Privacy, and Compliance
Authentication

Cron jobs: Bearer token authentication using CRON_SECRET
Manual triggers: NextAuth session required
Email credentials: Gmail SMTP with EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD

Data Access

Collaborative model: All authenticated users see same data
No row-level security on fetched items
Email recipients determined by user flags in database

Glossary and Acronyms

UTC: Coordinated Universal Time
SMTP: Simple Mail Transfer Protocol
Cron: Time-based job scheduler
Manifest: Summary report of due items
Operations Dashboard: Central view of time-sensitive items
Collaborative Model: All users share same data view