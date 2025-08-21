Project Planning Application V2 - Cron Email Manifest System Handover
Metadata

Project Name: project-planning-V2 (Cron Email Manifest Feature)
Repository URL: GitHub to Railway deployment
Primary Branch: master
Commit Hash: Not yet committed
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
The project-planning-V2 application's email manifest system provides automated daily email notifications to users summarizing their due items. The system includes morning manifests (4 AM PDT, showing today's items) and afternoon manifests (4 PM PDT, showing tomorrow's items). Implementation includes manual "Send Now" functionality and scheduled cron automation via Railway platform. Current state shows manual sending works correctly but automated cron execution requires Railway configuration with timezone adjustments for PDT (UTC-7).
Core Architectural Model
Core Architectural Model
This application is designed as a collaborative, multi-user platform. It is not a user-centric application. All authenticated users have access to and manage a single, shared database. Any data created or modified by one user will be visible to all other users.
Technical Overview and Current State
Overall Architecture

Framework: Next.js 13.5.6 with TypeScript
Email Service: Nodemailer with Gmail SMTP
Database: PostgreSQL via Prisma ORM
Authentication: NextAuth.js with Google OAuth
Deployment: Railway with cron scheduling capabilities
Timezone: Pacific Daylight Time (PDT, UTC-7)

Current Development State

Manual email sending via POST endpoints: Functional
Automated cron execution via GET endpoints: Implemented, awaiting Railway configuration
URL protocol issue: Resolved (added https:// handling)
Railway cron schedule: To be configured at 0 11,23 * * * for PDT

Key Functionalities
Email Manifest Features

Daily Morning Manifest (/src/app/api/cron/send-manifest/route.ts)

Sends at 4 AM user's local time (11:00 UTC for PDT)
Shows items due today
Manual trigger via POST endpoint


Daily Afternoon Manifest (/src/app/api/cron/send-afternoon-manifest/route.ts)

Sends at 4 PM user's local time (23:00 UTC for PDT)
Shows items due tomorrow
Manual trigger via POST endpoint


Unified Cron Handler (/src/app/api/cron/route.ts)

Determines which manifest to send based on UTC hour
Handles Railway cron requests


User Settings Interface (/src/app/dashboard/settings/notifications/page.tsx)

Toggle subscriptions for each manifest type
Manual "Send Now" buttons for immediate delivery



System Architecture
Data Flow
Railway Cron Scheduler (UTC)
    ↓ GET request with headers
/api/cron (Unified Handler)
    ↓ Checks UTC hour
/api/cron/send-manifest OR /api/cron/send-afternoon-manifest
    ↓ Authorization check
Database Query (Prisma)
    ↓ Fetch operational data
Email Composition (HTML)
    ↓ Nodemailer
Gmail SMTP → User Email
Data Model
User Settings Schema
prisma// /prisma/schema.prisma - lines 19-22
sendDailyManifest     Boolean   @default(false)
sendAfternoonManifest Boolean   @default(false)
isActive              Boolean   @default(false)
Operational Items Interface
typescript// Used in both manifest routes
interface OperationalItem {
  id: string;
  title: string;
  type: 'Project' | 'Task' | 'Timeline Event' | 'Invoice' | 'Client Contract';
  dueDate?: Date;
  link: string;
  projectName?: string;
  clientName?: string;
}
APIs and Integrations
Internal API Routes
typescript// Morning Manifest
GET  /api/cron/send-manifest         // Cron trigger (requires Bearer auth)
POST /api/cron/send-manifest         // Manual trigger (session auth)

// Afternoon Manifest  
GET  /api/cron/send-afternoon-manifest  // Cron trigger (requires Bearer auth)
POST /api/cron/send-afternoon-manifest  // Manual trigger (session auth)

// Unified Cron Handler
GET  /api/cron                       // Railway cron endpoint

// User Settings
GET  /api/users/settings             // Fetch subscription preferences
PATCH /api/users/settings            // Update subscription preferences

// Test Endpoints
GET  /api/test-cron-auth             // Test cron authorization
GET  /api/log-request                // Debug request headers
External Integrations

Gmail SMTP: smtp.gmail.com:465 (SSL)
Railway Cron: Scheduled GET requests with potential headers

Environment Variables
CRON_SECRET=poi4rp1o3i4jr0984yr0q94p1i34nfp0q9u34hf
EMAIL_SERVER_USER=<gmail_address>
EMAIL_SERVER_PASSWORD=<app_specific_password>
NEXTAUTH_URL=ppav02-production.up.railway.app  // Missing https:// prefix
Frontend
Notifications Settings Page
typescript// /src/app/dashboard/settings/notifications/page.tsx - lines 70-78, 91-99
const handleSendMorningManifest = async () => {
  setIsSendingMorning(true);
  try {
    const response = await fetch('/api/cron/send-manifest', {
      method: 'POST',
    });
    // ... error handling
  }
};
Backend/Services
URL Helper Function
typescript// /src/app/api/cron/send-manifest/route.ts - lines 40-52
const getBaseUrl = (): string => {
  let url = process.env.NEXTAUTH_URL || '';
  
  if (url && !url.startsWith('http')) {
    url = `https://${url}`;
  }
  
  if (!url) {
    url = 'https://app.salesfield.net';
  }
  
  return url;
};
Authorization Pattern
typescript// GET handlers - lines vary by file
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return new Response('Unauthorized', { status: 401 });
}
Background Jobs/Workers
Railway Cron Configuration

Schedule Format: Standard cron syntax
Recommended Schedule: 0 11,23 * * * (11:00 and 23:00 UTC)
Execution: GET request to application root or specified endpoint
Headers: May include x-railway-cron or x-railway-environment

Infrastructure and DevOps
Railway Configuration
json// /railway.json
{
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
Deployment Process

Push to master branch
Railway automatic deployment triggered
Build and migration via npm run start:prod
Health check at /api/health

Dependencies
Email Dependencies
json// package.json
{
  "dependencies": {
    "nodemailer": "^[version]",
    "date-fns": "^[version]"
  }
}
Setup, Configuration, and Running
Railway Cron Setup

Set environment variables in Railway Variables tab
Configure Cron Schedule in Settings: 0 11,23 * * *
Deploy application with cron endpoints
Monitor logs for cron execution

Manual Testing
bash# Test authorization endpoint
curl https://app.salesfield.net/api/test-cron-auth

# Test cron handler with proper auth
curl -H "Authorization: Bearer poi4rp1o3i4jr0984yr0q94p1i34nfp0q9u34hf" \
  https://app.salesfield.net/api/cron
Testing and Quality
Test Endpoints Created

/api/test-cron-auth: Validates cron authorization and URL building
/api/log-request: Logs incoming request headers for debugging
/api/cron/test-morning: Manual trigger for morning manifest (removed)

Directory Map
src/
├── app/
│   ├── api/
│   │   ├── cron/
│   │   │   ├── route.ts                    # NEW: Unified cron handler
│   │   │   ├── send-manifest/
│   │   │   │   └── route.ts                # MODIFIED: Morning manifest
│   │   │   ├── send-afternoon-manifest/
│   │   │   │   └── route.ts                # MODIFIED: Afternoon manifest
│   │   │   └── test/                       # REMOVED: Test endpoints
│   │   ├── users/
│   │   │   └── settings/
│   │   │       └── route.ts                # User preference management
│   │   ├── test-cron-auth/
│   │   │   └── route.ts                    # NEW: Auth testing endpoint
│   │   ├── log-request/
│   │   │   └── route.ts                    # NEW: Request logging
│   │   └── health/
│   │       └── route.ts                    # Health check endpoint
│   └── dashboard/
│       └── settings/
│           └── notifications/
│               └── page.tsx                 # UI for email preferences
├── lib/
│   └── prisma.ts                           # Prisma client
└── prisma/
    └── schema.prisma                        # Database schema
Challenges, Errors, Failures, Revisions, and Resolutions
Issue 1: 502 Bad Gateway (January 21, 2025)

Symptom: Application failed to respond after adding cron configuration
Root Cause: Potential conflict with cron endpoint configuration
Resolution: Removed cron schedule temporarily, application recovered
Status: Resolved by removing problematic configuration

Issue 2: URL Protocol Missing (January 21, 2025)

Symptom: "Failed to parse URL from ppav02-production.up.railway.app/api/cron/send-manifest"
Root Cause: NEXTAUTH_URL environment variable missing https:// prefix
Resolution: Added getBaseUrl() helper function to handle missing protocol
Files Modified:

/src/app/api/cron/send-manifest/route.ts
/src/app/api/cron/send-afternoon-manifest/route.ts


Status: Code fix implemented, awaiting deployment

Issue 3: Timezone Configuration (January 21, 2025)

Symptom: Cron jobs would execute at wrong times
Root Cause: Railway cron runs in UTC, user expects PDT times
Resolution: Adjusted cron schedule from 0 4,16 * * * to 0 11,23 * * * for PDT
Status: Configuration pending

Known Issues and Limitations
Current Issues

NEXTAUTH_URL Configuration: Environment variable needs https:// prefix added in Railway
Cron Schedule Not Active: Railway cron schedule field currently empty
Railway Cron Endpoint: Unknown which endpoint Railway calls by default

Limitations

Railway cron only supports one endpoint per schedule
Timezone must be manually calculated (no automatic DST adjustment)
Maximum one cron schedule per Railway service

Update/Change Management Policy
Always ask to review files before updating them so we can maintain current development and not break existing developments.
Security, Privacy, and Compliance
Authentication

Cron Endpoints: Bearer token authentication using CRON_SECRET
Manual Endpoints: Session-based authentication via NextAuth.js
Email Service: Gmail SMTP with app-specific password

Sensitive Data
CRON_SECRET: poi4rp1o3i4jr0984yr0q94p1i34nfp0q9u34hf
EMAIL_SERVER_USER: [Gmail address]
EMAIL_SERVER_PASSWORD: [App-specific password]
Glossary and Acronyms

PDT: Pacific Daylight Time (UTC-7)
PST: Pacific Standard Time (UTC-8)
UTC: Coordinated Universal Time
Cron: Time-based job scheduler
Manifest: Summary email of due items
Railway: Platform-as-a-Service deployment platform
SMTP: Simple Mail Transfer Protocol
Bearer Token: HTTP authentication scheme for API access