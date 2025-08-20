--
-- PostgreSQL database dump
--

\restrict Eg9HB7xEMwHjIrmhqw2sAnLhFuAC4ODb2oYQWqJz6xSKnMMgYn6MhvyzJgIdhp1

-- Dumped from database version 16.10 (Debian 16.10-1.pgdg13+1)
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.timeline_events DROP CONSTRAINT "timeline_events_projectId_fkey";
ALTER TABLE ONLY public.time_entries DROP CONSTRAINT "time_entries_userId_fkey";
ALTER TABLE ONLY public.time_entries DROP CONSTRAINT "time_entries_taskId_fkey";
ALTER TABLE ONLY public.tasks DROP CONSTRAINT "tasks_projectId_fkey";
ALTER TABLE ONLY public.tasks DROP CONSTRAINT "tasks_parentId_fkey";
ALTER TABLE ONLY public.tasks DROP CONSTRAINT "tasks_categoryId_fkey";
ALTER TABLE ONLY public.tasks DROP CONSTRAINT "tasks_assigneeId_fkey";
ALTER TABLE ONLY public.projects DROP CONSTRAINT "projects_ownerId_fkey";
ALTER TABLE ONLY public.project_members DROP CONSTRAINT "project_members_userId_fkey";
ALTER TABLE ONLY public.project_members DROP CONSTRAINT "project_members_projectId_fkey";
ALTER TABLE ONLY public.project_contacts DROP CONSTRAINT "project_contacts_projectId_fkey";
ALTER TABLE ONLY public.project_contacts DROP CONSTRAINT "project_contacts_contactId_fkey";
ALTER TABLE ONLY public.notifications DROP CONSTRAINT "notifications_userId_fkey";
ALTER TABLE ONLY public.notifications DROP CONSTRAINT "notifications_projectId_fkey";
ALTER TABLE ONLY public.files DROP CONSTRAINT "files_uploaderId_fkey";
ALTER TABLE ONLY public.files DROP CONSTRAINT "files_taskId_fkey";
ALTER TABLE ONLY public.files DROP CONSTRAINT "files_projectId_fkey";
ALTER TABLE ONLY public.comments DROP CONSTRAINT "comments_taskId_fkey";
ALTER TABLE ONLY public.comments DROP CONSTRAINT "comments_authorId_fkey";
ALTER TABLE ONLY public.categories DROP CONSTRAINT "categories_projectId_fkey";
ALTER TABLE ONLY public."Subscription" DROP CONSTRAINT "Subscription_userId_fkey";
ALTER TABLE ONLY public."Session" DROP CONSTRAINT "Session_userId_fkey";
ALTER TABLE ONLY public."Invoice" DROP CONSTRAINT "Invoice_userId_fkey";
ALTER TABLE ONLY public."Invoice" DROP CONSTRAINT "Invoice_clientId_fkey";
ALTER TABLE ONLY public."FinancialDocument" DROP CONSTRAINT "FinancialDocument_userId_fkey";
ALTER TABLE ONLY public."FinancialDocument" DROP CONSTRAINT "FinancialDocument_invoiceId_fkey";
ALTER TABLE ONLY public."FinancialDocument" DROP CONSTRAINT "FinancialDocument_expenseId_fkey";
ALTER TABLE ONLY public."Expense" DROP CONSTRAINT "Expense_userId_fkey";
ALTER TABLE ONLY public."Document" DROP CONSTRAINT "Document_userId_fkey";
ALTER TABLE ONLY public."Document" DROP CONSTRAINT "Document_projectId_fkey";
ALTER TABLE ONLY public."Document" DROP CONSTRAINT "Document_expenseId_fkey";
ALTER TABLE ONLY public."Client" DROP CONSTRAINT "Client_userId_fkey";
ALTER TABLE ONLY public."Budget" DROP CONSTRAINT "Budget_userId_fkey";
ALTER TABLE ONLY public."Account" DROP CONSTRAINT "Account_userId_fkey";
DROP INDEX public."project_members_userId_projectId_key";
DROP INDEX public."project_contacts_projectId_contactId_key";
DROP INDEX public."categories_name_projectId_key";
DROP INDEX public."VerificationToken_token_key";
DROP INDEX public."VerificationToken_identifier_token_key";
DROP INDEX public."User_email_key";
DROP INDEX public."Session_sessionToken_key";
DROP INDEX public."Invoice_invoiceNumber_key";
DROP INDEX public."Budget_userId_category_month_year_key";
DROP INDEX public."Account_provider_providerAccountId_key";
ALTER TABLE ONLY public.timeline_events DROP CONSTRAINT timeline_events_pkey;
ALTER TABLE ONLY public.time_entries DROP CONSTRAINT time_entries_pkey;
ALTER TABLE ONLY public.tasks DROP CONSTRAINT tasks_pkey;
ALTER TABLE ONLY public.projects DROP CONSTRAINT projects_pkey;
ALTER TABLE ONLY public.project_members DROP CONSTRAINT project_members_pkey;
ALTER TABLE ONLY public.project_contacts DROP CONSTRAINT project_contacts_pkey;
ALTER TABLE ONLY public.notifications DROP CONSTRAINT notifications_pkey;
ALTER TABLE ONLY public.files DROP CONSTRAINT files_pkey;
ALTER TABLE ONLY public.contacts DROP CONSTRAINT contacts_pkey;
ALTER TABLE ONLY public.comments DROP CONSTRAINT comments_pkey;
ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_pkey;
ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
ALTER TABLE ONLY public."User" DROP CONSTRAINT "User_pkey";
ALTER TABLE ONLY public."Subscription" DROP CONSTRAINT "Subscription_pkey";
ALTER TABLE ONLY public."Session" DROP CONSTRAINT "Session_pkey";
ALTER TABLE ONLY public."Invoice" DROP CONSTRAINT "Invoice_pkey";
ALTER TABLE ONLY public."FinancialDocument" DROP CONSTRAINT "FinancialDocument_pkey";
ALTER TABLE ONLY public."FeatureRequest" DROP CONSTRAINT "FeatureRequest_pkey";
ALTER TABLE ONLY public."Expense" DROP CONSTRAINT "Expense_pkey";
ALTER TABLE ONLY public."Document" DROP CONSTRAINT "Document_pkey";
ALTER TABLE ONLY public."Client" DROP CONSTRAINT "Client_pkey";
ALTER TABLE ONLY public."Budget" DROP CONSTRAINT "Budget_pkey";
ALTER TABLE ONLY public."AppearanceSettings" DROP CONSTRAINT "AppearanceSettings_pkey";
ALTER TABLE ONLY public."Account" DROP CONSTRAINT "Account_pkey";
ALTER TABLE public."FeatureRequest" ALTER COLUMN id DROP DEFAULT;
DROP TABLE public.timeline_events;
DROP TABLE public.time_entries;
DROP TABLE public.tasks;
DROP TABLE public.projects;
DROP TABLE public.project_members;
DROP TABLE public.project_contacts;
DROP TABLE public.notifications;
DROP TABLE public.files;
DROP TABLE public.contacts;
DROP TABLE public.comments;
DROP TABLE public.categories;
DROP TABLE public._prisma_migrations;
DROP TABLE public."VerificationToken";
DROP TABLE public."User";
DROP TABLE public."Subscription";
DROP TABLE public."Session";
DROP TABLE public."Invoice";
DROP TABLE public."FinancialDocument";
DROP SEQUENCE public."FeatureRequest_id_seq";
DROP TABLE public."FeatureRequest";
DROP TABLE public."Expense";
DROP TABLE public."Document";
DROP TABLE public."Client";
DROP TABLE public."Budget";
DROP TABLE public."AppearanceSettings";
DROP TABLE public."Account";
DROP TYPE public."UserRole";
DROP TYPE public."TaskStatus";
DROP TYPE public."ProjectType";
DROP TYPE public."ProjectStatus";
DROP TYPE public."ProjectMemberRole";
DROP TYPE public."Priority";
DROP TYPE public."NotificationType";
DROP TYPE public."InvoiceStatus";
DROP TYPE public."ExpenseCategory";
DROP TYPE public."ContractTerm";
DROP TYPE public."BillingCycle";
--
-- Name: BillingCycle; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BillingCycle" AS ENUM (
    'MONTHLY',
    'ANNUALLY'
);


ALTER TYPE public."BillingCycle" OWNER TO postgres;

--
-- Name: ContractTerm; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ContractTerm" AS ENUM (
    'ONE_MONTH',
    'ONE_TIME',
    'THREE_MONTH',
    'SIX_MONTH',
    'ONE_YEAR'
);


ALTER TYPE public."ContractTerm" OWNER TO postgres;

--
-- Name: ExpenseCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ExpenseCategory" AS ENUM (
    'SOFTWARE',
    'MARKETING',
    'OFFICE_SUPPLIES',
    'TRAVEL',
    'OTHER'
);


ALTER TYPE public."ExpenseCategory" OWNER TO postgres;

--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'DRAFT',
    'PENDING',
    'PAID',
    'OVERDUE'
);


ALTER TYPE public."InvoiceStatus" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'INFO',
    'SUCCESS',
    'WARNING',
    'ERROR',
    'TASK_ASSIGNED',
    'TASK_COMPLETED',
    'PROJECT_UPDATED',
    'COMMENT_ADDED'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- Name: Priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Priority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."Priority" OWNER TO postgres;

--
-- Name: ProjectMemberRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProjectMemberRole" AS ENUM (
    'ADMIN',
    'MEMBER',
    'VIEWER'
);


ALTER TYPE public."ProjectMemberRole" OWNER TO postgres;

--
-- Name: ProjectStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProjectStatus" AS ENUM (
    'PLANNING',
    'IN_PROGRESS',
    'ON_HOLD',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."ProjectStatus" OWNER TO postgres;

--
-- Name: ProjectType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProjectType" AS ENUM (
    'POTENTIAL_CLIENT',
    'QUALIFIED_CLIENT',
    'CURRENT_CLIENT',
    'PAST_CLIENT',
    'PERSONAL_PROJECT',
    'PROFESSIONAL_PROJECT'
);


ALTER TYPE public."ProjectType" OWNER TO postgres;

--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'IN_REVIEW',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."TaskStatus" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'USER',
    'VIEWER'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO postgres;

--
-- Name: AppearanceSettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AppearanceSettings" (
    id text DEFAULT 'global_settings'::text NOT NULL,
    "businessName" text,
    "missionStatement" text,
    "lightModeLogoUrl" text,
    "lightModeIconUrl" text,
    "darkModeLogoUrl" text,
    "darkModeIconUrl" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "lightBackground" text DEFAULT '#ffffff'::text,
    "lightForeground" text DEFAULT '#020817'::text,
    "lightCard" text DEFAULT '#ffffff'::text,
    "lightCardForeground" text DEFAULT '#020817'::text,
    "lightPopover" text DEFAULT '#ffffff'::text,
    "lightPopoverForeground" text DEFAULT '#020817'::text,
    "lightPrimary" text DEFAULT '#18181b'::text,
    "lightPrimaryForeground" text DEFAULT '#fafafa'::text,
    "lightSecondary" text DEFAULT '#f4f4f5'::text,
    "lightSecondaryForeground" text DEFAULT '#18181b'::text,
    "lightMuted" text DEFAULT '#f4f4f5'::text,
    "lightMutedForeground" text DEFAULT '#71717a'::text,
    "lightAccent" text DEFAULT '#f4f4f5'::text,
    "lightAccentForeground" text DEFAULT '#18181b'::text,
    "lightDestructive" text DEFAULT '#ef4444'::text,
    "lightDestructiveForeground" text DEFAULT '#fafafa'::text,
    "lightBorder" text DEFAULT '#e4e4e7'::text,
    "lightInput" text DEFAULT '#e4e4e7'::text,
    "lightRing" text DEFAULT '#18181b'::text,
    "darkBackground" text DEFAULT '#09090b'::text,
    "darkForeground" text DEFAULT '#fafafa'::text,
    "darkCard" text DEFAULT '#09090b'::text,
    "darkCardForeground" text DEFAULT '#fafafa'::text,
    "darkPopover" text DEFAULT '#09090b'::text,
    "darkPopoverForeground" text DEFAULT '#fafafa'::text,
    "darkPrimary" text DEFAULT '#fafafa'::text,
    "darkPrimaryForeground" text DEFAULT '#18181b'::text,
    "darkSecondary" text DEFAULT '#27272a'::text,
    "darkSecondaryForeground" text DEFAULT '#fafafa'::text,
    "darkMuted" text DEFAULT '#27272a'::text,
    "darkMutedForeground" text DEFAULT '#a1a1aa'::text,
    "darkAccent" text DEFAULT '#27272a'::text,
    "darkAccentForeground" text DEFAULT '#fafafa'::text,
    "darkDestructive" text DEFAULT '#7f1d1d'::text,
    "darkDestructiveForeground" text DEFAULT '#fafafa'::text,
    "darkBorder" text DEFAULT '#27272a'::text,
    "darkInput" text DEFAULT '#27272a'::text,
    "darkRing" text DEFAULT '#d4d4d8'::text
);


ALTER TABLE public."AppearanceSettings" OWNER TO postgres;

--
-- Name: Budget; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Budget" (
    id text NOT NULL,
    category text NOT NULL,
    amount double precision NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Budget" OWNER TO postgres;

--
-- Name: Client; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Client" (
    id text NOT NULL,
    name text NOT NULL,
    email text,
    website text,
    notes text,
    "contractTerm" public."ContractTerm" DEFAULT 'ONE_TIME'::public."ContractTerm" NOT NULL,
    "contractAmount" double precision,
    "contractStartDate" timestamp(3) without time zone,
    frequency text,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Client" OWNER TO postgres;

--
-- Name: Document; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Document" (
    id text NOT NULL,
    title text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    size integer NOT NULL,
    path text NOT NULL,
    "userId" text NOT NULL,
    "projectId" text,
    "expenseId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Document" OWNER TO postgres;

--
-- Name: Expense; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Expense" (
    id text NOT NULL,
    description text NOT NULL,
    amount double precision NOT NULL,
    category public."ExpenseCategory" NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Expense" OWNER TO postgres;

--
-- Name: FeatureRequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FeatureRequest" (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'Pending'::text NOT NULL,
    priority text DEFAULT 'Medium'::text NOT NULL,
    "submittedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FeatureRequest" OWNER TO postgres;

--
-- Name: FeatureRequest_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."FeatureRequest_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."FeatureRequest_id_seq" OWNER TO postgres;

--
-- Name: FeatureRequest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."FeatureRequest_id_seq" OWNED BY public."FeatureRequest".id;


--
-- Name: FinancialDocument; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FinancialDocument" (
    id text NOT NULL,
    "fileName" text NOT NULL,
    "fileUrl" text NOT NULL,
    "uploadDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    category text NOT NULL,
    "userId" text NOT NULL,
    "invoiceId" text,
    "expenseId" text
);


ALTER TABLE public."FinancialDocument" OWNER TO postgres;

--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    "invoiceNumber" text NOT NULL,
    status public."InvoiceStatus" DEFAULT 'DRAFT'::public."InvoiceStatus" NOT NULL,
    amount double precision NOT NULL,
    "issuedDate" timestamp(3) without time zone NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "clientId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Invoice" OWNER TO postgres;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: Subscription; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Subscription" (
    id text NOT NULL,
    name text NOT NULL,
    amount double precision NOT NULL,
    "billingCycle" public."BillingCycle" DEFAULT 'MONTHLY'::public."BillingCycle" NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Subscription" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    password text,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "sendDailyManifest" boolean DEFAULT false NOT NULL,
    "sendAfternoonManifest" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#3B82F6'::text NOT NULL,
    description text,
    "projectId" text NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "authorId" text NOT NULL,
    "taskId" text NOT NULL
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contacts (
    id text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    company text,
    role text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.contacts OWNER TO postgres;

--
-- Name: files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.files (
    id text NOT NULL,
    "originalName" text NOT NULL,
    filename text NOT NULL,
    mimetype text NOT NULL,
    size integer NOT NULL,
    path text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "uploaderId" text NOT NULL,
    "projectId" text,
    "taskId" text
);


ALTER TABLE public.files OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type public."NotificationType" DEFAULT 'INFO'::public."NotificationType" NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    "projectId" text
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: project_contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_contacts (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "contactId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.project_contacts OWNER TO postgres;

--
-- Name: project_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_members (
    id text NOT NULL,
    role public."ProjectMemberRole" DEFAULT 'MEMBER'::public."ProjectMemberRole" NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "projectId" text NOT NULL
);


ALTER TABLE public.project_members OWNER TO postgres;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "projectGoal" text,
    "projectValue" double precision,
    website text,
    status public."ProjectStatus" DEFAULT 'PLANNING'::public."ProjectStatus" NOT NULL,
    priority public."Priority" DEFAULT 'MEDIUM'::public."Priority" NOT NULL,
    "projectType" public."ProjectType" DEFAULT 'PERSONAL_PROJECT'::public."ProjectType" NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "ownerId" text NOT NULL
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    status public."TaskStatus" DEFAULT 'TODO'::public."TaskStatus" NOT NULL,
    priority public."Priority" DEFAULT 'MEDIUM'::public."Priority" NOT NULL,
    "startDate" timestamp(3) without time zone,
    "dueDate" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "estimatedHours" double precision,
    "actualHours" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "projectId" text NOT NULL,
    "assigneeId" text,
    "categoryId" text,
    "parentId" text
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: time_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.time_entries (
    id text NOT NULL,
    description text,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone,
    duration integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "taskId" text NOT NULL
);


ALTER TABLE public.time_entries OWNER TO postgres;

--
-- Name: timeline_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.timeline_events (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "eventDate" timestamp(3) without time zone,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "projectId" text NOT NULL
);


ALTER TABLE public.timeline_events OWNER TO postgres;

--
-- Name: FeatureRequest id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FeatureRequest" ALTER COLUMN id SET DEFAULT nextval('public."FeatureRequest_id_seq"'::regclass);


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: AppearanceSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AppearanceSettings" (id, "businessName", "missionStatement", "lightModeLogoUrl", "lightModeIconUrl", "darkModeLogoUrl", "darkModeIconUrl", "updatedAt", "lightBackground", "lightForeground", "lightCard", "lightCardForeground", "lightPopover", "lightPopoverForeground", "lightPrimary", "lightPrimaryForeground", "lightSecondary", "lightSecondaryForeground", "lightMuted", "lightMutedForeground", "lightAccent", "lightAccentForeground", "lightDestructive", "lightDestructiveForeground", "lightBorder", "lightInput", "lightRing", "darkBackground", "darkForeground", "darkCard", "darkCardForeground", "darkPopover", "darkPopoverForeground", "darkPrimary", "darkPrimaryForeground", "darkSecondary", "darkSecondaryForeground", "darkMuted", "darkMutedForeground", "darkAccent", "darkAccentForeground", "darkDestructive", "darkDestructiveForeground", "darkBorder", "darkInput", "darkRing") FROM stdin;
global_settings	SalesField Network	SalesField Network combines cutting-edge artificial intelligence with traditional business consulting values, delivering personalized solutions for Santa Barbara County's unique business landscape.	/logos/1755670605554-1755483757624-hoiz-logo-title-subtitle-01.png	/logos/1755670613320-1755483982299-icon-96x96.png	/logos/1755670609533-1755483978783-hoiz-logo-title-subtitle-02.png	/logos/1755670616306-1755483984860-icon-96x96.png	2025-08-20 06:17:00.239	#e7e2d9	#020817	#ebebeb	#020817	#ffffff	#020817	#18181b	#fafafa	#f4f4f5	#18181b	#f4f4f5	#71717a	#f4f4f5	#18181b	#ef4444	#fafafa	#e4e4e7	#e4e4e7	#18181b	#3b3b3b	#fafafa	#404040	#fafafa	#09090b	#fafafa	#fafafa	#18181b	#27272a	#fafafa	#27272a	#a1a1aa	#27272a	#fafafa	#7f1d1d	#fafafa	#27272a	#27272a	#d4d4d8
\.


--
-- Data for Name: Budget; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Budget" (id, category, amount, month, year, "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Client" (id, name, email, website, notes, "contractTerm", "contractAmount", "contractStartDate", frequency, "userId", "createdAt", "updatedAt") FROM stdin;
cme1hqjg90001u2je70qxmkbe	Highline Adventures LLC	jeff@highlineadventures.com	https://highlineadventures.com	6 months @2000 per month	ONE_MONTH	2000	2025-07-01 07:00:00	\N	cmdrpje6a0000bp9ma5my0hnj	2025-08-07 14:27:00.728	2025-08-08 21:53:53.644
cme4buaeh00058d64kwl605mu	Allan Tolar	aleetolar@icloud.com	https://tolarsoberliving.com	Hosting	ONE_YEAR	240	2025-09-01 07:00:00	Annually	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 14:05:16.434	2025-08-09 14:07:31.943
cme4bx07700098d64e8c9iby7	Kim Kuljian	kim@turningpointcoaching.com	https://turningpointcoaching.com		ONE_YEAR	240	2025-09-01 07:00:00	\N	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 14:07:23.202	2025-08-09 14:07:23.202
cme4c3wd1000d8d64f7p2p6ul	Stevie Kuhn | 417 South River	stevie@417recovery.com	https://417recovery.com	Copy Stevie Kuhn (Director) and Bridget White (bridget@417recoverysandiego.com) pays the bills. I have asked for 1K, every 6 moths. Otherwise I will let this expire. Have not heard back. 	SIX_MONTH	500	2025-09-01 07:00:00	\N	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 14:12:44.798	2025-08-09 14:12:44.798
cmec870u400015nku482ws6jr	Santucci Builders	jasbinc@gmail.com	https://santuccibuilders.com/	Eve is who we talk too, Jerry Santucci is who owns it. \n(760) 578-7757	ONE_YEAR	250	2020-07-01 07:00:00	\N	cmdrpje6a0000bp9ma5my0hnj	2025-08-15 02:45:21.51	2025-08-15 02:45:21.51
\.


--
-- Data for Name: Document; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Document" (id, title, name, type, size, path, "userId", "projectId", "expenseId", "createdAt", "updatedAt") FROM stdin;
cme77j6ve0000dexpo04qt6ua	Test ME	KF_Implementing Editable Lists_V001.md	application/octet-stream	8196	uploads/1754922478725-380319575-KF_Implementing_Editable_Lists_V001.md	cmdrpje6a0000bp9ma5my0hnj	cme1r0jpa0001121o5lxkogg0	\N	2025-08-11 14:27:58.73	2025-08-11 14:27:58.73
cme77l5cf0001dexpw49zj13o	Test me	KF_Implementing Editable Lists_V001.md	application/octet-stream	8196	uploads/1754922570060-577893348-KF_Implementing_Editable_Lists_V001.md	cmdrpje6a0000bp9ma5my0hnj	\N	\N	2025-08-11 14:29:30.063	2025-08-11 14:29:30.063
cmead5j9100029l8wz1if9aw4	Knowledge File	Knowledge-File_Breadboard Buellton Business Analysis_.md	application/octet-stream	46718	uploads/1755113317784-106370288-Knowledge-File_Breadboard_Buellton_Business_Analysis_.md	cmdrpje6a0000bp9ma5my0hnj	cme1lllf10003u2jeus7ks4sj	\N	2025-08-13 19:28:37.792	2025-08-13 19:28:37.792
cmead6eo500039l8wc3gdaj5l	Proposal	A Proposal for Enhanced Digital Strategy and Growth_ Partnering with Breadboard Buellton.md	application/octet-stream	5518	uploads/1755113358530-768830967-A_Proposal_for_Enhanced_Digital_Strategy_and_Growth__Partnering_with_Breadboard_Buellton.md	cmdrpje6a0000bp9ma5my0hnj	cme1lllf10003u2jeus7ks4sj	\N	2025-08-13 19:29:18.532	2025-08-13 19:29:18.532
cmeaoectb00022u2n8a4rjmdc	Receipt for: Osteria Grappolo	17551321762786036407121683297580.jpg	image/jpeg	2336320	uploads/1755132205145-773888128-17551321762786036407121683297580.jpg	cmdrpje6a0000bp9ma5my0hnj	\N	cmeaoeb9r00012u2nfgcmginr	2025-08-14 00:43:25.152	2025-08-14 00:43:25.152
cmebmpkke00042u2nlq83ndgn	Knowledge_File_RPG Termite & Pest Control	Knowledge_File_RPG Termite & Pest Control.md	application/octet-stream	34657	uploads/1755189835335-472048180-Knowledge_File_RPG_Termite_&_Pest_Control.md	cmdrpje6a0000bp9ma5my0hnj	cme9fpkfv000bsq1vs271m1hn	\N	2025-08-14 16:43:55.337	2025-08-14 16:43:55.337
cmebnbt8100052u2n983mno58	Proposal V01	A Strategic Proposal for the Digital Growth of RPG Termite & Pest Control.md	application/octet-stream	13512	uploads/1755190872982-814592174-A_Strategic_Proposal_for_the_Digital_Growth_of_RPG_Termite_&_Pest_Control.md	cmdrpje6a0000bp9ma5my0hnj	cme9fpkfv000bsq1vs271m1hn	\N	2025-08-14 17:01:12.983	2025-08-14 17:01:12.983
cmebtqjy10000adndas9j9qcl	Business Plan: Morehouse Mediation	Morehouse Mediation Business Plan Outline.md	application/octet-stream	66404	uploads/1755201638491-802384892-Morehouse_Mediation_Business_Plan_Outline.md	cmdrpje6a0000bp9ma5my0hnj	cmebsdgrm00023kxcjbxl0cxe	\N	2025-08-14 20:00:38.5	2025-08-14 20:00:38.5
cmebulawq0004adndlxtdxmtp	Proposal	Digital Optimization & Growth Partnership Proposal.md	application/octet-stream	9861	uploads/1755203073144-154465596-Digital_Optimization_&_Growth_Partnership_Proposal.md	cmdrpje6a0000bp9ma5my0hnj	cmebsdgrm00023kxcjbxl0cxe	\N	2025-08-14 20:24:33.146	2025-08-14 20:24:33.146
\.


--
-- Data for Name: Expense; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Expense" (id, description, amount, category, date, "userId", "createdAt", "updatedAt") FROM stdin;
cme6bmlkf0001bxb01v9kncuu	Industrial Eats	64.95	MARKETING	2025-08-10 00:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-10 23:34:50.03	2025-08-10 23:34:50.03
cmeaoeb9r00012u2nfgcmginr	Osteria Grappolo	60.9	MARKETING	2025-08-13 00:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-14 00:43:23.151	2025-08-14 00:43:23.151
\.


--
-- Data for Name: FeatureRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FeatureRequest" (id, title, description, status, priority, "submittedBy", "createdAt", "updatedAt") FROM stdin;
2	Accounting Page	Current clients, payment schedule, totals, upcoming forecasts, upcoming payments, alerts for payments, over due payments, etc. As well, as current expenses. Current budget and ongoing subscriptions. Income / Expense statement. Upload receipts, tax information. Etc.	In Progress	Medium	Richard Shannon	2025-08-03 18:45:51.763	2025-08-10 15:29:45.111
3	Notifications 	In settings, a user should be able to turn on notifications for push and email. This is not a priority yet. 	Pending	Low	Richard Shannon	2025-08-03 18:48:54.107	2025-08-03 18:48:54.107
7	Uploads not working	Can't view or download them	Pending	High	Richard Shannon	2025-08-05 00:58:10.26	2025-08-05 00:58:10.26
9	Meta Logo Image for proposals	Set it in the php document for texting the proposal link	Pending	Medium	Richard Shannon	2025-08-06 22:52:13.189	2025-08-06 22:52:13.189
17	GA4 Analytics	For me and for clients	Pending	Medium	Richard Shannon	2025-08-10 15:58:28.454	2025-08-10 15:58:28.454
18	Aniversery	And follow up alerts, Every client should have an anniversary date, if we don't know it, pick one. Reach out to them via a phone call on their anniversary. Every client should have a 2 month rotating "reach out" or follow update, keep it fresh with clients. 	Pending	Medium	Richard Shannon	2025-08-10 16:00:43.005	2025-08-17 21:59:36.059
19	Financial next month	Needs to be calculated by contract	Pending	High	Richard Shannon	2025-08-10 17:40:23.465	2025-08-10 17:40:23.465
20	Permissions	Apparently only I can see the data!	Done	High	Richard Shannon	2025-08-11 14:17:30.512	2025-08-14 16:07:14.912
21	Uploads	we have them in project details, and in expenses, any document that is uploaded should also be found in "documents"	Pending	Medium	Richard Shannon	2025-08-11 14:31:57.931	2025-08-11 14:31:57.931
23	Project timeline events	date field needs to be optional. we can set it as we go. 	Done	Medium	John Doe	2025-08-11 19:03:53.366	2025-08-14 16:06:50.889
24	Calendar 	Month view, daily agenda	Pending	Medium	Richard Shannon	2025-08-15 14:19:57.857	2025-08-15 14:19:57.857
25	Db	Download the live database use it for testing purposes 	Pending	Medium	Richard Shannon	2025-08-15 14:22:24.58	2025-08-15 14:22:24.58
26	Forms / Email	Get forms and email up and running	Pending	Medium	Richard Shannon	2025-08-15 14:53:54.078	2025-08-15 14:53:54.078
27	Payments	online form / page to submit payments. Instructions for sending checks, venmo, zelle, or submit payment	Pending	Medium	Richard Shannon	2025-08-15 14:56:48.361	2025-08-15 14:56:48.361
28	Subscription Tiers	3 tiers, small, medium, large. what they provide, pricing, terms, etc. 	Pending	Medium	Richard Shannon	2025-08-15 14:57:42.905	2025-08-15 14:57:42.905
29	Support Ticket	Help and contact services, tech questions, issues, billing, etc. Support page with a form and contact info. 	Pending	Medium	Richard Shannon	2025-08-15 15:48:32.959	2025-08-17 22:00:07.261
30	Time-line event status 	Needs to be avalibe to edit on mobile	Pending	Medium	Richard Shannon	2025-08-15 21:05:46.851	2025-08-15 21:05:46.851
31	Email Templates	Create email templates for "Daily Manifest" add an email field and button to a project, so we can send that project to someone, have a template for it. Lets have the templates viewable as HTML files, listed in a table at the bottom of the settings page. 	Pending	Medium	Richard Shannon	2025-08-16 16:56:16.323	2025-08-16 16:56:16.323
32	Evening Manifest	If the morning manifest actually works, lets create an evening manifest for tomorrows activities. 	Pending	Medium	Richard Shannon	2025-08-16 16:57:06.12	2025-08-16 16:57:06.12
33	Proposals, links in projects	Once a proposal is made in /proposal we need to be able to add it to the project. We should be able to have a table of links that we can consciously add. with a name, type (proposal, informational, research, etc) and the link itself. 	Pending	Medium	Richard Shannon	2025-08-16 17:00:36.141	2025-08-16 17:00:36.141
34	Operations	Lets have that revised, so "Yesterday" includes completed tasks and all activity. Put "Today" at the top, then "Tomorrow" then "Yesterday"	Pending	Medium	Richard Shannon	2025-08-16 17:17:18.462	2025-08-16 17:17:18.462
35	Settings page	Is not responsive	Pending	Medium	Richard Shannon	2025-08-16 21:02:06.619	2025-08-16 21:02:06.619
36	cron emails	are not sending automatically	Pending	Medium	Richard Shannon	2025-08-17 13:45:37.017	2025-08-17 13:45:37.017
37	Feature Requests	lets give them dates, and schedule them	Pending	Medium	Richard Shannon	2025-08-17 13:46:08.406	2025-08-17 13:46:08.406
38	Business	In the settings page I would like to have an upload field for two logos and a field for the business name so that in settings you can set all the business themed related information and it would apply to the whole application that way this application can be repackaged and served to anyone with an empty database 	Pending	Medium	Richard Shannon	2025-08-17 14:13:28.858	2025-08-17 14:13:28.858
39	Individual README	For each page of this application, there needs to be an individual README file, within the content structure that explicitly details all the technical development for that page, its components, functionality, and can be used for development of that single page. 	Pending	Medium	Richard Shannon	2025-08-18 13:55:53.279	2025-08-18 13:55:53.279
40	Vibe Code Process	Vibe coding large-scale applications requires a blend of rapid prototyping and robust development practices. Focus on establishing clear architectural boundaries, using a modular approach, and leveraging AI for initial code generation while maintaining human oversight for quality and maintainability. Key strategies include utilizing AI-friendly tech stacks, establishing code review frameworks, implementing automated testing, and investing in prompt engineering and AI literacy. \nHere's a breakdown of tips and tricks:\n1. Choose an AI-Friendly Tech Stack:\nLeverage well-documented technologies:\n.\nSelect a stack that AI models are well-trained on, like TypeScript, Python, and Tailwind CSS. \nUtilize static typing:\n.\nTypeScript's static typing helps catch errors early and improves code maintainability, making it easier for AI to generate accurate code. \nConsider popular frameworks:\n.\nFrameworks like Next.js for frontend and APIs, Supabase for database and authentication, and Vercel for hosting are often well-supported. \n2. Establish Architectural Boundaries and Modular Design:\nDefine clear modules:\nBreak down the application into smaller, well-defined modules with clear responsibilities.\nUse architectural patterns:\nEmploy patterns like microservices or hexagonal architecture to improve maintainability and scalability.\nMaintain architectural ownership:\nEnsure teams understand and maintain the overall architectural vision while leveraging AI for implementation within those boundaries. \n3. Embrace Rapid Iteration with Robust Testing:\nStart with a minimum viable product (MVP):\n.\nFocus on getting a basic version of the application working quickly. \nIterate based on feedback:\n.\nUse AI to generate code, test it, and refine your prompts based on the results. \nImplement automated testing:\n.\nIntegrate automated testing and CI/CD pipelines to ensure code quality and reliability. \nUse version control (Git):\n.\nGit is crucial for managing changes, reverting to previous versions, and tracking progress. \n4. Optimize Prompt Engineering and AI Collaboration:\nProvide clear context:\nGive the AI the necessary context, including documentation, API details, and specific requirements, to avoid errors and ensure accurate code generation. \nBreak down complex tasks:\nSplit large prompts into smaller, more manageable tasks for the AI to handle effectively. \nVerify AI-generated code:\nAlways verify the AI's output against independent sources and your existing systems. \nTreat AI as a collaborator:\nUse AI as a tool to assist with code generation, but maintain human oversight for quality control. \n5. Monitor and Audit AI Contributions:\nTrack AI usage:\nMonitor where and how AI-generated code is used, especially in security-sensitive areas.\nEnforce accountability:\nEnsure that there is accountability for AI-generated code, especially in production. \n6. Develop AI Literacy and Governance:\nTrain developers:\n.\nEquip developers with the skills to effectively use AI tools and understand their limitations.\nEstablish code review frameworks:\n.\nImplement clear guidelines for how and when AI-generated code should be reviewed.\nDevelop safety guidelines:\n.\nCreate policies for safe and responsible use of AI in software development. \nBy following these tips, you can effectively leverage the power of vibe coding to accelerate development while maintaining the quality and reliability of large-scale applications. 	Pending	High	Richard Shannon	2025-08-18 14:22:09.052	2025-08-18 14:22:09.052
\.


--
-- Data for Name: FinancialDocument; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FinancialDocument" (id, "fileName", "fileUrl", "uploadDate", category, "userId", "invoiceId", "expenseId") FROM stdin;
\.


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Invoice" (id, "invoiceNumber", status, amount, "issuedDate", "dueDate", "clientId", "userId", "createdAt", "updatedAt") FROM stdin;
cme3d3eto0001j4ydx5tz1ca9	INV-ME3D3ETN	PAID	2000	2025-08-15 00:00:00	2025-09-01 00:00:00	cme1hqjg90001u2je70qxmkbe	cmdrpje6a0000bp9ma5my0hnj	2025-08-08 21:52:35.532	2025-08-09 14:01:35.055
cme4boh4k00018d646pvnfv2h	INV-ME4BOH4I	PAID	2000	2025-07-15 00:00:00	2025-08-02 00:00:00	cme1hqjg90001u2je70qxmkbe	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 14:00:45.236	2025-08-09 14:38:03.37
cme4bp52100038d64b42fb7ft	INV-ME4BP520	DRAFT	2000	2025-06-15 00:00:00	2025-07-01 00:00:00	cme1hqjg90001u2je70qxmkbe	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 14:01:16.249	2025-08-09 14:08:17.746
cme4bv13i00078d64im1qk8rb	INV-ME4BV13H	DRAFT	240	2025-09-01 00:00:00	2025-09-15 00:00:00	cme4buaeh00058d64kwl605mu	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 14:05:51.054	2025-08-09 23:24:17.047
cme4bxwho000b8d64p187fedc	INV-ME4BXWHM	DRAFT	240	2025-09-01 00:00:00	2025-09-15 00:00:00	cme4bx07700098d64e8c9iby7	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 14:08:05.052	2025-08-09 23:24:39.599
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: Subscription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Subscription" (id, name, amount, "billingCycle", "dueDate", "userId", "createdAt", "updatedAt") FROM stdin;
cme3d6a640003j4yd4j8q8ldk	Google Workspace	40	MONTHLY	\N	cmdrpje6a0000bp9ma5my0hnj	2025-08-08 21:54:49.468	2025-08-09 15:59:32.665
cme3d74h40005j4ydt5j7p3bw	Railway Hosting	20	MONTHLY	\N	cmdrpje6a0000bp9ma5my0hnj	2025-08-08 21:55:28.743	2025-08-08 21:55:28.743
cme4uv2gn0001x6zsc5nsmk1e	mediatreeservices.com | inmotionhosting.com	23	ANNUALLY	2025-09-30 07:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 22:57:45.526	2025-08-09 23:09:59.417
cme4uwfjw0003x6zstk1se40z	salesfield.net | inmotionhosting.com	26	ANNUALLY	2026-08-10 07:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 22:58:49.126	2025-08-09 23:10:06.851
cme4uxand0005x6zsovxymyu9	3note3.com | inmotionhosting.com	23	ANNUALLY	2025-09-26 07:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 22:59:29.448	2025-08-09 23:10:15.014
cme4uy6ki0007x6zs38ftwlvd	kendoxy.com | inmotionhosting.com	23	ANNUALLY	2026-08-08 07:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 23:00:10.817	2025-08-09 23:10:22.157
cme4uz21l0009x6zstevz7flp	lilde.com | inmotionhosting.com	23	ANNUALLY	2026-08-16 07:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 23:00:51.608	2025-08-09 23:10:28.056
cme4uzubs000bx6zsdqs9uhw6	litala.com | inmotionhosting.com	23	ANNUALLY	2025-09-22 07:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 23:01:28.263	2025-08-09 23:10:33.885
cme4v0py2000dx6zs0z88o3a2	powerfulsilence.com | inmotionhosting.com	23	ANNUALLY	2026-01-29 08:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 23:02:09.242	2025-08-09 23:10:40.98
cme4v1rer000fx6zs5oun8wst	visionpit.com | inmotionhosting.com	23	ANNUALLY	2026-07-26 07:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 23:02:57.794	2025-08-09 23:10:46.99
cme4v2ln7000hx6zsemqknaze	desertawakenings.org | inmotionhosting.com	23	ANNUALLY	2026-04-21 07:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 23:03:36.979	2025-08-09 23:10:53.797
cme4v3vmp000jx6zs4vt8z31y	mediatreeservices.com | VPS-1000HA-S Web Hosting	935.88	ANNUALLY	2026-01-23 08:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 23:04:36.555	2025-08-09 23:04:36.555
cme4v50i6000lx6zsp513rbqu	mediatreeservices.com | cPanel Plus 50	21.3	ANNUALLY	2025-08-23 07:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 23:05:29.549	2025-08-09 23:05:29.549
cme4v5v2s000nx6zskluqlk3a	seovision.net | inmotionhosting.com	26	ANNUALLY	2026-02-06 08:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 23:06:09.171	2025-08-09 23:11:01.178
cme4v6m7l000px6zsyrpqvl4p	santuccibuilders.com | inmotionhosting.com	23	ANNUALLY	2026-03-25 07:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 23:06:44.336	2025-08-09 23:11:08.286
cme4v7fyv000rx6zs3l2ichtj	plor.us | inmotionhosting.com	15.2	ANNUALLY	2025-11-03 08:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 23:07:22.903	2025-08-09 23:11:17.263
cme4v8dwa000tx6zssa64yby3	coachellavalleysobwerliving.com | inmotionhosting.com	23	ANNUALLY	2026-03-01 08:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 23:08:06.874	2025-08-09 23:11:23.968
cme4v9pbt000vx6zsse3nniqo	getoutsidefoundation.org | inmotionhosting.com	19.98	ANNUALLY	2026-06-21 07:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 23:09:08.344	2025-08-09 23:11:29.575
cme4vac9j000xx6zsovxp3mk5	summitguardian.com | inmotionhosting.com	23	ANNUALLY	2025-09-25 07:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-09 23:09:38.048	2025-08-09 23:11:34.959
cme51ny7s000zx6zsk3lptqo7	highlineadventures.co | godaddy.com	51.99	ANNUALLY	2025-08-31 07:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-10 02:08:10.744	2025-08-10 02:08:10.744
cme51p3e80011x6zsmvplpc3o	thevineyard.pro | godaddy.com	37.99	ANNUALLY	2025-09-16 07:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-10 02:09:04.112	2025-08-10 02:09:04.112
cme51q99j0013x6zs4xabmgwl	omnes.pro | godaddy.com	37.99	ANNUALLY	2025-10-23 07:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-10 02:09:58.375	2025-08-10 02:09:58.375
cme5psqdh0015x6zs27oc1tye	vox.red | godaddy.com	31.99	ANNUALLY	2025-10-23 07:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-10 13:23:44.624	2025-08-10 13:23:44.624
cme5ptuxs0017x6zs0c13cgs1	priori.dev | godaddy.com	23.99	ANNUALLY	2025-10-23 07:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-10 13:24:37.214	2025-08-10 13:24:37.214
cme5pv4rn0019x6zs4ssgxjjs	santucci.pro	37.99	ANNUALLY	2026-05-26 07:00:00	cmdrpje6a0000bp9ma5my0hnj	2025-08-10 13:25:36.611	2025-08-10 13:25:36.611
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, "emailVerified", image, password, role, "isActive", "sendDailyManifest", "sendAfternoonManifest", "createdAt", "updatedAt") FROM stdin;
cmdrpje6a0000bp9ma5my0hnj	Richard Shannon	richard@salesfield.net	\N	\N	$2a$12$YYPjXdj9JqfseYybMCRBbOMpopKrcrDvCEyUGuvUQ8YOO1mxHsKGy	ADMIN	t	t	t	2025-07-31 11:07:42	2025-08-19 20:42:17.121
cmdtr669h0000ih4v6n3jmn4k	Shannon Hall	shannonhall8238@yahoo.com	\N	\N	$2a$12$Cb.3pe14MDiO9s/2WlhtGOdI4ysevXcDDok/GvUGLShf9gpqD5IlW	USER	t	f	f	2025-08-02 04:28:57.27	2025-08-17 02:30:19.897
cme7gtezl0000110cazcq22bz	John Doe	john@doe.com	\N	\N	$2b$12$1coakzfnFBaMqit9T8V/1edlIxEmyBx0SVEY.ljjruj.KHE6X6WFG	USER	t	f	f	2025-08-11 18:47:52.353	2025-08-11 18:47:52.353
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3368b4f6-d0b8-4e76-8374-13e7ee81896b	262592c4635ad74a271fde6fb0071e19c8096a7d908b8931c40fc71ab3b2c9e6	2025-08-20 06:31:46.345329+00	20250820063145_init_postgres	\N	\N	2025-08-20 06:31:45.510153+00	1
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, color, description, "projectId") FROM stdin;
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, content, "createdAt", "updatedAt", "authorId", "taskId") FROM stdin;
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contacts (id, name, email, phone, company, role, notes, "createdAt", "updatedAt") FROM stdin;
cmdukq23c0000fobakt5s8pf8	Richard Shannon	richard@salesfield.net	(805) 720-8554	SalesField Network	Owner / CEO		2025-08-02 18:16:13.848	2025-08-02 18:16:13.848
cmeabsgsq0000121p5k00pq4o	Quincy						2025-08-13 18:50:28.49	2025-08-13 18:50:28.49
cmebnt5ej00062u2nbktnvo5a	Paul	paul@rpgtermite.com					2025-08-14 17:14:41.925	2025-08-14 17:14:41.925
cmebu50bk0001adndxiwih90m	Rachael Morehouse	rachaeljsm@gmail.com	(805) 350-1318	Morehouse Mediation	Owner / CEO		2025-08-14 20:11:52.907	2025-08-14 20:37:56.782
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.files (id, "originalName", filename, mimetype, size, path, "createdAt", "uploaderId", "projectId", "taskId") FROM stdin;
cmdzbqjb80003mqmd0m0hmfwk	Lone Star Engineering Detailed Report_.md	1754445810497-532746370-Lone_Star_Engineering_Detailed_Report_.md	application/octet-stream	50858	/data/uploads/cmdzbpnq90001mqmdbmdw848o/1754445810497-532746370-Lone_Star_Engineering_Detailed_Report_.md	2025-08-06 02:03:30.5	cmdrpje6a0000bp9ma5my0hnj	cmdzbpnq90001mqmdbmdw848o	\N
cmdzcmlcs0007mqmdvbd94tz1	Website Development Proposal_ Lone Star Engineering.md	1754447306139-798998624-Website_Development_Proposal__Lone_Star_Engineering.md	application/octet-stream	7180	/data/uploads/cmdzbpnq90001mqmdbmdw848o/1754447306139-798998624-Website_Development_Proposal__Lone_Star_Engineering.md	2025-08-06 02:28:26.141	cmdrpje6a0000bp9ma5my0hnj	cmdzbpnq90001mqmdbmdw848o	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, title, message, type, read, "createdAt", "userId", "projectId") FROM stdin;
\.


--
-- Data for Name: project_contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_contacts (id, "projectId", "contactId", "createdAt") FROM stdin;
cmdukq23c0002fobaox06c4mi	cmds7jju40001ys0guh0kemjx	cmdukq23c0000fobakt5s8pf8	2025-08-02 18:16:13.848
cmeabsgsq0002121psc1iwy7j	cmdylqi2x0004117n64gmp1ny	cmeabsgsq0000121p5k00pq4o	2025-08-13 18:50:28.49
cmebnt5ej00082u2nu03n350k	cme9fpkfv000bsq1vs271m1hn	cmebnt5ej00062u2nbktnvo5a	2025-08-14 17:14:41.925
cmebu50bk0003adnd4h7er81n	cmebsdgrm00023kxcjbxl0cxe	cmebu50bk0001adndxiwih90m	2025-08-14 20:11:52.907
\.


--
-- Data for Name: project_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_members (id, role, "joinedAt", "updatedAt", "userId", "projectId") FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, name, description, "projectGoal", "projectValue", website, status, priority, "projectType", "startDate", "endDate", "createdAt", "updatedAt", "ownerId") FROM stdin;
cmds7jju40001ys0guh0kemjx	SalesField Network	Sales Field Network is an independent programming consultancy that combines advanced technical expertise with AI integration to deliver immediate, measurable business optimization results for Santa Barbara County's tourism and hospitality sector.	10k a moth by Dec. 	\N	salesfield.net 	ON_HOLD	LOW	PROFESSIONAL_PROJECT	2025-07-15 00:00:00	2025-12-01 00:00:00	2025-08-01 02:31:42.893	2025-08-14 18:43:23.956	cmdrpje6a0000bp9ma5my0hnj
cmdylqi2x0004117n64gmp1ny	E V X P | My Electric Vehicle Experience Project	E V X P offers the perfect form of transportation for Solvang visitors.\n\nAll-electric vehicles that boasts zero emissions, ridiculously chic styling, and a range of eye-catching color and customization options.\n\n \n\nWith its open-air body style, our\n\nelectric vehicles offers unrivaled sightseeing capabilities, quickly becoming one of the most sought-after and stylish transport experiences available in Solvang.	2k a month @ about 2-3 hours a day. 	2000	https://www.myevxperience.com/	IN_PROGRESS	HIGH	POTENTIAL_CLIENT	2025-08-05 00:00:00	2025-11-01 00:00:00	2025-08-05 13:55:38.89	2025-08-14 23:19:02.536	cmdrpje6a0000bp9ma5my0hnj
cmdzbpnq90001mqmdbmdw848o	Lone Star Engineering Project	Lone Star Engineering, LLC: An MEP (Mechanical, Electrical, and Plumbing) engineering consulting firm, specializing in design services for commercial, institutional, and residential buildings. Their focus is on expert design and client-centric solutions.\n\nLone Star Engineering Inc.: A General Engineering and General Building contractor, with a significant specialization in telecommunications infrastructure projects for major carriers, and also recognized as a concrete contractor. This entity demonstrates longevity and a deep niche in critical infrastructure.	4k Website, ongoing services at 2k a month. 	\N	\N	PLANNING	LOW	POTENTIAL_CLIENT	2025-08-05 07:00:00	2025-10-01 07:00:00	2025-08-06 02:02:49.569	2025-08-16 15:24:40.567	cmdrpje6a0000bp9ma5my0hnj
cme1lllf10003u2jeus7ks4sj	Breadboard Deli	373 Ave Of The Flags, Buellton, Suite E\nBuellton, California 93427\n(805) 697-7635	1k per month, 6 months. 	2000	https://breadboardbuellton.square.site/	IN_PROGRESS	MEDIUM	POTENTIAL_CLIENT	2025-08-07 00:00:00	2025-08-28 00:00:00	2025-08-07 16:15:08.461	2025-08-14 18:41:21.111	cmdrpje6a0000bp9ma5my0hnj
cme1r0jpa0001121o5lxkogg0	Stica	SYV lunch place	\N	\N	\N	PLANNING	MEDIUM	POTENTIAL_CLIENT	2025-08-07 00:00:00	\N	2025-08-07 18:46:44.159	2025-08-14 18:43:59.057	cmdrpje6a0000bp9ma5my0hnj
cme9fgkid0003sq1vkpv8ecxg	Nielsen Building Materials, Inc	Nielsen Building Materials (NBM) is a family-owned business providing all your home improvement and construction needs	\N	\N	\N	PLANNING	MEDIUM	POTENTIAL_CLIENT	2025-08-12 00:00:00	\N	2025-08-13 03:45:25.718	2025-08-14 18:42:51.578	cmdrpje6a0000bp9ma5my0hnj
cme9fjjxe0005sq1v9tc6afgw	Coast Plumbing Solutions	At Coast Plumbing Solutions, we are committed to bringing you reliable plumbing services for your home. We are a full-service plumbing company—from bathroom and kitchen remodels, drain cleaning, water heater repair, water treatment to commercial damage repairs and everything in between. As residents and members in the Santa Barbara County community, we take pride in our work and stand by our two-year minimum warranties on all repairs.	\N	\N	https://www.coastplumb.com/city/buellton-ca/?utm_campaign=gmb	IN_PROGRESS	MEDIUM	POTENTIAL_CLIENT	2025-08-12 07:00:00	\N	2025-08-13 03:47:44.931	2025-08-17 23:30:48.175	cmdrpje6a0000bp9ma5my0hnj
cme9flx820007sq1vnweuzv06	The Landsby	\N	\N	\N	https://www.thelandsby.com/	PLANNING	MEDIUM	POTENTIAL_CLIENT	2025-08-12 00:00:00	\N	2025-08-13 03:49:35.474	2025-08-14 18:44:11.387	cmdrpje6a0000bp9ma5my0hnj
cme9fmybc0009sq1vov6h2c4h	Pieces of the Past Vintage and Antiques Collective	\N	\N	\N	https://www.facebook.com/APieceofthePastSolvang/	PLANNING	MEDIUM	POTENTIAL_CLIENT	2025-08-12 00:00:00	\N	2025-08-13 03:50:23.545	2025-08-14 18:43:00.126	cmdrpje6a0000bp9ma5my0hnj
cme9fpkfv000bsq1vs271m1hn	RPG Termite & Pest Control	RPG Termite & Pest Control is located in the Santa Ynez Valley and services all of Santa Barbara and San Louis Obispo Counties. We offer quality Termite Control with standard and alternative treatments with full structure warranties. We are a licensed contractor and perform all our damage repairs and construction in house. We also specialize in general pest control services, rodent control, attic cleanouts, and more. We service all of Santa Barbara, Goleta, Buellton, Solvang, Santa Ynez, Lompoc, Santa Maria, San Louis Obispo and all neighboring cities.	5k one time or 1k a month for 6 months	2000	http://rpghomeservices.com/	IN_PROGRESS	HIGH	POTENTIAL_CLIENT	2025-08-12 00:00:00	2025-09-18 00:00:00	2025-08-13 03:52:25.532	2025-08-14 23:22:07.027	cmdrpje6a0000bp9ma5my0hnj
cme9fwzmc000dsq1vss9gprc7	Birkholm's Bakery & Cafe	\N	\N	\N	http://www.birkholmsbakery.com/	PLANNING	MEDIUM	POTENTIAL_CLIENT	2025-08-12 00:00:00	\N	2025-08-13 03:58:11.796	2025-08-14 18:41:11.613	cmdrpje6a0000bp9ma5my0hnj
cme9fynq0000fsq1vcn61v87r	Cafe Dolce	Cozy coffee shop offering Turkish coffee, panini, pastries, and a popular selection of baklava.	\N	1000	https://www.cafedolce2go.com/	IN_PROGRESS	MEDIUM	POTENTIAL_CLIENT	2025-08-12 00:00:00	2025-09-13 00:00:00	2025-08-13 03:59:29.688	2025-08-14 23:19:51.496	cmdrpje6a0000bp9ma5my0hnj
cme9g3vre000hsq1vwppvr7p4	Excelta 	Excelta has pioneered the combined use of Laser technology with the most advanced CNC machining to produce the finest grade cutter available. We start with premium steel, laser cut for consistency, and CNC machined to exact specifications. The cutting blades are induction hardened to 63 - 65 Rockwell C for durability and precision hard-milled for sharpness to produce state of the art tools, Precisely Right for all your cutting needs.	\N	\N	https://www.excelta.com/	PLANNING	MEDIUM	POTENTIAL_CLIENT	2025-08-12 00:00:00	\N	2025-08-13 04:03:33.386	2025-08-14 18:42:01.746	cmdrpje6a0000bp9ma5my0hnj
cme9g58im000jsq1vota3dghb	First Street Leather	First Street Leather is your Premier Destination for High-Quality Leather Goods.	\N	\N	https://www.firststreetleather.com/	PLANNING	MEDIUM	POTENTIAL_CLIENT	2025-08-12 00:00:00	\N	2025-08-13 04:04:36.574	2025-08-14 18:42:11.416	cmdrpje6a0000bp9ma5my0hnj
cme9g80op000lsq1vh8or0ikc	Solvang Home Connection	\N	\N	\N	https://www.solvanghomeconnection.com/	PLANNING	MEDIUM	POTENTIAL_CLIENT	2025-08-12 00:00:00	\N	2025-08-13 04:06:46.393	2025-08-14 18:43:49.381	cmdrpje6a0000bp9ma5my0hnj
cme9g9325000nsq1vg3jaxy3n	Ingeborg's Danish Chocolates Inc	\N	\N	\N	https://ingeborgs.com/	PLANNING	MEDIUM	POTENTIAL_CLIENT	2025-08-12 00:00:00	\N	2025-08-13 04:07:36.125	2025-08-14 18:42:19.123	cmdrpje6a0000bp9ma5my0hnj
cme9ga3ud000psq1vocpusjvy	Inklings	\N	\N	\N	https://inklings.biz/	PLANNING	MEDIUM	POTENTIAL_CLIENT	2025-08-12 00:00:00	\N	2025-08-13 04:08:23.797	2025-08-14 18:42:27.442	cmdrpje6a0000bp9ma5my0hnj
cmebo65d1000b2u2ngzqm98f9	Santucci Builders	Our mission is to perform the highest level of quality construction services at a fair and highly competitive rate.\nTo ensure the longevity of our company through repeat and referral business achieved by client satisfaction in all areas including timeline, attention to detail and service minded attitudes. To maintain the highest levels of professionalism, integrity and honesty in our relationships with clients and associates.	\N	250	https://santuccibuilders.com/	IN_PROGRESS	MEDIUM	CURRENT_CLIENT	2025-08-14 00:00:00	2025-09-18 00:00:00	2025-08-14 17:24:48.421	2025-08-14 23:22:12.87	cmdrpje6a0000bp9ma5my0hnj
cmebo89d6000s2u2nev11wzan	Trident Truss Co., Inc.	Santucci Builders is creating Trident Truss Co., Inc.	\N	3500	\N	IN_PROGRESS	HIGH	QUALIFIED_CLIENT	2025-08-14 00:00:00	2026-01-01 00:00:00	2025-08-14 17:26:26.922	2025-08-14 23:21:58.728	cmdrpje6a0000bp9ma5my0hnj
cmebsdgrm00023kxcjbxl0cxe	Morehouse Mediation	Mediation services offer a way to resolve disputes outside of court, facilitated by a neutral third party who helps the involved parties communicate and reach a mutually agreeable solution. This process is voluntary, confidential, and typically less adversarial and costly than litigation. 	\N	\N	https://morehousemediation.com 	IN_PROGRESS	MEDIUM	QUALIFIED_CLIENT	2025-07-05 00:00:00	2025-11-27 00:00:00	2025-08-14 19:22:28.258	2025-08-14 23:22:24.348	cmdrpje6a0000bp9ma5my0hnj
cmeetur3h0002mhrlw6d96p6d	Highline Adventures	We Are the Perfect Place for Celebrations, Field Trips, Family Events and More.	\N	2000	https://highlineadventures.com	IN_PROGRESS	HIGH	CURRENT_CLIENT	2023-01-01 00:00:00	2028-10-16 00:00:00	2025-08-16 22:27:12.942	2025-08-16 22:27:12.942	cmdrpje6a0000bp9ma5my0hnj
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, title, description, status, priority, "startDate", "dueDate", "completedAt", "estimatedHours", "actualHours", "createdAt", "updatedAt", "projectId", "assigneeId", "categoryId", "parentId") FROM stdin;
cmduks51c0003fobab97zaaxw	Proposal Strategy 	Create a SOP for proposal strategy, and develop a data table or calendar timeline for proposal deployment within the project details. 	TODO	HIGH	\N	2025-08-09 00:00:00	\N	\N	\N	2025-08-02 18:17:50.976	2025-08-02 18:18:03.626	cmds7jju40001ys0guh0kemjx	\N	\N	\N
cmdyldx9d0002117n7n1zv1sb	Create Proposals Based on this Directory	https://solvangcc.com/people-category/recreation/	TODO	HIGH	\N	\N	\N	\N	\N	2025-08-05 13:45:52.034	2025-08-05 13:45:52.034	cmds7jju40001ys0guh0kemjx	\N	\N	\N
cmdypsxdy000010ik8qnxuaja	Documents	Not opening, downloading	TODO	URGENT	\N	\N	\N	\N	\N	2025-08-05 15:49:30.502	2025-08-05 15:49:30.502	cmds7jju40001ys0guh0kemjx	\N	\N	\N
cmdyryitx0000pnibhcqaz8pa	Update the favicon, reinstall	Insure the correct icon for app on install	TODO	MEDIUM	\N	\N	\N	\N	\N	2025-08-05 16:49:50.805	2025-08-05 16:49:50.805	cmds7jju40001ys0guh0kemjx	\N	\N	\N
cme1lmdmu0004u2jevjokgjai	Research Documentation	Research for a proposal	TODO	HIGH	\N	\N	\N	\N	\N	2025-08-07 16:15:45.031	2025-08-07 16:15:45.031	cme1lllf10003u2jeus7ks4sj	\N	\N	\N
cme1lqo0u0005u2jek0utc5qz	Mock Website	create a mock website as an example that they just cant say no to Shannon says, lets do it. 	TODO	MEDIUM	\N	\N	\N	\N	\N	2025-08-07 16:19:05.118	2025-08-07 16:19:05.118	cme1lllf10003u2jeus7ks4sj	\N	\N	\N
cmebwf0g60005adnd69vqt8b2	Backup Website		TODO	MEDIUM	\N	\N	\N	\N	\N	2025-08-14 21:15:38.887	2025-08-14 21:15:38.887	cmebo65d1000b2u2ngzqm98f9	\N	\N	\N
cmebwfham0006adndn837g3md	Update plugins and modules		TODO	MEDIUM	\N	\N	\N	\N	\N	2025-08-14 21:16:00.718	2025-08-14 21:16:00.718	cmebo65d1000b2u2ngzqm98f9	\N	\N	\N
cmebwfrs10007adndhv3q7pob	Update joomla		TODO	MEDIUM	\N	\N	\N	\N	\N	2025-08-14 21:16:14.306	2025-08-14 21:16:14.306	cmebo65d1000b2u2ngzqm98f9	\N	\N	\N
cmebwfxwx0008adndyto73aec	Update PHP		TODO	MEDIUM	\N	\N	\N	\N	\N	2025-08-14 21:16:22.258	2025-08-14 21:16:22.258	cmebo65d1000b2u2ngzqm98f9	\N	\N	\N
\.


--
-- Data for Name: time_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.time_entries (id, description, "startTime", "endTime", duration, "createdAt", "updatedAt", "userId", "taskId") FROM stdin;
\.


--
-- Data for Name: timeline_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.timeline_events (id, title, description, "eventDate", "isCompleted", "createdAt", "updatedAt", "projectId") FROM stdin;
cmdzcm4hl0005mqmdd20zusps	Proposal Created	Proposal for a CMS created, initial quote is for 4k	2025-08-05 00:00:00	t	2025-08-06 02:28:04.281	2025-08-14 18:39:51.489	cmdzbpnq90001mqmdbmdw848o
cmeac7oys0000s97l0pixayw9	Client Research	Identify 5-10 potential clients who align with your skills and services. Research their business, identify a potential need, and find the right contact person (e.g., Head of Product, CTO, Marketing Manager).	\N	f	2025-08-13 19:02:18.916	2025-08-13 19:02:18.916	cmds7jju40001ys0guh0kemjx
cmeac7oys0001s97l6vkjs2sj	Prepare First Contact	Draft a personalized email or LinkedIn message for each of the top 3-5 prospects. Reference their specific company and a problem you believe you can help them solve. Avoid generic templates.	\N	f	2025-08-13 19:02:18.916	2025-08-13 19:02:18.916	cmds7jju40001ys0guh0kemjx
cmeac7oys0002s97lit54rovl	Send Initial Outreach	Send the personalized messages you drafted. Log the outreach in a spreadsheet or your personal CRM.	\N	f	2025-08-13 19:02:18.916	2025-08-13 19:02:18.916	cmds7jju40001ys0guh0kemjx
cmeac7oys0003s97l4s3i65st	Gentle Nudge (Optional)	If you have a relevant piece of content (a blog post you wrote, a similar project in your portfolio), you can engage with the contact's content on a platform like LinkedIn. This is a soft-touch follow-up.	\N	f	2025-08-13 19:02:18.916	2025-08-13 19:02:18.916	cmds7jju40001ys0guh0kemjx
cmeac7oys0004s97l72uxgdaw	First Follow-Up	If you haven't received a response from your initial outreach, send a brief and polite follow-up email after a reasonable amount of time has passed (e.g., 3-5 business days).	\N	f	2025-08-13 19:02:18.916	2025-08-13 19:02:18.916	cmds7jju40001ys0guh0kemjx
cmeac7oys0005s97llrez9gcy	Schedule Discovery Call	The client has responded and is interested in talking. Immediately reply with your availability or a scheduling link (like Calendly) to book a 20-30 minute discovery call.	\N	f	2025-08-13 19:02:18.916	2025-08-13 19:02:18.916	cmds7jju40001ys0guh0kemjx
cmeac7oys0006s97lv9cdvl9x	Hold Discovery Call	Conduct the discovery call. Focus on listening to the client's needs, challenges, and goals. Ask clarifying questions to ensure you fully understand the scope of their problem.	\N	f	2025-08-13 19:02:18.916	2025-08-13 19:02:18.916	cmds7jju40001ys0guh0kemjx
cmeac7oys0007s97lc41tv1eb	Draft Project Proposal	Based on the discovery call, draft a detailed project proposal. Include: Your understanding of the problem, your proposed solution, project scope and deliverables, timeline and milestones, and pricing and payment terms.	\N	f	2025-08-13 19:02:18.916	2025-08-13 19:02:18.916	cmds7jju40001ys0guh0kemjx
cmeac7oys0008s97lvuwps2t3	Send Proposal	Send the proposal to the client. In the email, suggest a time to walk them through it and answer any questions.	\N	f	2025-08-13 19:02:18.916	2025-08-13 19:02:18.916	cmds7jju40001ys0guh0kemjx
cmeac7oys0009s97lkw4a7pds	Proposal Follow-Up	If you haven't heard back after a few days, send a follow-up email.	\N	f	2025-08-13 19:02:18.916	2025-08-13 19:02:18.916	cmds7jju40001ys0guh0kemjx
cmeac7oys000as97l3fgeia3z	Negotiation & Finalizing Scope	The client has reviewed the proposal and wants to move forward, possibly with some adjustments. Schedule a call to negotiate terms, adjust the scope if needed, and come to a verbal agreement.	\N	f	2025-08-13 19:02:18.916	2025-08-13 19:02:18.916	cmds7jju40001ys0guh0kemjx
cmeac7oys000bs97lmws62gw3	Prepare & Send Contract	Once all terms are agreed upon, transfer the details from the final proposal into your standard independent contractor agreement. Send it to the client for their review and signature using a service like DocuSign or HelloSign.	\N	f	2025-08-13 19:02:18.916	2025-08-13 19:02:18.916	cmds7jju40001ys0guh0kemjx
cmeac7oys000cs97lnqpzxgfd	Final Follow-Up on Contract	If the contract hasn't been signed after a couple of days, a final, friendly nudge is appropriate.	\N	f	2025-08-13 19:02:18.916	2025-08-13 19:02:18.916	cmds7jju40001ys0guh0kemjx
cmeac7oys000ds97l0g79yfvt	Contract Signed!	The client signs the contract. Send a welcome email outlining the next steps for onboarding and project kickoff.	\N	f	2025-08-13 19:02:18.916	2025-08-13 19:02:18.916	cmds7jju40001ys0guh0kemjx
cmeac7p54000es97lf43xhxps	Client Research	Identify 5-10 potential clients who align with your skills and services. Research their business, identify a potential need, and find the right contact person (e.g., Head of Product, CTO, Marketing Manager).	2025-08-01 00:00:00	t	2025-08-13 19:02:19.144	2025-08-13 22:52:55.744	cmdylqi2x0004117n64gmp1ny
cmeac7p54000fs97l36b352de	Prepare First Contact	Draft a personalized email or LinkedIn message for each of the top 3-5 prospects. Reference their specific company and a problem you believe you can help them solve. Avoid generic templates.	2025-08-08 00:00:00	t	2025-08-13 19:02:19.144	2025-08-13 22:53:08.212	cmdylqi2x0004117n64gmp1ny
cmeac7p54000gs97llvbotmf7	Send Initial Outreach	Met Quincy, dropped off a proposal	2025-08-13 00:00:00	t	2025-08-13 19:02:19.144	2025-08-13 22:53:42.235	cmdylqi2x0004117n64gmp1ny
cmeac7p54000hs97l3bzxdkp7	Gentle Nudge (Optional)	If you have a relevant piece of content (a blog post you wrote, a similar project in your portfolio), you can engage with the contact's content on a platform like LinkedIn. This is a soft-touch follow-up.	2025-08-20 00:00:00	f	2025-08-13 19:02:19.144	2025-08-13 22:53:54.034	cmdylqi2x0004117n64gmp1ny
cmeac7p54000is97lvt80mexu	First Follow-Up	If you haven't received a response from your initial outreach, send a brief and polite follow-up email after a reasonable amount of time has passed (e.g., 3-5 business days).	\N	f	2025-08-13 19:02:19.144	2025-08-13 19:02:19.144	cmdylqi2x0004117n64gmp1ny
cmeac7p54000js97lvqwiqx6g	Schedule Discovery Call	The client has responded and is interested in talking. Immediately reply with your availability or a scheduling link (like Calendly) to book a 20-30 minute discovery call.	\N	f	2025-08-13 19:02:19.144	2025-08-13 19:02:19.144	cmdylqi2x0004117n64gmp1ny
cmeac7p54000ks97lrwamlav4	Hold Discovery Call	Conduct the discovery call. Focus on listening to the client's needs, challenges, and goals. Ask clarifying questions to ensure you fully understand the scope of their problem.	\N	f	2025-08-13 19:02:19.144	2025-08-13 19:02:19.144	cmdylqi2x0004117n64gmp1ny
cmeac7p54000ls97l6313f8qj	Draft Project Proposal	Based on the discovery call, draft a detailed project proposal. Include: Your understanding of the problem, your proposed solution, project scope and deliverables, timeline and milestones, and pricing and payment terms.	\N	f	2025-08-13 19:02:19.144	2025-08-13 19:02:19.144	cmdylqi2x0004117n64gmp1ny
cmeac7p54000ms97lnrsdbv9l	Send Proposal	Send the proposal to the client. In the email, suggest a time to walk them through it and answer any questions.	\N	f	2025-08-13 19:02:19.144	2025-08-13 19:02:19.144	cmdylqi2x0004117n64gmp1ny
cmeac7p54000ns97l55sbb4va	Proposal Follow-Up	If you haven't heard back after a few days, send a follow-up email.	\N	f	2025-08-13 19:02:19.144	2025-08-13 19:02:19.144	cmdylqi2x0004117n64gmp1ny
cmeac7p54000os97l98nc1m58	Negotiation & Finalizing Scope	The client has reviewed the proposal and wants to move forward, possibly with some adjustments. Schedule a call to negotiate terms, adjust the scope if needed, and come to a verbal agreement.	\N	f	2025-08-13 19:02:19.144	2025-08-13 19:02:19.144	cmdylqi2x0004117n64gmp1ny
cmeac7p54000ps97l86rqlpxg	Prepare & Send Contract	Once all terms are agreed upon, transfer the details from the final proposal into your standard independent contractor agreement. Send it to the client for their review and signature using a service like DocuSign or HelloSign.	\N	f	2025-08-13 19:02:19.144	2025-08-13 19:02:19.144	cmdylqi2x0004117n64gmp1ny
cmeac7p54000qs97lwn4sf0ux	Final Follow-Up on Contract	If the contract hasn't been signed after a couple of days, a final, friendly nudge is appropriate.	\N	f	2025-08-13 19:02:19.144	2025-08-13 19:02:19.144	cmdylqi2x0004117n64gmp1ny
cmeac7p54000rs97lrze6anev	Contract Signed!	The client signs the contract. Send a welcome email outlining the next steps for onboarding and project kickoff.	\N	f	2025-08-13 19:02:19.144	2025-08-13 19:02:19.144	cmdylqi2x0004117n64gmp1ny
cmeac7pb6000ss97lkjvbxlaz	Client Research	Identify 5-10 potential clients who align with your skills and services. Research their business, identify a potential need, and find the right contact person (e.g., Head of Product, CTO, Marketing Manager).	2025-08-13 00:00:00	t	2025-08-13 19:02:19.362	2025-08-13 19:33:16.889	cme1lllf10003u2jeus7ks4sj
cmeac7pb6000ts97lm31u6h0l	Prepare First Contact	Draft a personalized email or LinkedIn message for each of the top 3-5 prospects. Reference their specific company and a problem you believe you can help them solve. Avoid generic templates.	2025-08-15 00:00:00	t	2025-08-13 19:02:19.362	2025-08-15 21:48:39.895	cme1lllf10003u2jeus7ks4sj
cmeac7pb6000us97lb6pwwlt4	Send Initial Outreach	Send the personalized messages you drafted. Log the outreach in a spreadsheet or your personal CRM.	2025-08-15 00:00:00	t	2025-08-13 19:02:19.362	2025-08-15 21:48:49.375	cme1lllf10003u2jeus7ks4sj
cmeac7pb6000vs97l2r3epzoo	Gentle Nudge (Optional)	If you have a relevant piece of content (a blog post you wrote, a similar project in your portfolio), you can engage with the contact's content on a platform like LinkedIn. This is a soft-touch follow-up.	2025-08-22 00:00:00	f	2025-08-13 19:02:19.362	2025-08-15 21:48:58.376	cme1lllf10003u2jeus7ks4sj
cmeac7pb6000ws97lpcw3ubd7	First Follow-Up	If you haven't received a response from your initial outreach, send a brief and polite follow-up email after a reasonable amount of time has passed (e.g., 3-5 business days).	\N	f	2025-08-13 19:02:19.362	2025-08-13 19:02:19.362	cme1lllf10003u2jeus7ks4sj
cmeac7pb6000xs97lyt5yfhry	Schedule Discovery Call	The client has responded and is interested in talking. Immediately reply with your availability or a scheduling link (like Calendly) to book a 20-30 minute discovery call.	\N	f	2025-08-13 19:02:19.362	2025-08-13 19:02:19.362	cme1lllf10003u2jeus7ks4sj
cmeac7pb6000ys97lu18gk95b	Hold Discovery Call	Conduct the discovery call. Focus on listening to the client's needs, challenges, and goals. Ask clarifying questions to ensure you fully understand the scope of their problem.	\N	f	2025-08-13 19:02:19.362	2025-08-13 19:02:19.362	cme1lllf10003u2jeus7ks4sj
cmeac7pb6000zs97laq621yif	Draft Project Proposal	Based on the discovery call, draft a detailed project proposal. Include: Your understanding of the problem, your proposed solution, project scope and deliverables, timeline and milestones, and pricing and payment terms.	\N	f	2025-08-13 19:02:19.362	2025-08-13 19:02:19.362	cme1lllf10003u2jeus7ks4sj
cmeac7pb60010s97lt0env3wo	Send Proposal	Send the proposal to the client. In the email, suggest a time to walk them through it and answer any questions.	\N	f	2025-08-13 19:02:19.362	2025-08-13 19:02:19.362	cme1lllf10003u2jeus7ks4sj
cmeac7pb60011s97lftziocs9	Proposal Follow-Up	If you haven't heard back after a few days, send a follow-up email.	\N	f	2025-08-13 19:02:19.362	2025-08-13 19:02:19.362	cme1lllf10003u2jeus7ks4sj
cmeac7pb60012s97lc0tbizpb	Negotiation & Finalizing Scope	The client has reviewed the proposal and wants to move forward, possibly with some adjustments. Schedule a call to negotiate terms, adjust the scope if needed, and come to a verbal agreement.	\N	f	2025-08-13 19:02:19.362	2025-08-13 19:02:19.362	cme1lllf10003u2jeus7ks4sj
cmeac7pb60013s97lx4el8rf6	Prepare & Send Contract	Once all terms are agreed upon, transfer the details from the final proposal into your standard independent contractor agreement. Send it to the client for their review and signature using a service like DocuSign or HelloSign.	\N	f	2025-08-13 19:02:19.362	2025-08-13 19:02:19.362	cme1lllf10003u2jeus7ks4sj
cmeac7pb60014s97l7uvur8x0	Final Follow-Up on Contract	If the contract hasn't been signed after a couple of days, a final, friendly nudge is appropriate.	\N	f	2025-08-13 19:02:19.362	2025-08-13 19:02:19.362	cme1lllf10003u2jeus7ks4sj
cmeac7pb60015s97lbgwi0g23	Contract Signed!	The client signs the contract. Send a welcome email outlining the next steps for onboarding and project kickoff.	\N	f	2025-08-13 19:02:19.362	2025-08-13 19:02:19.362	cme1lllf10003u2jeus7ks4sj
cmeac7phc0016s97lyi3smiqw	Client Research	Identify 5-10 potential clients who align with your skills and services. Research their business, identify a potential need, and find the right contact person (e.g., Head of Product, CTO, Marketing Manager).	2025-08-21 07:00:00	f	2025-08-13 19:02:19.584	2025-08-17 03:29:06.494	cme1r0jpa0001121o5lxkogg0
cmeac7phc0017s97log7irym7	Prepare First Contact	Draft a personalized email or LinkedIn message for each of the top 3-5 prospects. Reference their specific company and a problem you believe you can help them solve. Avoid generic templates.	\N	f	2025-08-13 19:02:19.584	2025-08-17 03:28:33.832	cme1r0jpa0001121o5lxkogg0
cmeac7phc0018s97lnih0zx0j	Send Initial Outreach	Send the personalized messages you drafted. Log the outreach in a spreadsheet or your personal CRM.	\N	f	2025-08-13 19:02:19.584	2025-08-17 03:28:44.041	cme1r0jpa0001121o5lxkogg0
cmeac7phc0019s97lvcp85zhv	Gentle Nudge (Optional)	If you have a relevant piece of content (a blog post you wrote, a similar project in your portfolio), you can engage with the contact's content on a platform like LinkedIn. This is a soft-touch follow-up.	\N	f	2025-08-13 19:02:19.584	2025-08-17 03:28:51.477	cme1r0jpa0001121o5lxkogg0
cmeac7phc001as97ll85ps0od	First Follow-Up	If you haven't received a response from your initial outreach, send a brief and polite follow-up email after a reasonable amount of time has passed (e.g., 3-5 business days).	\N	f	2025-08-13 19:02:19.584	2025-08-13 19:02:19.584	cme1r0jpa0001121o5lxkogg0
cmeac7phc001bs97lnbahtznb	Schedule Discovery Call	The client has responded and is interested in talking. Immediately reply with your availability or a scheduling link (like Calendly) to book a 20-30 minute discovery call.	\N	f	2025-08-13 19:02:19.584	2025-08-13 19:02:19.584	cme1r0jpa0001121o5lxkogg0
cmeac7phc001cs97lyzmych65	Hold Discovery Call	Conduct the discovery call. Focus on listening to the client's needs, challenges, and goals. Ask clarifying questions to ensure you fully understand the scope of their problem.	\N	f	2025-08-13 19:02:19.584	2025-08-13 19:02:19.584	cme1r0jpa0001121o5lxkogg0
cmeac7phc001ds97lzjeir1qp	Draft Project Proposal	Based on the discovery call, draft a detailed project proposal. Include: Your understanding of the problem, your proposed solution, project scope and deliverables, timeline and milestones, and pricing and payment terms.	\N	f	2025-08-13 19:02:19.584	2025-08-13 19:02:19.584	cme1r0jpa0001121o5lxkogg0
cmeac7phc001es97l73gf3xdc	Send Proposal	Send the proposal to the client. In the email, suggest a time to walk them through it and answer any questions.	\N	f	2025-08-13 19:02:19.584	2025-08-13 19:02:19.584	cme1r0jpa0001121o5lxkogg0
cmeac7phc001fs97lm4fc0rlp	Proposal Follow-Up	If you haven't heard back after a few days, send a follow-up email.	\N	f	2025-08-13 19:02:19.584	2025-08-13 19:02:19.584	cme1r0jpa0001121o5lxkogg0
cmeac7phc001gs97lqr3ccx2e	Negotiation & Finalizing Scope	The client has reviewed the proposal and wants to move forward, possibly with some adjustments. Schedule a call to negotiate terms, adjust the scope if needed, and come to a verbal agreement.	\N	f	2025-08-13 19:02:19.584	2025-08-13 19:02:19.584	cme1r0jpa0001121o5lxkogg0
cmeac7phc001hs97lj2atps7n	Prepare & Send Contract	Once all terms are agreed upon, transfer the details from the final proposal into your standard independent contractor agreement. Send it to the client for their review and signature using a service like DocuSign or HelloSign.	\N	f	2025-08-13 19:02:19.584	2025-08-13 19:02:19.584	cme1r0jpa0001121o5lxkogg0
cmeac7phc001is97l5zdkh0jp	Final Follow-Up on Contract	If the contract hasn't been signed after a couple of days, a final, friendly nudge is appropriate.	\N	f	2025-08-13 19:02:19.584	2025-08-13 19:02:19.584	cme1r0jpa0001121o5lxkogg0
cmeac7phc001js97l4tqcee6s	Contract Signed!	The client signs the contract. Send a welcome email outlining the next steps for onboarding and project kickoff.	\N	f	2025-08-13 19:02:19.584	2025-08-13 19:02:19.584	cme1r0jpa0001121o5lxkogg0
cmeac7pnz001ks97lwdullimm	Client Research	Identify 5-10 potential clients who align with your skills and services. Research their business, identify a potential need, and find the right contact person (e.g., Head of Product, CTO, Marketing Manager).	\N	f	2025-08-13 19:02:19.824	2025-08-13 19:02:19.824	cme9fgkid0003sq1vkpv8ecxg
cmeac7pnz001ls97l2zhsmhmq	Prepare First Contact	Draft a personalized email or LinkedIn message for each of the top 3-5 prospects. Reference their specific company and a problem you believe you can help them solve. Avoid generic templates.	\N	f	2025-08-13 19:02:19.824	2025-08-13 19:02:19.824	cme9fgkid0003sq1vkpv8ecxg
cmeac7pnz001ms97latq04785	Send Initial Outreach	Send the personalized messages you drafted. Log the outreach in a spreadsheet or your personal CRM.	\N	f	2025-08-13 19:02:19.824	2025-08-13 19:02:19.824	cme9fgkid0003sq1vkpv8ecxg
cmeac7pnz001ns97l1tg9ahu8	Gentle Nudge (Optional)	If you have a relevant piece of content (a blog post you wrote, a similar project in your portfolio), you can engage with the contact's content on a platform like LinkedIn. This is a soft-touch follow-up.	\N	f	2025-08-13 19:02:19.824	2025-08-13 19:02:19.824	cme9fgkid0003sq1vkpv8ecxg
cmeac7pnz001os97l3zb2kmw3	First Follow-Up	If you haven't received a response from your initial outreach, send a brief and polite follow-up email after a reasonable amount of time has passed (e.g., 3-5 business days).	\N	f	2025-08-13 19:02:19.824	2025-08-13 19:02:19.824	cme9fgkid0003sq1vkpv8ecxg
cmeac7pnz001ps97l2dce3q66	Schedule Discovery Call	The client has responded and is interested in talking. Immediately reply with your availability or a scheduling link (like Calendly) to book a 20-30 minute discovery call.	\N	f	2025-08-13 19:02:19.824	2025-08-13 19:02:19.824	cme9fgkid0003sq1vkpv8ecxg
cmeac7pnz001qs97ldsbsze80	Hold Discovery Call	Conduct the discovery call. Focus on listening to the client's needs, challenges, and goals. Ask clarifying questions to ensure you fully understand the scope of their problem.	\N	f	2025-08-13 19:02:19.824	2025-08-13 19:02:19.824	cme9fgkid0003sq1vkpv8ecxg
cmeac7pnz001rs97lccaob15x	Draft Project Proposal	Based on the discovery call, draft a detailed project proposal. Include: Your understanding of the problem, your proposed solution, project scope and deliverables, timeline and milestones, and pricing and payment terms.	\N	f	2025-08-13 19:02:19.824	2025-08-13 19:02:19.824	cme9fgkid0003sq1vkpv8ecxg
cmeac7pnz001ss97ll9tpupzc	Send Proposal	Send the proposal to the client. In the email, suggest a time to walk them through it and answer any questions.	\N	f	2025-08-13 19:02:19.824	2025-08-13 19:02:19.824	cme9fgkid0003sq1vkpv8ecxg
cmeac7pnz001ts97lekxclr6s	Proposal Follow-Up	If you haven't heard back after a few days, send a follow-up email.	\N	f	2025-08-13 19:02:19.824	2025-08-13 19:02:19.824	cme9fgkid0003sq1vkpv8ecxg
cmeac7po0001us97l7wpp1aks	Negotiation & Finalizing Scope	The client has reviewed the proposal and wants to move forward, possibly with some adjustments. Schedule a call to negotiate terms, adjust the scope if needed, and come to a verbal agreement.	\N	f	2025-08-13 19:02:19.824	2025-08-13 19:02:19.824	cme9fgkid0003sq1vkpv8ecxg
cmeac7po0001vs97l1fyimafc	Prepare & Send Contract	Once all terms are agreed upon, transfer the details from the final proposal into your standard independent contractor agreement. Send it to the client for their review and signature using a service like DocuSign or HelloSign.	\N	f	2025-08-13 19:02:19.824	2025-08-13 19:02:19.824	cme9fgkid0003sq1vkpv8ecxg
cmeac7po0001ws97lltxge1xe	Final Follow-Up on Contract	If the contract hasn't been signed after a couple of days, a final, friendly nudge is appropriate.	\N	f	2025-08-13 19:02:19.824	2025-08-13 19:02:19.824	cme9fgkid0003sq1vkpv8ecxg
cmeac7po0001xs97lcs3p1af3	Contract Signed!	The client signs the contract. Send a welcome email outlining the next steps for onboarding and project kickoff.	\N	f	2025-08-13 19:02:19.824	2025-08-13 19:02:19.824	cme9fgkid0003sq1vkpv8ecxg
cmeac7pu4001ys97lvwwk5r3n	Client Research	Identify 5-10 potential clients who align with your skills and services. Research their business, identify a potential need, and find the right contact person (e.g., Head of Product, CTO, Marketing Manager).	\N	t	2025-08-13 19:02:20.044	2025-08-18 00:29:01.285	cme9fjjxe0005sq1v9tc6afgw
cmeac7pu4001zs97ldrkp3605	Prepare First Contact	Draft a personalized email or LinkedIn message for each of the top 3-5 prospects. Reference their specific company and a problem you believe you can help them solve. Avoid generic templates.	2025-08-19 07:00:00	f	2025-08-13 19:02:20.044	2025-08-18 00:29:16.427	cme9fjjxe0005sq1v9tc6afgw
cmeac7pu40020s97lf4kjuo6o	Send Initial Outreach	Send the personalized messages you drafted. Log the outreach in a spreadsheet or your personal CRM.	\N	f	2025-08-13 19:02:20.044	2025-08-13 19:02:20.044	cme9fjjxe0005sq1v9tc6afgw
cmeac7pu40021s97lssenqkxh	Gentle Nudge (Optional)	If you have a relevant piece of content (a blog post you wrote, a similar project in your portfolio), you can engage with the contact's content on a platform like LinkedIn. This is a soft-touch follow-up.	\N	f	2025-08-13 19:02:20.044	2025-08-13 19:02:20.044	cme9fjjxe0005sq1v9tc6afgw
cmeac7pu40022s97lvod8q13g	First Follow-Up	If you haven't received a response from your initial outreach, send a brief and polite follow-up email after a reasonable amount of time has passed (e.g., 3-5 business days).	\N	f	2025-08-13 19:02:20.044	2025-08-13 19:02:20.044	cme9fjjxe0005sq1v9tc6afgw
cmeac7pu40023s97lve8d6o6z	Schedule Discovery Call	The client has responded and is interested in talking. Immediately reply with your availability or a scheduling link (like Calendly) to book a 20-30 minute discovery call.	\N	f	2025-08-13 19:02:20.044	2025-08-13 19:02:20.044	cme9fjjxe0005sq1v9tc6afgw
cmeac7pu40024s97lariwri1t	Hold Discovery Call	Conduct the discovery call. Focus on listening to the client's needs, challenges, and goals. Ask clarifying questions to ensure you fully understand the scope of their problem.	\N	f	2025-08-13 19:02:20.044	2025-08-13 19:02:20.044	cme9fjjxe0005sq1v9tc6afgw
cmeac7pu40025s97lhyrm0cgm	Draft Project Proposal	Based on the discovery call, draft a detailed project proposal. Include: Your understanding of the problem, your proposed solution, project scope and deliverables, timeline and milestones, and pricing and payment terms.	\N	f	2025-08-13 19:02:20.044	2025-08-13 19:02:20.044	cme9fjjxe0005sq1v9tc6afgw
cmeac7pu40026s97lcd9hwq9f	Send Proposal	Send the proposal to the client. In the email, suggest a time to walk them through it and answer any questions.	\N	f	2025-08-13 19:02:20.044	2025-08-13 19:02:20.044	cme9fjjxe0005sq1v9tc6afgw
cmeac7pu40027s97lghuvdggy	Proposal Follow-Up	If you haven't heard back after a few days, send a follow-up email.	\N	f	2025-08-13 19:02:20.044	2025-08-13 19:02:20.044	cme9fjjxe0005sq1v9tc6afgw
cmeac7pu40028s97l9pc1yf3q	Negotiation & Finalizing Scope	The client has reviewed the proposal and wants to move forward, possibly with some adjustments. Schedule a call to negotiate terms, adjust the scope if needed, and come to a verbal agreement.	\N	f	2025-08-13 19:02:20.044	2025-08-13 19:02:20.044	cme9fjjxe0005sq1v9tc6afgw
cmeac7qtc003rs97l9ayz5sjf	Proposal Follow-Up	If you haven't heard back after a few days, send a follow-up email.	\N	f	2025-08-13 19:02:21.312	2025-08-13 19:02:21.312	cme9fwzmc000dsq1vss9gprc7
cmeac7pu40029s97lq4blpicv	Prepare & Send Contract	Once all terms are agreed upon, transfer the details from the final proposal into your standard independent contractor agreement. Send it to the client for their review and signature using a service like DocuSign or HelloSign.	\N	f	2025-08-13 19:02:20.044	2025-08-13 19:02:20.044	cme9fjjxe0005sq1v9tc6afgw
cmeac7pu4002as97ld40kauwy	Final Follow-Up on Contract	If the contract hasn't been signed after a couple of days, a final, friendly nudge is appropriate.	\N	f	2025-08-13 19:02:20.044	2025-08-13 19:02:20.044	cme9fjjxe0005sq1v9tc6afgw
cmeac7pu4002bs97lq5lbfnp6	Contract Signed!	The client signs the contract. Send a welcome email outlining the next steps for onboarding and project kickoff.	\N	f	2025-08-13 19:02:20.044	2025-08-13 19:02:20.044	cme9fjjxe0005sq1v9tc6afgw
cmeac7q0h002cs97llaz074o9	Client Research	Identify 5-10 potential clients who align with your skills and services. Research their business, identify a potential need, and find the right contact person (e.g., Head of Product, CTO, Marketing Manager).	\N	f	2025-08-13 19:02:20.274	2025-08-13 19:02:20.274	cme9flx820007sq1vnweuzv06
cmeac7q0h002ds97lfobdtt03	Prepare First Contact	Draft a personalized email or LinkedIn message for each of the top 3-5 prospects. Reference their specific company and a problem you believe you can help them solve. Avoid generic templates.	\N	f	2025-08-13 19:02:20.274	2025-08-13 19:02:20.274	cme9flx820007sq1vnweuzv06
cmeac7q0h002es97l9bfk757l	Send Initial Outreach	Send the personalized messages you drafted. Log the outreach in a spreadsheet or your personal CRM.	\N	f	2025-08-13 19:02:20.274	2025-08-13 19:02:20.274	cme9flx820007sq1vnweuzv06
cmeac7q0h002fs97ly0w04hvr	Gentle Nudge (Optional)	If you have a relevant piece of content (a blog post you wrote, a similar project in your portfolio), you can engage with the contact's content on a platform like LinkedIn. This is a soft-touch follow-up.	\N	f	2025-08-13 19:02:20.274	2025-08-13 19:02:20.274	cme9flx820007sq1vnweuzv06
cmeac7q0i002gs97l4bgrtp8w	First Follow-Up	If you haven't received a response from your initial outreach, send a brief and polite follow-up email after a reasonable amount of time has passed (e.g., 3-5 business days).	\N	f	2025-08-13 19:02:20.274	2025-08-13 19:02:20.274	cme9flx820007sq1vnweuzv06
cmeac7q0i002hs97lmqtk7pbp	Schedule Discovery Call	The client has responded and is interested in talking. Immediately reply with your availability or a scheduling link (like Calendly) to book a 20-30 minute discovery call.	\N	f	2025-08-13 19:02:20.274	2025-08-13 19:02:20.274	cme9flx820007sq1vnweuzv06
cmeac7q0i002is97lnqvsiyml	Hold Discovery Call	Conduct the discovery call. Focus on listening to the client's needs, challenges, and goals. Ask clarifying questions to ensure you fully understand the scope of their problem.	\N	f	2025-08-13 19:02:20.274	2025-08-13 19:02:20.274	cme9flx820007sq1vnweuzv06
cmeac7q0i002js97lpo2mg0rl	Draft Project Proposal	Based on the discovery call, draft a detailed project proposal. Include: Your understanding of the problem, your proposed solution, project scope and deliverables, timeline and milestones, and pricing and payment terms.	\N	f	2025-08-13 19:02:20.274	2025-08-13 19:02:20.274	cme9flx820007sq1vnweuzv06
cmeac7q0i002ks97lwpfwuz64	Send Proposal	Send the proposal to the client. In the email, suggest a time to walk them through it and answer any questions.	\N	f	2025-08-13 19:02:20.274	2025-08-13 19:02:20.274	cme9flx820007sq1vnweuzv06
cmeac7q0i002ls97lt3tzl2am	Proposal Follow-Up	If you haven't heard back after a few days, send a follow-up email.	\N	f	2025-08-13 19:02:20.274	2025-08-13 19:02:20.274	cme9flx820007sq1vnweuzv06
cmeac7q0i002ms97l3tizpl2p	Negotiation & Finalizing Scope	The client has reviewed the proposal and wants to move forward, possibly with some adjustments. Schedule a call to negotiate terms, adjust the scope if needed, and come to a verbal agreement.	\N	f	2025-08-13 19:02:20.274	2025-08-13 19:02:20.274	cme9flx820007sq1vnweuzv06
cmeac7q0i002ns97lwwqdiph1	Prepare & Send Contract	Once all terms are agreed upon, transfer the details from the final proposal into your standard independent contractor agreement. Send it to the client for their review and signature using a service like DocuSign or HelloSign.	\N	f	2025-08-13 19:02:20.274	2025-08-13 19:02:20.274	cme9flx820007sq1vnweuzv06
cmeac7q0i002os97lpw77o9xg	Final Follow-Up on Contract	If the contract hasn't been signed after a couple of days, a final, friendly nudge is appropriate.	\N	f	2025-08-13 19:02:20.274	2025-08-13 19:02:20.274	cme9flx820007sq1vnweuzv06
cmeac7q0i002ps97l5wh5v3fr	Contract Signed!	The client signs the contract. Send a welcome email outlining the next steps for onboarding and project kickoff.	\N	f	2025-08-13 19:02:20.274	2025-08-13 19:02:20.274	cme9flx820007sq1vnweuzv06
cmeac7qer002qs97lm2z4ztoo	Client Research	Identify 5-10 potential clients who align with your skills and services. Research their business, identify a potential need, and find the right contact person (e.g., Head of Product, CTO, Marketing Manager).	\N	f	2025-08-13 19:02:20.788	2025-08-13 19:02:20.788	cme9fmybc0009sq1vov6h2c4h
cmeac7qer002rs97l9alh4ujw	Prepare First Contact	Draft a personalized email or LinkedIn message for each of the top 3-5 prospects. Reference their specific company and a problem you believe you can help them solve. Avoid generic templates.	\N	f	2025-08-13 19:02:20.788	2025-08-13 19:02:20.788	cme9fmybc0009sq1vov6h2c4h
cmeac7qer002ss97lywq868h3	Send Initial Outreach	Send the personalized messages you drafted. Log the outreach in a spreadsheet or your personal CRM.	\N	f	2025-08-13 19:02:20.788	2025-08-13 19:02:20.788	cme9fmybc0009sq1vov6h2c4h
cmeac7qer002ts97lp4pucqoj	Gentle Nudge (Optional)	If you have a relevant piece of content (a blog post you wrote, a similar project in your portfolio), you can engage with the contact's content on a platform like LinkedIn. This is a soft-touch follow-up.	\N	f	2025-08-13 19:02:20.788	2025-08-13 19:02:20.788	cme9fmybc0009sq1vov6h2c4h
cmeac7qer002us97lvj8qdaw4	First Follow-Up	If you haven't received a response from your initial outreach, send a brief and polite follow-up email after a reasonable amount of time has passed (e.g., 3-5 business days).	\N	f	2025-08-13 19:02:20.788	2025-08-13 19:02:20.788	cme9fmybc0009sq1vov6h2c4h
cmeac7qer002vs97luesq9pzv	Schedule Discovery Call	The client has responded and is interested in talking. Immediately reply with your availability or a scheduling link (like Calendly) to book a 20-30 minute discovery call.	\N	f	2025-08-13 19:02:20.788	2025-08-13 19:02:20.788	cme9fmybc0009sq1vov6h2c4h
cmeac7qer002ws97ls6uye88y	Hold Discovery Call	Conduct the discovery call. Focus on listening to the client's needs, challenges, and goals. Ask clarifying questions to ensure you fully understand the scope of their problem.	\N	f	2025-08-13 19:02:20.788	2025-08-13 19:02:20.788	cme9fmybc0009sq1vov6h2c4h
cmeac7qer002xs97lkp7wtick	Draft Project Proposal	Based on the discovery call, draft a detailed project proposal. Include: Your understanding of the problem, your proposed solution, project scope and deliverables, timeline and milestones, and pricing and payment terms.	\N	f	2025-08-13 19:02:20.788	2025-08-13 19:02:20.788	cme9fmybc0009sq1vov6h2c4h
cmeac7qer002ys97l5p33d6py	Send Proposal	Send the proposal to the client. In the email, suggest a time to walk them through it and answer any questions.	\N	f	2025-08-13 19:02:20.788	2025-08-13 19:02:20.788	cme9fmybc0009sq1vov6h2c4h
cmeac7qer002zs97lfxbzyvsu	Proposal Follow-Up	If you haven't heard back after a few days, send a follow-up email.	\N	f	2025-08-13 19:02:20.788	2025-08-13 19:02:20.788	cme9fmybc0009sq1vov6h2c4h
cmeac7sp2004js97lu32tcc4i	Proposal Follow-Up	If you haven't heard back after a few days, send a follow-up email.	\N	f	2025-08-13 19:02:23.75	2025-08-13 19:02:23.75	cme9g3vre000hsq1vwppvr7p4
cmeac7qer0030s97lnvxocjva	Negotiation & Finalizing Scope	The client has reviewed the proposal and wants to move forward, possibly with some adjustments. Schedule a call to negotiate terms, adjust the scope if needed, and come to a verbal agreement.	\N	f	2025-08-13 19:02:20.788	2025-08-13 19:02:20.788	cme9fmybc0009sq1vov6h2c4h
cmeac7qer0031s97ld9rm662g	Prepare & Send Contract	Once all terms are agreed upon, transfer the details from the final proposal into your standard independent contractor agreement. Send it to the client for their review and signature using a service like DocuSign or HelloSign.	\N	f	2025-08-13 19:02:20.788	2025-08-13 19:02:20.788	cme9fmybc0009sq1vov6h2c4h
cmeac7qer0032s97lsxd4p5jk	Final Follow-Up on Contract	If the contract hasn't been signed after a couple of days, a final, friendly nudge is appropriate.	\N	f	2025-08-13 19:02:20.788	2025-08-13 19:02:20.788	cme9fmybc0009sq1vov6h2c4h
cmeac7qer0033s97lhq2o6aqu	Contract Signed!	The client signs the contract. Send a welcome email outlining the next steps for onboarding and project kickoff.	\N	f	2025-08-13 19:02:20.788	2025-08-13 19:02:20.788	cme9fmybc0009sq1vov6h2c4h
cmeac7qlj0034s97lzpj9wg67	Client Research	Identify 5-10 potential clients who align with your skills and services. Research their business, identify a potential need, and find the right contact person (e.g., Head of Product, CTO, Marketing Manager).	2025-08-14 00:00:00	t	2025-08-13 19:02:21.031	2025-08-14 17:33:43.91	cme9fpkfv000bsq1vs271m1hn
cmeac7qlj0035s97l9ipreskq	Prepare First Contact	Draft a personalized email or LinkedIn message for each of the top 3-5 prospects. Reference their specific company and a problem you believe you can help them solve. Avoid generic templates.	2025-08-15 07:00:00	t	2025-08-13 19:02:21.031	2025-08-16 15:23:33.878	cme9fpkfv000bsq1vs271m1hn
cmeac7qlj0036s97lrzlt7frb	Send Initial Outreach	Send the personalized messages you drafted. Log the outreach in a spreadsheet or your personal CRM.	2025-08-16 07:00:00	t	2025-08-13 19:02:21.031	2025-08-17 02:32:37.026	cme9fpkfv000bsq1vs271m1hn
cmeac7qlj0037s97l54n9f38l	Gentle Nudge (Optional)	If you have a relevant piece of content (a blog post you wrote, a similar project in your portfolio), you can engage with the contact's content on a platform like LinkedIn. This is a soft-touch follow-up.	2025-08-21 07:00:00	f	2025-08-13 19:02:21.031	2025-08-17 03:30:06.026	cme9fpkfv000bsq1vs271m1hn
cmeac7qlj0038s97lya1zryg8	First Follow-Up	If you haven't received a response from your initial outreach, send a brief and polite follow-up email after a reasonable amount of time has passed (e.g., 3-5 business days).	\N	f	2025-08-13 19:02:21.031	2025-08-13 19:02:21.031	cme9fpkfv000bsq1vs271m1hn
cmeac7qlj0039s97lu3g5th90	Schedule Discovery Call	The client has responded and is interested in talking. Immediately reply with your availability or a scheduling link (like Calendly) to book a 20-30 minute discovery call.	\N	f	2025-08-13 19:02:21.031	2025-08-13 19:02:21.031	cme9fpkfv000bsq1vs271m1hn
cmeac7qlj003as97lsvni8glt	Hold Discovery Call	Conduct the discovery call. Focus on listening to the client's needs, challenges, and goals. Ask clarifying questions to ensure you fully understand the scope of their problem.	\N	f	2025-08-13 19:02:21.031	2025-08-13 19:02:21.031	cme9fpkfv000bsq1vs271m1hn
cmeac7qlj003bs97ltvvro8d4	Draft Project Proposal	Based on the discovery call, draft a detailed project proposal. Include: Your understanding of the problem, your proposed solution, project scope and deliverables, timeline and milestones, and pricing and payment terms.	\N	f	2025-08-13 19:02:21.031	2025-08-13 19:02:21.031	cme9fpkfv000bsq1vs271m1hn
cmeac7qlj003cs97lv95ot300	Send Proposal	Send the proposal to the client. In the email, suggest a time to walk them through it and answer any questions.	\N	f	2025-08-13 19:02:21.031	2025-08-13 19:02:21.031	cme9fpkfv000bsq1vs271m1hn
cmeac7qlj003ds97lgo236puu	Proposal Follow-Up	If you haven't heard back after a few days, send a follow-up email.	\N	f	2025-08-13 19:02:21.031	2025-08-13 19:02:21.031	cme9fpkfv000bsq1vs271m1hn
cmeac7qlj003es97l2dv90bh9	Negotiation & Finalizing Scope	The client has reviewed the proposal and wants to move forward, possibly with some adjustments. Schedule a call to negotiate terms, adjust the scope if needed, and come to a verbal agreement.	\N	f	2025-08-13 19:02:21.031	2025-08-13 19:02:21.031	cme9fpkfv000bsq1vs271m1hn
cmeac7qlj003fs97lapjsxwjy	Prepare & Send Contract	Once all terms are agreed upon, transfer the details from the final proposal into your standard independent contractor agreement. Send it to the client for their review and signature using a service like DocuSign or HelloSign.	\N	f	2025-08-13 19:02:21.031	2025-08-13 19:02:21.031	cme9fpkfv000bsq1vs271m1hn
cmeac7qlj003gs97lqy3kmthh	Final Follow-Up on Contract	If the contract hasn't been signed after a couple of days, a final, friendly nudge is appropriate.	\N	f	2025-08-13 19:02:21.031	2025-08-13 19:02:21.031	cme9fpkfv000bsq1vs271m1hn
cmeac7qlj003hs97l99a2yrun	Contract Signed!	The client signs the contract. Send a welcome email outlining the next steps for onboarding and project kickoff.	\N	f	2025-08-13 19:02:21.031	2025-08-13 19:02:21.031	cme9fpkfv000bsq1vs271m1hn
cmeac7qtc003is97ly5hqk3q3	Client Research	Identify 5-10 potential clients who align with your skills and services. Research their business, identify a potential need, and find the right contact person (e.g., Head of Product, CTO, Marketing Manager).	\N	f	2025-08-13 19:02:21.312	2025-08-13 19:02:21.312	cme9fwzmc000dsq1vss9gprc7
cmeac7qtc003js97lbgls12a9	Prepare First Contact	Draft a personalized email or LinkedIn message for each of the top 3-5 prospects. Reference their specific company and a problem you believe you can help them solve. Avoid generic templates.	\N	f	2025-08-13 19:02:21.312	2025-08-13 19:02:21.312	cme9fwzmc000dsq1vss9gprc7
cmeac7qtc003ks97liwnydxmv	Send Initial Outreach	Send the personalized messages you drafted. Log the outreach in a spreadsheet or your personal CRM.	\N	f	2025-08-13 19:02:21.312	2025-08-13 19:02:21.312	cme9fwzmc000dsq1vss9gprc7
cmeac7qtc003ls97l3t6dbrbm	Gentle Nudge (Optional)	If you have a relevant piece of content (a blog post you wrote, a similar project in your portfolio), you can engage with the contact's content on a platform like LinkedIn. This is a soft-touch follow-up.	\N	f	2025-08-13 19:02:21.312	2025-08-13 19:02:21.312	cme9fwzmc000dsq1vss9gprc7
cmeac7qtc003ms97lqz3lefdp	First Follow-Up	If you haven't received a response from your initial outreach, send a brief and polite follow-up email after a reasonable amount of time has passed (e.g., 3-5 business days).	\N	f	2025-08-13 19:02:21.312	2025-08-13 19:02:21.312	cme9fwzmc000dsq1vss9gprc7
cmeac7qtc003ns97lz9qv2s37	Schedule Discovery Call	The client has responded and is interested in talking. Immediately reply with your availability or a scheduling link (like Calendly) to book a 20-30 minute discovery call.	\N	f	2025-08-13 19:02:21.312	2025-08-13 19:02:21.312	cme9fwzmc000dsq1vss9gprc7
cmeac7qtc003os97li656xkzo	Hold Discovery Call	Conduct the discovery call. Focus on listening to the client's needs, challenges, and goals. Ask clarifying questions to ensure you fully understand the scope of their problem.	\N	f	2025-08-13 19:02:21.312	2025-08-13 19:02:21.312	cme9fwzmc000dsq1vss9gprc7
cmeac7qtc003ps97l7jklmbqr	Draft Project Proposal	Based on the discovery call, draft a detailed project proposal. Include: Your understanding of the problem, your proposed solution, project scope and deliverables, timeline and milestones, and pricing and payment terms.	\N	f	2025-08-13 19:02:21.312	2025-08-13 19:02:21.312	cme9fwzmc000dsq1vss9gprc7
cmeac7qtc003qs97ladwsibek	Send Proposal	Send the proposal to the client. In the email, suggest a time to walk them through it and answer any questions.	\N	f	2025-08-13 19:02:21.312	2025-08-13 19:02:21.312	cme9fwzmc000dsq1vss9gprc7
cmeac7qtc003ss97luigncnm9	Negotiation & Finalizing Scope	The client has reviewed the proposal and wants to move forward, possibly with some adjustments. Schedule a call to negotiate terms, adjust the scope if needed, and come to a verbal agreement.	\N	f	2025-08-13 19:02:21.312	2025-08-13 19:02:21.312	cme9fwzmc000dsq1vss9gprc7
cmeac7qtc003ts97lvk8vsx2v	Prepare & Send Contract	Once all terms are agreed upon, transfer the details from the final proposal into your standard independent contractor agreement. Send it to the client for their review and signature using a service like DocuSign or HelloSign.	\N	f	2025-08-13 19:02:21.312	2025-08-13 19:02:21.312	cme9fwzmc000dsq1vss9gprc7
cmeac7qtc003us97l3o8kjp9e	Final Follow-Up on Contract	If the contract hasn't been signed after a couple of days, a final, friendly nudge is appropriate.	\N	f	2025-08-13 19:02:21.312	2025-08-13 19:02:21.312	cme9fwzmc000dsq1vss9gprc7
cmeac7qtc003vs97ls7hq6va4	Contract Signed!	The client signs the contract. Send a welcome email outlining the next steps for onboarding and project kickoff.	\N	f	2025-08-13 19:02:21.312	2025-08-13 19:02:21.312	cme9fwzmc000dsq1vss9gprc7
cmeac7rzb003ws97lwxlb3xjn	Client Research	Identify 5-10 potential clients who align with your skills and services. Research their business, identify a potential need, and find the right contact person (e.g., Head of Product, CTO, Marketing Manager).	2025-08-13 00:00:00	t	2025-08-13 19:02:22.823	2025-08-14 20:21:39.297	cme9fynq0000fsq1vcn61v87r
cmeac7rzb003xs97lflqcukd0	Prepare First Contact	Draft a personalized email or LinkedIn message for each of the top 3-5 prospects. Reference their specific company and a problem you believe you can help them solve. Avoid generic templates.	2025-08-16 07:00:00	t	2025-08-13 19:02:22.823	2025-08-16 15:22:34.186	cme9fynq0000fsq1vcn61v87r
cmeac7rzb003ys97lta41n1fj	Send Initial Outreach	Send the personalized messages you drafted. Log the outreach in a spreadsheet or your personal CRM.	2025-08-17 07:00:00	f	2025-08-13 19:02:22.823	2025-08-16 15:23:03.028	cme9fynq0000fsq1vcn61v87r
cmeac7rzb003zs97l0d2jegzx	Gentle Nudge (Optional)	If you have a relevant piece of content (a blog post you wrote, a similar project in your portfolio), you can engage with the contact's content on a platform like LinkedIn. This is a soft-touch follow-up.	\N	f	2025-08-13 19:02:22.823	2025-08-13 19:02:22.823	cme9fynq0000fsq1vcn61v87r
cmeac7rzb0040s97lkov4xzo2	First Follow-Up	If you haven't received a response from your initial outreach, send a brief and polite follow-up email after a reasonable amount of time has passed (e.g., 3-5 business days).	\N	f	2025-08-13 19:02:22.823	2025-08-13 19:02:22.823	cme9fynq0000fsq1vcn61v87r
cmeac7rzb0041s97l2zmybz5a	Schedule Discovery Call	The client has responded and is interested in talking. Immediately reply with your availability or a scheduling link (like Calendly) to book a 20-30 minute discovery call.	\N	f	2025-08-13 19:02:22.823	2025-08-13 19:02:22.823	cme9fynq0000fsq1vcn61v87r
cmeac7rzb0042s97l5ih5zlpv	Hold Discovery Call	Conduct the discovery call. Focus on listening to the client's needs, challenges, and goals. Ask clarifying questions to ensure you fully understand the scope of their problem.	\N	f	2025-08-13 19:02:22.823	2025-08-13 19:02:22.823	cme9fynq0000fsq1vcn61v87r
cmeac7rzb0043s97lbtwla6s8	Draft Project Proposal	Based on the discovery call, draft a detailed project proposal. Include: Your understanding of the problem, your proposed solution, project scope and deliverables, timeline and milestones, and pricing and payment terms.	\N	f	2025-08-13 19:02:22.823	2025-08-13 19:02:22.823	cme9fynq0000fsq1vcn61v87r
cmeac7rzb0044s97lzwra1sbg	Send Proposal	Send the proposal to the client. In the email, suggest a time to walk them through it and answer any questions.	\N	f	2025-08-13 19:02:22.823	2025-08-13 19:02:22.823	cme9fynq0000fsq1vcn61v87r
cmeac7rzb0045s97lrywoipss	Proposal Follow-Up	If you haven't heard back after a few days, send a follow-up email.	\N	f	2025-08-13 19:02:22.823	2025-08-13 19:02:22.823	cme9fynq0000fsq1vcn61v87r
cmeac7rzb0046s97lxtr39le6	Negotiation & Finalizing Scope	The client has reviewed the proposal and wants to move forward, possibly with some adjustments. Schedule a call to negotiate terms, adjust the scope if needed, and come to a verbal agreement.	\N	f	2025-08-13 19:02:22.823	2025-08-13 19:02:22.823	cme9fynq0000fsq1vcn61v87r
cmeac7rzb0047s97l153mvn99	Prepare & Send Contract	Once all terms are agreed upon, transfer the details from the final proposal into your standard independent contractor agreement. Send it to the client for their review and signature using a service like DocuSign or HelloSign.	\N	f	2025-08-13 19:02:22.823	2025-08-13 19:02:22.823	cme9fynq0000fsq1vcn61v87r
cmeac7rzb0048s97l1uxdk1ty	Final Follow-Up on Contract	If the contract hasn't been signed after a couple of days, a final, friendly nudge is appropriate.	\N	f	2025-08-13 19:02:22.823	2025-08-13 19:02:22.823	cme9fynq0000fsq1vcn61v87r
cmeac7rzb0049s97lopbccubm	Contract Signed!	The client signs the contract. Send a welcome email outlining the next steps for onboarding and project kickoff.	\N	f	2025-08-13 19:02:22.823	2025-08-13 19:02:22.823	cme9fynq0000fsq1vcn61v87r
cmeac7sp2004as97lp08dy0dr	Client Research	Identify 5-10 potential clients who align with your skills and services. Research their business, identify a potential need, and find the right contact person (e.g., Head of Product, CTO, Marketing Manager).	\N	f	2025-08-13 19:02:23.75	2025-08-13 19:02:23.75	cme9g3vre000hsq1vwppvr7p4
cmeac7sp2004bs97l5p79llqs	Prepare First Contact	Draft a personalized email or LinkedIn message for each of the top 3-5 prospects. Reference their specific company and a problem you believe you can help them solve. Avoid generic templates.	\N	f	2025-08-13 19:02:23.75	2025-08-13 19:02:23.75	cme9g3vre000hsq1vwppvr7p4
cmeac7sp2004cs97l3pix5y1g	Send Initial Outreach	Send the personalized messages you drafted. Log the outreach in a spreadsheet or your personal CRM.	\N	f	2025-08-13 19:02:23.75	2025-08-13 19:02:23.75	cme9g3vre000hsq1vwppvr7p4
cmeac7sp2004ds97lle7c1hzj	Gentle Nudge (Optional)	If you have a relevant piece of content (a blog post you wrote, a similar project in your portfolio), you can engage with the contact's content on a platform like LinkedIn. This is a soft-touch follow-up.	\N	f	2025-08-13 19:02:23.75	2025-08-13 19:02:23.75	cme9g3vre000hsq1vwppvr7p4
cmeac7sp2004es97ln78yfrty	First Follow-Up	If you haven't received a response from your initial outreach, send a brief and polite follow-up email after a reasonable amount of time has passed (e.g., 3-5 business days).	\N	f	2025-08-13 19:02:23.75	2025-08-13 19:02:23.75	cme9g3vre000hsq1vwppvr7p4
cmeac7sp2004fs97lceq116cy	Schedule Discovery Call	The client has responded and is interested in talking. Immediately reply with your availability or a scheduling link (like Calendly) to book a 20-30 minute discovery call.	\N	f	2025-08-13 19:02:23.75	2025-08-13 19:02:23.75	cme9g3vre000hsq1vwppvr7p4
cmeac7sp2004gs97l0p8lgmhg	Hold Discovery Call	Conduct the discovery call. Focus on listening to the client's needs, challenges, and goals. Ask clarifying questions to ensure you fully understand the scope of their problem.	\N	f	2025-08-13 19:02:23.75	2025-08-13 19:02:23.75	cme9g3vre000hsq1vwppvr7p4
cmeac7sp2004hs97lsycncgxk	Draft Project Proposal	Based on the discovery call, draft a detailed project proposal. Include: Your understanding of the problem, your proposed solution, project scope and deliverables, timeline and milestones, and pricing and payment terms.	\N	f	2025-08-13 19:02:23.75	2025-08-13 19:02:23.75	cme9g3vre000hsq1vwppvr7p4
cmeac7sp2004is97lac5o8x73	Send Proposal	Send the proposal to the client. In the email, suggest a time to walk them through it and answer any questions.	\N	f	2025-08-13 19:02:23.75	2025-08-13 19:02:23.75	cme9g3vre000hsq1vwppvr7p4
cmeac7sp2004ks97lie40nh53	Negotiation & Finalizing Scope	The client has reviewed the proposal and wants to move forward, possibly with some adjustments. Schedule a call to negotiate terms, adjust the scope if needed, and come to a verbal agreement.	\N	f	2025-08-13 19:02:23.75	2025-08-13 19:02:23.75	cme9g3vre000hsq1vwppvr7p4
cmeac7sp2004ls97lvlybl70h	Prepare & Send Contract	Once all terms are agreed upon, transfer the details from the final proposal into your standard independent contractor agreement. Send it to the client for their review and signature using a service like DocuSign or HelloSign.	\N	f	2025-08-13 19:02:23.75	2025-08-13 19:02:23.75	cme9g3vre000hsq1vwppvr7p4
cmeac7sp2004ms97l18u0inzi	Final Follow-Up on Contract	If the contract hasn't been signed after a couple of days, a final, friendly nudge is appropriate.	\N	f	2025-08-13 19:02:23.75	2025-08-13 19:02:23.75	cme9g3vre000hsq1vwppvr7p4
cmeac7sp2004ns97lfrwsqnv6	Contract Signed!	The client signs the contract. Send a welcome email outlining the next steps for onboarding and project kickoff.	\N	f	2025-08-13 19:02:23.75	2025-08-13 19:02:23.75	cme9g3vre000hsq1vwppvr7p4
cmeac7sw1004os97lb4gv3kky	Client Research	Identify 5-10 potential clients who align with your skills and services. Research their business, identify a potential need, and find the right contact person (e.g., Head of Product, CTO, Marketing Manager).	\N	f	2025-08-13 19:02:24.001	2025-08-13 19:02:24.001	cme9g58im000jsq1vota3dghb
cmeac7sw1004ps97lf7v7t2wn	Prepare First Contact	Draft a personalized email or LinkedIn message for each of the top 3-5 prospects. Reference their specific company and a problem you believe you can help them solve. Avoid generic templates.	\N	f	2025-08-13 19:02:24.001	2025-08-13 19:02:24.001	cme9g58im000jsq1vota3dghb
cmeac7sw1004qs97lg72shwwf	Send Initial Outreach	Send the personalized messages you drafted. Log the outreach in a spreadsheet or your personal CRM.	\N	f	2025-08-13 19:02:24.001	2025-08-13 19:02:24.001	cme9g58im000jsq1vota3dghb
cmeac7sw1004rs97lztpr5avy	Gentle Nudge (Optional)	If you have a relevant piece of content (a blog post you wrote, a similar project in your portfolio), you can engage with the contact's content on a platform like LinkedIn. This is a soft-touch follow-up.	\N	f	2025-08-13 19:02:24.001	2025-08-13 19:02:24.001	cme9g58im000jsq1vota3dghb
cmeac7sw1004ss97lt84midwz	First Follow-Up	If you haven't received a response from your initial outreach, send a brief and polite follow-up email after a reasonable amount of time has passed (e.g., 3-5 business days).	\N	f	2025-08-13 19:02:24.001	2025-08-13 19:02:24.001	cme9g58im000jsq1vota3dghb
cmeac7sw1004ts97lyenkoode	Schedule Discovery Call	The client has responded and is interested in talking. Immediately reply with your availability or a scheduling link (like Calendly) to book a 20-30 minute discovery call.	\N	f	2025-08-13 19:02:24.001	2025-08-13 19:02:24.001	cme9g58im000jsq1vota3dghb
cmeac7sw1004us97l3feqe1to	Hold Discovery Call	Conduct the discovery call. Focus on listening to the client's needs, challenges, and goals. Ask clarifying questions to ensure you fully understand the scope of their problem.	\N	f	2025-08-13 19:02:24.001	2025-08-13 19:02:24.001	cme9g58im000jsq1vota3dghb
cmeac7sw1004vs97lku1mdod6	Draft Project Proposal	Based on the discovery call, draft a detailed project proposal. Include: Your understanding of the problem, your proposed solution, project scope and deliverables, timeline and milestones, and pricing and payment terms.	\N	f	2025-08-13 19:02:24.001	2025-08-13 19:02:24.001	cme9g58im000jsq1vota3dghb
cmeac7sw1004ws97l204ictdw	Send Proposal	Send the proposal to the client. In the email, suggest a time to walk them through it and answer any questions.	\N	f	2025-08-13 19:02:24.001	2025-08-13 19:02:24.001	cme9g58im000jsq1vota3dghb
cmeac7sw1004xs97l13658tqy	Proposal Follow-Up	If you haven't heard back after a few days, send a follow-up email.	\N	f	2025-08-13 19:02:24.001	2025-08-13 19:02:24.001	cme9g58im000jsq1vota3dghb
cmeac7sw1004ys97l0jd54skx	Negotiation & Finalizing Scope	The client has reviewed the proposal and wants to move forward, possibly with some adjustments. Schedule a call to negotiate terms, adjust the scope if needed, and come to a verbal agreement.	\N	f	2025-08-13 19:02:24.001	2025-08-13 19:02:24.001	cme9g58im000jsq1vota3dghb
cmeac7sw1004zs97lbn3nxcr4	Prepare & Send Contract	Once all terms are agreed upon, transfer the details from the final proposal into your standard independent contractor agreement. Send it to the client for their review and signature using a service like DocuSign or HelloSign.	\N	f	2025-08-13 19:02:24.001	2025-08-13 19:02:24.001	cme9g58im000jsq1vota3dghb
cmeac7sw10050s97lqxa7j53t	Final Follow-Up on Contract	If the contract hasn't been signed after a couple of days, a final, friendly nudge is appropriate.	\N	f	2025-08-13 19:02:24.001	2025-08-13 19:02:24.001	cme9g58im000jsq1vota3dghb
cmeac7sw10051s97lbr91wj5i	Contract Signed!	The client signs the contract. Send a welcome email outlining the next steps for onboarding and project kickoff.	\N	f	2025-08-13 19:02:24.001	2025-08-13 19:02:24.001	cme9g58im000jsq1vota3dghb
cmeac7tig0052s97lhccrz7bn	Client Research	Identify 5-10 potential clients who align with your skills and services. Research their business, identify a potential need, and find the right contact person (e.g., Head of Product, CTO, Marketing Manager).	\N	f	2025-08-13 19:02:24.808	2025-08-13 19:02:24.808	cme9g80op000lsq1vh8or0ikc
cmeac7tig0053s97lb6u0db03	Prepare First Contact	Draft a personalized email or LinkedIn message for each of the top 3-5 prospects. Reference their specific company and a problem you believe you can help them solve. Avoid generic templates.	\N	f	2025-08-13 19:02:24.808	2025-08-13 19:02:24.808	cme9g80op000lsq1vh8or0ikc
cmeac7tig0054s97l2jahbd8n	Send Initial Outreach	Send the personalized messages you drafted. Log the outreach in a spreadsheet or your personal CRM.	\N	f	2025-08-13 19:02:24.808	2025-08-13 19:02:24.808	cme9g80op000lsq1vh8or0ikc
cmeac7tig0055s97lm10ietcf	Gentle Nudge (Optional)	If you have a relevant piece of content (a blog post you wrote, a similar project in your portfolio), you can engage with the contact's content on a platform like LinkedIn. This is a soft-touch follow-up.	\N	f	2025-08-13 19:02:24.808	2025-08-13 19:02:24.808	cme9g80op000lsq1vh8or0ikc
cmeac7tig0056s97l70enqwc1	First Follow-Up	If you haven't received a response from your initial outreach, send a brief and polite follow-up email after a reasonable amount of time has passed (e.g., 3-5 business days).	\N	f	2025-08-13 19:02:24.808	2025-08-13 19:02:24.808	cme9g80op000lsq1vh8or0ikc
cmeac7tig0057s97lbcswsus6	Schedule Discovery Call	The client has responded and is interested in talking. Immediately reply with your availability or a scheduling link (like Calendly) to book a 20-30 minute discovery call.	\N	f	2025-08-13 19:02:24.808	2025-08-13 19:02:24.808	cme9g80op000lsq1vh8or0ikc
cmeac7tig0058s97lc3fp9p7l	Hold Discovery Call	Conduct the discovery call. Focus on listening to the client's needs, challenges, and goals. Ask clarifying questions to ensure you fully understand the scope of their problem.	\N	f	2025-08-13 19:02:24.808	2025-08-13 19:02:24.808	cme9g80op000lsq1vh8or0ikc
cmeac7tig0059s97l6oq28k7e	Draft Project Proposal	Based on the discovery call, draft a detailed project proposal. Include: Your understanding of the problem, your proposed solution, project scope and deliverables, timeline and milestones, and pricing and payment terms.	\N	f	2025-08-13 19:02:24.808	2025-08-13 19:02:24.808	cme9g80op000lsq1vh8or0ikc
cmeac7tig005as97lt7rp3yvr	Send Proposal	Send the proposal to the client. In the email, suggest a time to walk them through it and answer any questions.	\N	f	2025-08-13 19:02:24.808	2025-08-13 19:02:24.808	cme9g80op000lsq1vh8or0ikc
cmeac7tig005bs97lccwv89o2	Proposal Follow-Up	If you haven't heard back after a few days, send a follow-up email.	\N	f	2025-08-13 19:02:24.808	2025-08-13 19:02:24.808	cme9g80op000lsq1vh8or0ikc
cmeac7tig005cs97lk6w2usz0	Negotiation & Finalizing Scope	The client has reviewed the proposal and wants to move forward, possibly with some adjustments. Schedule a call to negotiate terms, adjust the scope if needed, and come to a verbal agreement.	\N	f	2025-08-13 19:02:24.808	2025-08-13 19:02:24.808	cme9g80op000lsq1vh8or0ikc
cmeac7tig005ds97l8ga7fmir	Prepare & Send Contract	Once all terms are agreed upon, transfer the details from the final proposal into your standard independent contractor agreement. Send it to the client for their review and signature using a service like DocuSign or HelloSign.	\N	f	2025-08-13 19:02:24.808	2025-08-13 19:02:24.808	cme9g80op000lsq1vh8or0ikc
cmeac7tig005es97l2aruzvu4	Final Follow-Up on Contract	If the contract hasn't been signed after a couple of days, a final, friendly nudge is appropriate.	\N	f	2025-08-13 19:02:24.808	2025-08-13 19:02:24.808	cme9g80op000lsq1vh8or0ikc
cmeac7tig005fs97l7l4t8g21	Contract Signed!	The client signs the contract. Send a welcome email outlining the next steps for onboarding and project kickoff.	\N	f	2025-08-13 19:02:24.808	2025-08-13 19:02:24.808	cme9g80op000lsq1vh8or0ikc
cmeac7twy005gs97levinvqlt	Client Research	Identify 5-10 potential clients who align with your skills and services. Research their business, identify a potential need, and find the right contact person (e.g., Head of Product, CTO, Marketing Manager).	\N	f	2025-08-13 19:02:25.331	2025-08-13 19:02:25.331	cme9g9325000nsq1vg3jaxy3n
cmeac7twy005hs97lsjdc86fa	Prepare First Contact	Draft a personalized email or LinkedIn message for each of the top 3-5 prospects. Reference their specific company and a problem you believe you can help them solve. Avoid generic templates.	\N	f	2025-08-13 19:02:25.331	2025-08-13 19:02:25.331	cme9g9325000nsq1vg3jaxy3n
cmeac7twz005is97lsj3ostnl	Send Initial Outreach	Send the personalized messages you drafted. Log the outreach in a spreadsheet or your personal CRM.	\N	f	2025-08-13 19:02:25.331	2025-08-13 19:02:25.331	cme9g9325000nsq1vg3jaxy3n
cmeac7twz005js97lhba6lhm4	Gentle Nudge (Optional)	If you have a relevant piece of content (a blog post you wrote, a similar project in your portfolio), you can engage with the contact's content on a platform like LinkedIn. This is a soft-touch follow-up.	\N	f	2025-08-13 19:02:25.331	2025-08-13 19:02:25.331	cme9g9325000nsq1vg3jaxy3n
cmeac7twz005ks97ltl4gxewv	First Follow-Up	If you haven't received a response from your initial outreach, send a brief and polite follow-up email after a reasonable amount of time has passed (e.g., 3-5 business days).	\N	f	2025-08-13 19:02:25.331	2025-08-13 19:02:25.331	cme9g9325000nsq1vg3jaxy3n
cmeac7twz005ls97lt97209vh	Schedule Discovery Call	The client has responded and is interested in talking. Immediately reply with your availability or a scheduling link (like Calendly) to book a 20-30 minute discovery call.	\N	f	2025-08-13 19:02:25.331	2025-08-13 19:02:25.331	cme9g9325000nsq1vg3jaxy3n
cmeac7twz005ms97lvahxls2t	Hold Discovery Call	Conduct the discovery call. Focus on listening to the client's needs, challenges, and goals. Ask clarifying questions to ensure you fully understand the scope of their problem.	\N	f	2025-08-13 19:02:25.331	2025-08-13 19:02:25.331	cme9g9325000nsq1vg3jaxy3n
cmeac7twz005ns97l64l0ku02	Draft Project Proposal	Based on the discovery call, draft a detailed project proposal. Include: Your understanding of the problem, your proposed solution, project scope and deliverables, timeline and milestones, and pricing and payment terms.	\N	f	2025-08-13 19:02:25.331	2025-08-13 19:02:25.331	cme9g9325000nsq1vg3jaxy3n
cmeac7twz005os97lbwnb6zl2	Send Proposal	Send the proposal to the client. In the email, suggest a time to walk them through it and answer any questions.	\N	f	2025-08-13 19:02:25.331	2025-08-13 19:02:25.331	cme9g9325000nsq1vg3jaxy3n
cmeac7twz005ps97l69fd40y7	Proposal Follow-Up	If you haven't heard back after a few days, send a follow-up email.	\N	f	2025-08-13 19:02:25.331	2025-08-13 19:02:25.331	cme9g9325000nsq1vg3jaxy3n
cmeac7twz005qs97lfdvwiusi	Negotiation & Finalizing Scope	The client has reviewed the proposal and wants to move forward, possibly with some adjustments. Schedule a call to negotiate terms, adjust the scope if needed, and come to a verbal agreement.	\N	f	2025-08-13 19:02:25.331	2025-08-13 19:02:25.331	cme9g9325000nsq1vg3jaxy3n
cmeac7twz005rs97lhcx6iywe	Prepare & Send Contract	Once all terms are agreed upon, transfer the details from the final proposal into your standard independent contractor agreement. Send it to the client for their review and signature using a service like DocuSign or HelloSign.	\N	f	2025-08-13 19:02:25.331	2025-08-13 19:02:25.331	cme9g9325000nsq1vg3jaxy3n
cmeac7twz005ss97luitzt13q	Final Follow-Up on Contract	If the contract hasn't been signed after a couple of days, a final, friendly nudge is appropriate.	\N	f	2025-08-13 19:02:25.331	2025-08-13 19:02:25.331	cme9g9325000nsq1vg3jaxy3n
cmeac7twz005ts97lt1xpk1bk	Contract Signed!	The client signs the contract. Send a welcome email outlining the next steps for onboarding and project kickoff.	\N	f	2025-08-13 19:02:25.331	2025-08-13 19:02:25.331	cme9g9325000nsq1vg3jaxy3n
cmeac7ujg005us97lh7itrivm	Client Research	Identify 5-10 potential clients who align with your skills and services. Research their business, identify a potential need, and find the right contact person (e.g., Head of Product, CTO, Marketing Manager).	\N	f	2025-08-13 19:02:26.141	2025-08-13 19:02:26.141	cme9ga3ud000psq1vocpusjvy
cmeac7ujh005vs97lypesjudl	Prepare First Contact	Draft a personalized email or LinkedIn message for each of the top 3-5 prospects. Reference their specific company and a problem you believe you can help them solve. Avoid generic templates.	\N	f	2025-08-13 19:02:26.141	2025-08-13 19:02:26.141	cme9ga3ud000psq1vocpusjvy
cmeac7ujh005ws97lqm46rtar	Send Initial Outreach	Send the personalized messages you drafted. Log the outreach in a spreadsheet or your personal CRM.	\N	f	2025-08-13 19:02:26.141	2025-08-13 19:02:26.141	cme9ga3ud000psq1vocpusjvy
cmeac7ujh005xs97lli2p26f4	Gentle Nudge (Optional)	If you have a relevant piece of content (a blog post you wrote, a similar project in your portfolio), you can engage with the contact's content on a platform like LinkedIn. This is a soft-touch follow-up.	\N	f	2025-08-13 19:02:26.141	2025-08-13 19:02:26.141	cme9ga3ud000psq1vocpusjvy
cmeac7ujh005ys97l9mzq6xlf	First Follow-Up	If you haven't received a response from your initial outreach, send a brief and polite follow-up email after a reasonable amount of time has passed (e.g., 3-5 business days).	\N	f	2025-08-13 19:02:26.141	2025-08-13 19:02:26.141	cme9ga3ud000psq1vocpusjvy
cmeac7ujh005zs97li4ejkqfs	Schedule Discovery Call	The client has responded and is interested in talking. Immediately reply with your availability or a scheduling link (like Calendly) to book a 20-30 minute discovery call.	\N	f	2025-08-13 19:02:26.141	2025-08-13 19:02:26.141	cme9ga3ud000psq1vocpusjvy
cmeac7ujh0060s97lnwnr91r2	Hold Discovery Call	Conduct the discovery call. Focus on listening to the client's needs, challenges, and goals. Ask clarifying questions to ensure you fully understand the scope of their problem.	\N	f	2025-08-13 19:02:26.141	2025-08-13 19:02:26.141	cme9ga3ud000psq1vocpusjvy
cmeac7ujh0061s97lbwxj7wif	Draft Project Proposal	Based on the discovery call, draft a detailed project proposal. Include: Your understanding of the problem, your proposed solution, project scope and deliverables, timeline and milestones, and pricing and payment terms.	\N	f	2025-08-13 19:02:26.141	2025-08-13 19:02:26.141	cme9ga3ud000psq1vocpusjvy
cmeac7ujh0062s97l5w5mn0os	Send Proposal	Send the proposal to the client. In the email, suggest a time to walk them through it and answer any questions.	\N	f	2025-08-13 19:02:26.141	2025-08-13 19:02:26.141	cme9ga3ud000psq1vocpusjvy
cmeac7ujh0063s97l5orova8k	Proposal Follow-Up	If you haven't heard back after a few days, send a follow-up email.	\N	f	2025-08-13 19:02:26.141	2025-08-13 19:02:26.141	cme9ga3ud000psq1vocpusjvy
cmeac7ujh0064s97lkbm81pbp	Negotiation & Finalizing Scope	The client has reviewed the proposal and wants to move forward, possibly with some adjustments. Schedule a call to negotiate terms, adjust the scope if needed, and come to a verbal agreement.	\N	f	2025-08-13 19:02:26.141	2025-08-13 19:02:26.141	cme9ga3ud000psq1vocpusjvy
cmeac7ujh0065s97leyfwl9bh	Prepare & Send Contract	Once all terms are agreed upon, transfer the details from the final proposal into your standard independent contractor agreement. Send it to the client for their review and signature using a service like DocuSign or HelloSign.	\N	f	2025-08-13 19:02:26.141	2025-08-13 19:02:26.141	cme9ga3ud000psq1vocpusjvy
cmeac7ujh0066s97lr2q4pb95	Final Follow-Up on Contract	If the contract hasn't been signed after a couple of days, a final, friendly nudge is appropriate.	\N	f	2025-08-13 19:02:26.141	2025-08-13 19:02:26.141	cme9ga3ud000psq1vocpusjvy
cmeac7ujh0067s97lgulj4h47	Contract Signed!	The client signs the contract. Send a welcome email outlining the next steps for onboarding and project kickoff.	\N	f	2025-08-13 19:02:26.141	2025-08-13 19:02:26.141	cme9ga3ud000psq1vocpusjvy
cmeaciidn00019l8wqx8aaaow	Wait	hopefully they reach out to Shannon?	2025-08-20 00:00:00	f	2025-08-13 19:10:43.595	2025-08-13 19:10:43.595	cmdzbpnq90001mqmdbmdw848o
cmebo65d6000c2u2n1316bp20	Client Research	Identify 5-10 potential clients who align with your skills and services. Research their business, identify a potential need, and find the right contact person (e.g., Head of Product, CTO, Marketing Manager).	\N	f	2025-08-14 17:24:48.427	2025-08-14 17:24:48.427	cmebo65d1000b2u2ngzqm98f9
cmebo65d6000d2u2nl83i1tnw	Prepare First Contact	Draft a personalized email or LinkedIn message for each of the top 3-5 prospects. Reference their specific company and a problem you believe you can help them solve. Avoid generic templates.	\N	f	2025-08-14 17:24:48.427	2025-08-14 17:24:48.427	cmebo65d1000b2u2ngzqm98f9
cmebo65d6000e2u2n3ewoozz7	Send Initial Outreach	Send the personalized messages you drafted. Log the outreach in a spreadsheet or your personal CRM.	\N	f	2025-08-14 17:24:48.427	2025-08-14 17:24:48.427	cmebo65d1000b2u2ngzqm98f9
cmebo65d7000f2u2n40j0vwzn	Gentle Nudge (Optional)	If you have a relevant piece of content (a blog post you wrote, a similar project in your portfolio), you can engage with the contact's content on a platform like LinkedIn. This is a soft-touch follow-up.	\N	f	2025-08-14 17:24:48.427	2025-08-14 17:24:48.427	cmebo65d1000b2u2ngzqm98f9
cmebo65d7000g2u2ncicxvujh	First Follow-Up	If you haven't received a response from your initial outreach, send a brief and polite follow-up email after a reasonable amount of time has passed (e.g., 3-5 business days).	\N	f	2025-08-14 17:24:48.427	2025-08-14 17:24:48.427	cmebo65d1000b2u2ngzqm98f9
cmebo65d7000h2u2nwouygyk6	Schedule Discovery Call	The client has responded and is interested in talking. Immediately reply with your availability or a scheduling link (like Calendly) to book a 20-30 minute discovery call.	\N	f	2025-08-14 17:24:48.427	2025-08-14 17:24:48.427	cmebo65d1000b2u2ngzqm98f9
cmebo65d7000i2u2nszv00c2n	Hold Discovery Call	Conduct the discovery call. Focus on listening to the client's needs, challenges, and goals. Ask clarifying questions to ensure you fully understand the scope of their problem.	\N	f	2025-08-14 17:24:48.427	2025-08-14 17:24:48.427	cmebo65d1000b2u2ngzqm98f9
cmebo65d7000j2u2nh8f3olm9	Draft Project Proposal	Based on the discovery call, draft a detailed project proposal. Include: Your understanding of the problem, your proposed solution, project scope and deliverables, timeline and milestones, and pricing and payment terms.	\N	f	2025-08-14 17:24:48.427	2025-08-14 17:24:48.427	cmebo65d1000b2u2ngzqm98f9
cmebo65d7000k2u2nr76omb03	Send Proposal	Send the proposal to the client. In the email, suggest a time to walk them through it and answer any questions.	\N	f	2025-08-14 17:24:48.427	2025-08-14 17:24:48.427	cmebo65d1000b2u2ngzqm98f9
cmebo65d7000l2u2nxgl0g4ja	Proposal Follow-Up	If you haven't heard back after a few days, send a follow-up email.	\N	f	2025-08-14 17:24:48.427	2025-08-14 17:24:48.427	cmebo65d1000b2u2ngzqm98f9
cmebo65d7000m2u2nj0khgci0	Negotiation & Finalizing Scope	The client has reviewed the proposal and wants to move forward, possibly with some adjustments. Schedule a call to negotiate terms, adjust the scope if needed, and come to a verbal agreement.	\N	f	2025-08-14 17:24:48.427	2025-08-14 17:24:48.427	cmebo65d1000b2u2ngzqm98f9
cmebo65d7000n2u2ngdg1o9xs	Prepare & Send Contract	Once all terms are agreed upon, transfer the details from the final proposal into your standard independent contractor agreement. Send it to the client for their review and signature using a service like DocuSign or HelloSign.	\N	f	2025-08-14 17:24:48.427	2025-08-14 17:24:48.427	cmebo65d1000b2u2ngzqm98f9
cmebo65d7000o2u2nojjld71d	Final Follow-Up on Contract	If the contract hasn't been signed after a couple of days, a final, friendly nudge is appropriate.	\N	f	2025-08-14 17:24:48.427	2025-08-14 17:24:48.427	cmebo65d1000b2u2ngzqm98f9
cmebo65d7000p2u2nghht8ui9	Contract Signed!	The client signs the contract. Send a welcome email outlining the next steps for onboarding and project kickoff.	\N	f	2025-08-14 17:24:48.427	2025-08-14 17:24:48.427	cmebo65d1000b2u2ngzqm98f9
cmebo89df000t2u2n7nzih20l	Client Research	Identify 5-10 potential clients who align with your skills and services. Research their business, identify a potential need, and find the right contact person (e.g., Head of Product, CTO, Marketing Manager).	2025-08-14 00:00:00	t	2025-08-14 17:26:26.931	2025-08-14 22:31:04.193	cmebo89d6000s2u2nev11wzan
cmebo89df000u2u2nyo57mq4n	Prepare First Contact	Draft a personalized email or LinkedIn message for each of the top 3-5 prospects. Reference their specific company and a problem you believe you can help them solve. Avoid generic templates.	2025-08-14 00:00:00	t	2025-08-14 17:26:26.931	2025-08-14 22:31:11.109	cmebo89d6000s2u2nev11wzan
cmebo89df000v2u2nqemcxzw2	Send Initial Outreach	Send the personalized messages you drafted. Log the outreach in a spreadsheet or your personal CRM.	2025-08-14 00:00:00	t	2025-08-14 17:26:26.931	2025-08-14 22:31:20.299	cmebo89d6000s2u2nev11wzan
cmebo89df000w2u2ntqfqdgtf	Gentle Nudge (Optional)	If you have a relevant piece of content (a blog post you wrote, a similar project in your portfolio), you can engage with the contact's content on a platform like LinkedIn. This is a soft-touch follow-up.	2025-08-21 00:00:00	f	2025-08-14 17:26:26.931	2025-08-14 22:32:05.322	cmebo89d6000s2u2nev11wzan
cmebo89df000x2u2nhx1nyjg1	First Follow-Up	If you haven't received a response from your initial outreach, send a brief and polite follow-up email after a reasonable amount of time has passed (e.g., 3-5 business days).	\N	f	2025-08-14 17:26:26.931	2025-08-14 17:26:26.931	cmebo89d6000s2u2nev11wzan
cmebo89df000y2u2ny3mb52tz	Schedule Discovery Call	The client has responded and is interested in talking. Immediately reply with your availability or a scheduling link (like Calendly) to book a 20-30 minute discovery call.	\N	f	2025-08-14 17:26:26.931	2025-08-14 17:26:26.931	cmebo89d6000s2u2nev11wzan
cmebo89df000z2u2n2f5b7g5f	Hold Discovery Call	Conduct the discovery call. Focus on listening to the client's needs, challenges, and goals. Ask clarifying questions to ensure you fully understand the scope of their problem.	\N	f	2025-08-14 17:26:26.931	2025-08-14 17:26:26.931	cmebo89d6000s2u2nev11wzan
cmebo89df00102u2nkpteqfgb	Draft Project Proposal	Based on the discovery call, draft a detailed project proposal. Include: Your understanding of the problem, your proposed solution, project scope and deliverables, timeline and milestones, and pricing and payment terms.	\N	f	2025-08-14 17:26:26.931	2025-08-14 17:26:26.931	cmebo89d6000s2u2nev11wzan
cmebo89df00112u2nvcdue78i	Send Proposal	Send the proposal to the client. In the email, suggest a time to walk them through it and answer any questions.	\N	f	2025-08-14 17:26:26.931	2025-08-14 17:26:26.931	cmebo89d6000s2u2nev11wzan
cmebo89df00122u2ntc7oakrs	Proposal Follow-Up	If you haven't heard back after a few days, send a follow-up email.	\N	f	2025-08-14 17:26:26.931	2025-08-14 17:26:26.931	cmebo89d6000s2u2nev11wzan
cmebo89df00132u2nq8e9rapm	Negotiation & Finalizing Scope	The client has reviewed the proposal and wants to move forward, possibly with some adjustments. Schedule a call to negotiate terms, adjust the scope if needed, and come to a verbal agreement.	\N	f	2025-08-14 17:26:26.931	2025-08-14 17:26:26.931	cmebo89d6000s2u2nev11wzan
cmebo89df00142u2n34fz58s6	Prepare & Send Contract	Once all terms are agreed upon, transfer the details from the final proposal into your standard independent contractor agreement. Send it to the client for their review and signature using a service like DocuSign or HelloSign.	\N	f	2025-08-14 17:26:26.931	2025-08-14 17:26:26.931	cmebo89d6000s2u2nev11wzan
cmebo89df00152u2nsgyxxt0d	Final Follow-Up on Contract	If the contract hasn't been signed after a couple of days, a final, friendly nudge is appropriate.	\N	f	2025-08-14 17:26:26.931	2025-08-14 17:26:26.931	cmebo89d6000s2u2nev11wzan
cmebo89df00162u2nw7eqdyj2	Contract Signed!	The client signs the contract. Send a welcome email outlining the next steps for onboarding and project kickoff.	\N	f	2025-08-14 17:26:26.931	2025-08-14 17:26:26.931	cmebo89d6000s2u2nev11wzan
cmebsdgrr00033kxcazqcwez0	Client Research	Identify 5-10 potential clients who align with your skills and services. Research their business, identify a potential need, and find the right contact person (e.g., Head of Product, CTO, Marketing Manager).	2025-08-14 00:00:00	t	2025-08-14 19:22:28.263	2025-08-14 20:24:53.576	cmebsdgrm00023kxcjbxl0cxe
cmebsdgrr00043kxcl319labn	Prepare First Contact	Draft a personalized email or LinkedIn message for each of the top 3-5 prospects. Reference their specific company and a problem you believe you can help them solve. Avoid generic templates.	2025-08-19 00:00:00	t	2025-08-14 19:22:28.263	2025-08-14 20:24:42.774	cmebsdgrm00023kxcjbxl0cxe
cmebsdgrr00053kxciggoyfcu	Send Initial Outreach	Send the personalized messages you drafted. Log the outreach in a spreadsheet or your personal CRM.	2025-08-14 00:00:00	t	2025-08-14 19:22:28.263	2025-08-14 20:38:12.121	cmebsdgrm00023kxcjbxl0cxe
cmebsdgrr00063kxclxh7y78o	Gentle Nudge (Optional)	If you have a relevant piece of content (a blog post you wrote, a similar project in your portfolio), you can engage with the contact's content on a platform like LinkedIn. This is a soft-touch follow-up.	2025-08-19 07:00:00	t	2025-08-14 19:22:28.263	2025-08-18 03:45:15.831	cmebsdgrm00023kxcjbxl0cxe
cmebsdgrr00073kxc3uocsqzv	First Follow-Up	If you haven't received a response from your initial outreach, send a brief and polite follow-up email after a reasonable amount of time has passed (e.g., 3-5 business days).	2025-08-24 07:00:00	f	2025-08-14 19:22:28.263	2025-08-18 03:45:38.401	cmebsdgrm00023kxcjbxl0cxe
cmebsdgrr00083kxcjdp1ypr1	Schedule Discovery Call	The client has responded and is interested in talking. Immediately reply with your availability or a scheduling link (like Calendly) to book a 20-30 minute discovery call.	\N	f	2025-08-14 19:22:28.263	2025-08-14 19:22:28.263	cmebsdgrm00023kxcjbxl0cxe
cmebsdgrr00093kxcpi0we3bg	Hold Discovery Call	Conduct the discovery call. Focus on listening to the client's needs, challenges, and goals. Ask clarifying questions to ensure you fully understand the scope of their problem.	\N	f	2025-08-14 19:22:28.263	2025-08-14 19:22:28.263	cmebsdgrm00023kxcjbxl0cxe
cmebsdgrr000a3kxc0lt7zfrn	Draft Project Proposal	Based on the discovery call, draft a detailed project proposal. Include: Your understanding of the problem, your proposed solution, project scope and deliverables, timeline and milestones, and pricing and payment terms.	\N	f	2025-08-14 19:22:28.263	2025-08-14 19:22:28.263	cmebsdgrm00023kxcjbxl0cxe
cmebsdgrr000b3kxc48n425ye	Send Proposal	Send the proposal to the client. In the email, suggest a time to walk them through it and answer any questions.	\N	f	2025-08-14 19:22:28.263	2025-08-14 19:22:28.263	cmebsdgrm00023kxcjbxl0cxe
cmebsdgrr000c3kxczcr0zfy3	Proposal Follow-Up	If you haven't heard back after a few days, send a follow-up email.	\N	f	2025-08-14 19:22:28.263	2025-08-14 19:22:28.263	cmebsdgrm00023kxcjbxl0cxe
cmebsdgrr000d3kxczky27h7a	Negotiation & Finalizing Scope	The client has reviewed the proposal and wants to move forward, possibly with some adjustments. Schedule a call to negotiate terms, adjust the scope if needed, and come to a verbal agreement.	\N	f	2025-08-14 19:22:28.263	2025-08-14 19:22:28.263	cmebsdgrm00023kxcjbxl0cxe
cmebsdgrr000e3kxci6u0xdoj	Prepare & Send Contract	Once all terms are agreed upon, transfer the details from the final proposal into your standard independent contractor agreement. Send it to the client for their review and signature using a service like DocuSign or HelloSign.	\N	f	2025-08-14 19:22:28.263	2025-08-14 19:22:28.263	cmebsdgrm00023kxcjbxl0cxe
cmebsdgrr000f3kxccg7848bf	Final Follow-Up on Contract	If the contract hasn't been signed after a couple of days, a final, friendly nudge is appropriate.	\N	f	2025-08-14 19:22:28.263	2025-08-14 19:22:28.263	cmebsdgrm00023kxcjbxl0cxe
cmebsdgrr000g3kxc3tqity4a	Contract Signed!	The client signs the contract. Send a welcome email outlining the next steps for onboarding and project kickoff.	\N	f	2025-08-14 19:22:28.263	2025-08-14 19:22:28.263	cmebsdgrm00023kxcjbxl0cxe
cmeeenw1q0001ynmc90u3iv90	Current Website Updates	Backup and update	2025-08-26 07:00:00	f	2025-08-16 15:21:58.525	2025-08-17 21:57:22.323	cmebo65d1000b2u2ngzqm98f9
cmeetwuu5000imhrlr9v95c04	Seperate Job Pages	on the highline website create seperate job listing pages, have the correct schema, set these to publish and unpublish accordingly	2025-08-18 07:00:00	f	2025-08-16 22:28:51.101	2025-08-17 21:56:46.423	cmeetur3h0002mhrlw6d96p6d
\.


--
-- Name: FeatureRequest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."FeatureRequest_id_seq"', 1, false);


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: AppearanceSettings AppearanceSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AppearanceSettings"
    ADD CONSTRAINT "AppearanceSettings_pkey" PRIMARY KEY (id);


--
-- Name: Budget Budget_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Budget"
    ADD CONSTRAINT "Budget_pkey" PRIMARY KEY (id);


--
-- Name: Client Client_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Client"
    ADD CONSTRAINT "Client_pkey" PRIMARY KEY (id);


--
-- Name: Document Document_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_pkey" PRIMARY KEY (id);


--
-- Name: Expense Expense_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_pkey" PRIMARY KEY (id);


--
-- Name: FeatureRequest FeatureRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FeatureRequest"
    ADD CONSTRAINT "FeatureRequest_pkey" PRIMARY KEY (id);


--
-- Name: FinancialDocument FinancialDocument_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FinancialDocument"
    ADD CONSTRAINT "FinancialDocument_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Subscription Subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: project_contacts project_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_contacts
    ADD CONSTRAINT project_contacts_pkey PRIMARY KEY (id);


--
-- Name: project_members project_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: time_entries time_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_pkey PRIMARY KEY (id);


--
-- Name: timeline_events timeline_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timeline_events
    ADD CONSTRAINT timeline_events_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Budget_userId_category_month_year_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Budget_userId_category_month_year_key" ON public."Budget" USING btree ("userId", category, month, year);


--
-- Name: Invoice_invoiceNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON public."Invoice" USING btree ("invoiceNumber");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: categories_name_projectId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "categories_name_projectId_key" ON public.categories USING btree (name, "projectId");


--
-- Name: project_contacts_projectId_contactId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "project_contacts_projectId_contactId_key" ON public.project_contacts USING btree ("projectId", "contactId");


--
-- Name: project_members_userId_projectId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "project_members_userId_projectId_key" ON public.project_members USING btree ("userId", "projectId");


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Budget Budget_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Budget"
    ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Client Client_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Client"
    ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Document Document_expenseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES public."Expense"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Document Document_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Document Document_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Expense Expense_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FinancialDocument FinancialDocument_expenseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FinancialDocument"
    ADD CONSTRAINT "FinancialDocument_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES public."Expense"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FinancialDocument FinancialDocument_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FinancialDocument"
    ADD CONSTRAINT "FinancialDocument_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FinancialDocument FinancialDocument_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FinancialDocument"
    ADD CONSTRAINT "FinancialDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Invoice Invoice_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Invoice Invoice_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Subscription Subscription_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: categories categories_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: files files_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "files_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: files files_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "files_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: files files_uploaderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "files_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_contacts project_contacts_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_contacts
    ADD CONSTRAINT "project_contacts_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public.contacts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_contacts project_contacts_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_contacts
    ADD CONSTRAINT "project_contacts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_members project_members_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT "project_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_members project_members_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT "project_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: projects projects_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tasks tasks_assigneeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tasks tasks_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tasks tasks_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tasks tasks_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: time_entries time_entries_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT "time_entries_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: time_entries time_entries_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT "time_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: timeline_events timeline_events_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timeline_events
    ADD CONSTRAINT "timeline_events_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Eg9HB7xEMwHjIrmhqw2sAnLhFuAC4ODb2oYQWqJz6xSKnMMgYn6MhvyzJgIdhp1

