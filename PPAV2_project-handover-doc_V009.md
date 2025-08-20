# **Project Handover & Status Summary**

**Date:** August 20, 2025

**Project Version:** project-planning-V2

**Environment:** Windows Development / VS Code / Railway Deployment

**Database:** PostgreSQL (Railway hosted & Local)

## **1\. Project Overview**

This is a Next.js-based business management application designed for project management, financial tracking, team collaboration, and document management.

### **Current Status**

* **Production:** The original deployment is stable and running on a dedicated Railway project with a MySQL database. **This environment should not be modified.**  
* **Development (Cloud):** A complete copy of the application is deployed to a separate Railway project. Its database has been **successfully migrated from MySQL to PostgreSQL** and is populated with all necessary test data.  
* **Development (Local):** A local development environment has been successfully configured. It connects to a local instance of PostgreSQL that contains a complete backup of the cloud development database.  
* **Deployment:** The development environment is stable and successfully deploying from the GitHub repository.

## **2\. Technical Stack**

### **Core Dependencies**

{  
  "next": "13.5.6",  
  "react": "^18.2.0",  
  "prisma": "^5.7.0",  
  "@prisma/client": "^5.7.0",  
  "next-auth": "4.24.5",  
  "typescript": "^5.3.0",  
  "tailwindcss": "^3.3.0"  
}

* **Authentication:** NextAuth.js with Google OAuth and a Prisma adapter.  
* **UI:** Radix UI, Tailwind CSS, Lucide React (icons), and Recharts (data visualization).  
* **Database ORM:** Prisma.  
* **Database Provider:** PostgreSQL.

## **3\. Infrastructure Setup**

### **Railway Deployment Configuration**

#### **Original Project (Production)**

* **Database:** MySQL  
* **Host:** shortline.proxy.rlwy.net:29427  
* **Status:** **Production (DO NOT MODIFY)**

#### **Development Copy (V2)**

* **Database:** PostgreSQL  
* **Host:** switchback.proxy.rlwy.net:49562  
* **Status:** Development / Testing

### **Deployment Control File (railway.json)**

{  
  "$schema": "\[https://railway.app/railway.schema.json\](https://railway.app/railway.schema.json)",  
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

## **4\. Database Architecture**

The database provider for the development environment has been successfully changed from MySQL to PostgreSQL.

### **Schema Overview (prisma/schema.prisma)**

// prisma/schema.prisma

generator client {  
  provider \= "prisma-client-js"  
}

datasource db {  
  provider \= "postgresql" // Updated from "mysql"  
  url      \= env("DATABASE\_URL")  
}

// ... all models remain the same

### **Migration History**

The original MySQL migration history was deleted and replaced with a new, clean migration history for PostgreSQL.

## **5\. Recent Challenges & Resolutions**

### **Challenge 1: Cloud Database Migration (MySQL to PostgreSQL)**

* **Goal:** Migrate the Railway development database from MySQL to PostgreSQL.  
* **Sub-Challenge A: Initial Schema Creation:**  
  * **Error:** P1001: Can't reach database server at postgres.railway.internal:5432 when running prisma migrate dev.  
  * **Root Cause:** Railway's internal network URLs are not accessible from a local machine. Attempts to use railway connect or railway run failed due to persistent networking issues.  
  * **Resolution:** The **public-facing database URL** was temporarily used in the local .env file to allow the local machine to connect and run the initial migration. The .env was immediately reverted to the internal URL afterward.  
* **Sub-Challenge B: Data Transfer:**  
  * **Error:** The data migration script (migrate-data.js) failed with ENOTFOUND errors when run via railway run.  
  * **Root Cause:** Same persistent internal networking issue preventing the script from finding the database services.  
  * **Resolution:** The script was run **locally**, with the .env file temporarily configured to use the **public URLs** for both the source MySQL and destination PostgreSQL databases. This allowed a direct connection for the data transfer.

### **Challenge 2: Local Development Environment Setup**

* **Goal:** Configure a local development environment (npm run dev) that mirrors the cloud setup.  
* **Sub-Challenge A: Server Errors on Startup:**  
  * **Error:** 500 Internal Server Error on pages fetching data (login, dashboard).  
  * **Root Cause:** The local development server was attempting to use the internal Railway DATABASE\_URL from the .env file, which is unreachable from localhost.  
  * **Resolution:** A local PostgreSQL server was set up. The .env file is now configured to point to this local database during development.  
* **Sub-Challenge B: Populating Local Database with Test Data:**  
  * **Error:** The initial local database was empty, containing no users or project data for testing.  
  * **Root Cause:** The first attempt to back up the Railway database using pg\_dump resulted in an empty .sql file because the data migration (Challenge 1B) had not yet been run correctly.  
  * **Resolution:**  
    1. The data migration script was successfully run using public URLs (see Challenge 1B).  
    2. A new backup was created from the now-populated Railway database using pg\_dump and the **public database URL**.  
    3. This new, data-filled backup file (railway\_backup\_with\_data.sql) was successfully restored to the local PostgreSQL database using psql.

## **6\. Development Workflow & Safety Systems**

### **Local Development**

1. Ensure your .env file's DATABASE\_URL points to your local PostgreSQL instance:  
   DATABASE\_URL="postgresql://postgres:YOUR\_LOCAL\_PASSWORD@localhost:5432/project\_planning\_v2\_dev?schema=public"

2. Run the application: npm run dev.

### **Making Database Changes**

\# 1\. Create a new migration file against your LOCAL database  
npx prisma migrate dev \--name your\_migration\_name

\# 2\. Validate the migration  
npm run db:validate

Deployment to Railway will automatically apply new migrations via the start:prod script.

## **7\. Directory Structure**

project-planning-V2/  
├── .husky/  
├── backups/  
├── documentation/  
├── logs/  
├── node\_modules/  
├── prisma/  
│   ├── migrations/           \# (CRITICAL) PostgreSQL migration history  
│   └── schema.prisma         \# Database schema (provider \= "postgresql")  
├── public/  
├── scripts/  
│   ├── migrate-data.js       \# (USED ONCE) For MySQL \-\> PG data transfer  
│   ├── backup-database.js  
│   └── validate-migration.js  
├── src/  
│   ├── app/  
│   ├── components/  
│   ├── hooks/  
│   ├── lib/  
│   └── types/  
├── .env                      \# (CRITICAL) Must be configured for local vs. cloud  
├── .gitignore  
├── package.json  
├── railway.json  
├── railway\_backup\_with\_data.sql \# Backup of cloud DB for local restore  
└── tsconfig.json

## **8\. Key Files for Review**

* **package.json**: For a list of all project scripts and dependencies.  
* **railway.json**: Defines the exact build and start commands for deployment.  
* **prisma/schema.prisma**: The source of truth for the database schema.  
* **.env**: For all environment-specific variables.  
* **scripts/**: Contains all custom safety and utility scripts.