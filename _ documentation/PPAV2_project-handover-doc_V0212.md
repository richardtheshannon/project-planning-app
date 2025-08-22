Project Planning Application V2 - Feature Request Pages Implementation

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

The project-planning-V2 application has been enhanced with individual feature request pages, transforming the previous modal-based viewing system into a URL-based page structure similar to the existing project pages implementation. The current session involved creating a new detail page component at /src/app/dashboard/settings/feature-requests/\[id]/page.tsx, updating the FeatureRequests list component to use navigation instead of modals, and systematically updating all feature request links throughout the application including the Operations Dashboard, email manifests (morning and afternoon), and the main dashboard's MonthlyTimeline component.

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



/src/app/dashboard/settings/feature-requests/\[id]/page.tsx - New file created

/src/app/dashboard/FeatureRequests.tsx - Modified to use navigation

/src/app/dashboard/operations/page.tsx - Updated feature request links

/src/app/api/cron/send-manifest/route.ts - Updated feature request links

/src/app/api/cron/send-afternoon-manifest/route.ts - Updated feature request links

/src/app/dashboard/MonthlyTimeline.tsx - Updated feature request links

/src/app/dashboard/components/QuickActionsCard.tsx - Updated to redirect after creation



Key Functionalities

Feature Request Management



List View: /src/app/dashboard/FeatureRequests.tsx - Displays all feature requests in a sortable table

Detail View: /src/app/dashboard/settings/feature-requests/\[id]/page.tsx - Individual feature request pages with edit/delete functionality

Creation: Available from list page and QuickActionsCard component

API Routes: /src/app/api/feature-requests/route.ts and /src/app/api/feature-requests/\[id]/route.ts



Operations Dashboard Integration



File: /src/app/dashboard/operations/page.tsx

Displays feature requests with due dates in Today/Tomorrow cards

Links to individual feature request pages



Email Manifests



Morning Manifest: /src/app/api/cron/send-manifest/route.ts

Afternoon Manifest: /src/app/api/cron/send-afternoon-manifest/route.ts

Both include feature requests with direct links to individual pages



Main Dashboard



MonthlyTimeline Component: /src/app/dashboard/MonthlyTimeline.tsx

Shows overdue feature requests with links to individual pages



System Architecture

Component Interaction Flow

User Interface Layer:

├── Feature Request List Page

│   └── Navigation to Detail Pages

├── Feature Request Detail Page

│   ├── View/Edit/Delete Operations

│   └── Back Navigation

├── Operations Dashboard

│   └── Feature Request Links

├── Main Dashboard

│   └── MonthlyTimeline → Feature Request Links

└── Email Manifests

&nbsp;   └── Feature Request Links



API Layer:

├── /api/feature-requests (GET, POST)

└── /api/feature-requests/\[id] (GET, PUT, DELETE)



Data Layer:

└── PostgreSQL → Prisma ORM → FeatureRequest Model

Data Model

FeatureRequest Entity

prismamodel FeatureRequest {

&nbsp; id          Int       @id @default(autoincrement())

&nbsp; title       String

&nbsp; description String

&nbsp; status      String    @default("Pending")

&nbsp; priority    String    @default("Medium")

&nbsp; submittedBy String

&nbsp; dueDate     DateTime?

&nbsp; createdAt   DateTime  @default(now())

&nbsp; updatedAt   DateTime  @updatedAt

}

Environment Variables



DATABASE\_URL - PostgreSQL connection string

NEXTAUTH\_URL - Application URL for authentication

CRON\_SECRET - Bearer token for cron job authentication

EMAIL\_SERVER\_USER - Gmail SMTP username

EMAIL\_SERVER\_PASSWORD - Gmail SMTP password



APIs and Integrations

Feature Request API Endpoints

GET /api/feature-requests



Returns all feature requests

No authentication required (collaborative model)



POST /api/feature-requests



Creates new feature request

Request body: { title, description, priority, dueDate }

Returns created feature request with ID



GET /api/feature-requests/\[id]



Returns single feature request by ID

Authentication required via NextAuth session



PUT /api/feature-requests/\[id]



Updates feature request

Request body: { title, description, status, priority, dueDate }

Authentication required



DELETE /api/feature-requests/\[id]



Deletes feature request

Returns 204 No Content on success

Authentication required



Frontend

Framework and Tools



Next.js 13.5.6 App Router

TypeScript

Tailwind CSS

shadcn/ui components



Key Components

Feature Request Detail Page

typescript// /src/app/dashboard/settings/feature-requests/\[id]/page.tsx, lines 38-96

export default function FeatureRequestDetailPage() {

&nbsp;   const params = useParams();

&nbsp;   const router = useRouter();

&nbsp;   const requestId = params.id as string;

&nbsp;   

&nbsp;   // State management for request data and editing

&nbsp;   const \[request, setRequest] = useState<FeatureRequest | null>(null);

&nbsp;   const \[isEditing, setIsEditing] = useState(false);

&nbsp;   

&nbsp;   // Fetch request on mount

&nbsp;   useEffect(() => {

&nbsp;       fetchRequest();

&nbsp;   }, \[requestId]);

}

Feature Requests List

typescript// /src/app/dashboard/FeatureRequests.tsx, lines 83-93

const handleSubmit = async (e: FormEvent) => {

&nbsp;   // ... create feature request

&nbsp;   const newFeatureRequest = await response.json();

&nbsp;   

&nbsp;   // Navigate to the new feature request detail page

&nbsp;   router.push(`/dashboard/settings/feature-requests/${newFeatureRequest.id}`);

};

Backend/Services

Request Handling



NextAuth for authentication

Prisma ORM for database operations

Server-side data fetching in page components



Business Logic Entry Points



Feature request CRUD operations in API routes

Email manifest generation in cron routes

Operations data aggregation in page.tsx files



Background Jobs/Workers

Email Manifests



Morning Manifest: Sends daily summary of items due today

Afternoon Manifest: Sends summary of items due tomorrow

Both triggered via GET endpoints with CRON\_SECRET bearer token

Manual trigger available via POST endpoints



Infrastructure and DevOps

Deployment



Platform: Railway

Build command: prisma generate \&\& next build

Start command: npm start

Environment variables managed in Railway dashboard



Database



PostgreSQL hosted on Railway

Migrations managed via Prisma



Dependencies

Package.json Dependencies

json{

&nbsp; "next": "13.5.6",

&nbsp; "react": "^18",

&nbsp; "@prisma/client": "^\[version]",

&nbsp; "next-auth": "^\[version]",

&nbsp; "nodemailer": "^\[version]",

&nbsp; "date-fns": "^\[version]",

&nbsp; "lucide-react": "^\[version]",

&nbsp; "sonner": "^\[version]"

}

Setup, Configuration, and Running

Local Development

bashnpm install

npx prisma generate

npm run dev

Database Setup

bashnpx prisma migrate dev

Testing and Quality

No automated tests documented for the feature request functionality. Manual testing performed during development session.

Directory Map

src/

├── app/

│   ├── api/

│   │   ├── feature-requests/

│   │   │   ├── route.ts                    # GET all, POST new

│   │   │   └── \[id]/

│   │   │       └── route.ts                # GET, PUT, DELETE by ID

│   │   └── cron/

│   │       ├── send-manifest/

│   │       │   └── route.ts                # Morning manifest (updated)

│   │       └── send-afternoon-manifest/

│   │           └── route.ts                # Afternoon manifest (updated)

│   ├── dashboard/

│   │   ├── page.tsx                        # Main dashboard

│   │   ├── MonthlyTimeline.tsx             # Timeline component (updated)

│   │   ├── FeatureRequests.tsx             # List component (updated)

│   │   ├── operations/

│   │   │   └── page.tsx                    # Operations dashboard (updated)

│   │   ├── settings/

│   │   │   └── feature-requests/

│   │   │       ├── page.tsx                # List page wrapper

│   │   │       └── \[id]/

│   │   │           └── page.tsx            # Detail page (new)

│   │   └── components/

│   │       └── QuickActionsCard.tsx        # Quick actions (updated)

│   └── layout.tsx

├── components/

│   └── ui/                                 # shadcn/ui components

└── lib/

&nbsp;   └── prisma.ts                           # Prisma client

Challenges, Errors, Failures, Revisions, and Resolutions

Session Issues and Resolutions

Issue 1: Feature Request Modal to Page Transition



Problem: Feature requests were opening in modals instead of dedicated pages

Resolution: Created new detail page component at /src/app/dashboard/settings/feature-requests/\[id]/page.tsx

Files Modified: FeatureRequests.tsx to remove modal logic and add navigation



Issue 2: Broken Links Throughout Application



Problem: Feature request links pointed to list page instead of individual pages

Resolution: Systematically updated all link generation:



Operations Dashboard: Changed link from /dashboard/settings/feature-requests to /dashboard/settings/feature-requests/${fr.id}

Email Manifests: Updated both morning and afternoon manifest routes

MonthlyTimeline: Updated getItemLink function for FeatureRequest type







Issue 3: Creation Flow Not Redirecting



Problem: After creating feature request, users remained on list/dashboard

Resolution: Modified handleSubmit functions in both FeatureRequests.tsx and QuickActionsCard.tsx to navigate to the new feature request page using router.push()



Known Issues and Limitations

Current Limitations



Changes are uncommitted to repository

No automated tests for feature request pages

No breadcrumb navigation on detail pages

No bulk operations on feature requests

No export functionality for feature requests



Update/Change Management Policy

Always ask to review files before updating them so we can maintain current development and not break existing developments.

Security, Privacy, and Compliance

Authentication



NextAuth session required for feature request operations

Google OAuth for user authentication

Session check in API routes: getServerSession(authOptions)



Data Access



Collaborative model: All authenticated users see same data

No row-level security on feature requests

Email recipients determined by user flags in database



Environment Variables



NEXTAUTH\_URL: Application URL

NEXTAUTH\_SECRET: Session encryption

GOOGLE\_CLIENT\_ID: OAuth client ID

GOOGLE\_CLIENT\_SECRET: OAuth client secret

DATABASE\_URL: PostgreSQL connection

EMAIL\_SERVER\_USER: Gmail SMTP username

EMAIL\_SERVER\_PASSWORD: Gmail SMTP password

CRON\_SECRET: Bearer token for cron jobs



Glossary and Acronyms



CRUD: Create, Read, Update, Delete

UTC: Coordinated Universal Time

OAuth: Open Authorization

SMTP: Simple Mail Transfer Protocol

ORM: Object-Relational Mapping

Feature Request: User-submitted application enhancement request

Manifest: Daily summary email of due items

Operations Dashboard: Central view of time-sensitive items

