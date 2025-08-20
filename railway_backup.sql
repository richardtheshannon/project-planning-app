--
-- PostgreSQL database dump
--

\restrict UAgRh4ITXdaj59THaZ1OUH4jm9rdNskPziLSNWAhByhlK6colvo3GsZo49pfzQb

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
\.


--
-- Data for Name: Document; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Document" (id, title, name, type, size, path, "userId", "projectId", "expenseId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Expense; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Expense" (id, description, amount, category, date, "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FeatureRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FeatureRequest" (id, title, description, status, priority, "submittedBy", "createdAt", "updatedAt") FROM stdin;
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
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, "emailVerified", image, password, role, "isActive", "sendDailyManifest", "sendAfternoonManifest", "createdAt", "updatedAt") FROM stdin;
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
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.files (id, "originalName", filename, mimetype, size, path, "createdAt", "uploaderId", "projectId", "taskId") FROM stdin;
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
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, title, description, status, priority, "startDate", "dueDate", "completedAt", "estimatedHours", "actualHours", "createdAt", "updatedAt", "projectId", "assigneeId", "categoryId", "parentId") FROM stdin;
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

\unrestrict UAgRh4ITXdaj59THaZ1OUH4jm9rdNskPziLSNWAhByhlK6colvo3GsZo49pfzQb

