# **Implementation Plan: File Uploads to Railway Volume**

Document Version: 1.1  
Date: August 10, 2025

## **1\. Overview**

This document outlines a complete, step-by-step plan for implementing file uploads. The system will allow authenticated users to upload files, which will be stored in the dedicated Railway volume (/data) and tracked in the MySQL database.

This version incorporates requirements for custom titles, file deletion, and a comprehensive, interactive data table for display.

The architecture consists of four main parts:

1. **Database:** A new Document model to store metadata for each file.  
2. **Backend:** API routes to handle document creation (POST) and deletion (DELETE).  
3. **Frontend (Upload):** A dialog component for uploading a file and setting its title.  
4. **Frontend (Display):** An interactive data table to list, search, sort, and manage all uploaded documents.

## **2\. Feature Implementation Breakdown**

| Feature | Implementation Details |
| :---- | :---- |
| **Take Photo (Mobile)** | The \<input type="file"\> tag will include the capture="environment" attribute, which prompts mobile browsers to open the camera. |
| **Allowed File Types** | The file input will also have an accept=".pdf,.csv,.md,.doc,.jpg,.png" attribute for frontend filtering. The backend API will perform a final check on the file's MIME type for security. |
| **Custom Upload Title** | A new title field will be added to the Document model in the database. The upload dialog will have a text input for this. |
| **Link to Open File** | We will create a server-side route that securely serves the file from the volume. The data table will link to this route with target="\_blank". |
| **Delete from Frontend** | A DELETE button in the data table will call a new API endpoint (/api/documents/\[id\]) which will delete both the file from the volume and the record from the database. |
| **Sortable/Searchable Table** | We will create a new DocumentsDataTable.tsx component, using the exact same useState/useMemo pattern as your ExpensesDataTable.tsx for a consistent user experience. |

## **3\. Database Schema (prisma/schema.prisma)**

We will add a title field to the Document model to store the user-provided title.

**Action:** Add the following model to your prisma/schema.prisma file.

// Add this new model to your schema file

model Document {  
  id        String   @id @default(cuid())  
  title     String   // User-provided custom title for the document  
  name      String   // Original name of the file, e.g., "Website Proposal.pdf"  
  type      String   // MIME type, e.g., "application/pdf"  
  size      Int      // Size of the file in bytes  
  path      String   // The absolute path where the file is stored in the volume

  userId    String  
  user      User     @relation(fields: \[userId\], references: \[id\], onDelete: Cascade)

  createdAt DateTime @default(now())  
  updatedAt DateTime @updatedAt  
}

// Also, add the corresponding relation to your User model:  
model User {  
  // ... other fields  
  documents Document\[\] // Add this line  
}

After adding this, you will run a database migration locally:  
npx prisma migrate dev \--name add\_document\_model\_with\_title

## **4\. Backend API Routes**

We now need two sets of API routes: one for creating documents and one for managing a specific document by its ID.

### **Creation: src/app/api/documents/route.ts**

This route handles the POST request for new uploads.

**Action:**

1. **Install formidable:**  
   npm install formidable  
   npm install \-D @types/formidable

2. **Create the API route file.** The logic will parse the incoming multipart/form-data to get both the file and the custom title text field.

### **Deletion: src/app/api/documents/\[id\]/route.ts**

This dynamic route will handle deleting a specific document.

**Action:**

* **Create the DELETE handler.** This function will:  
  1. Authenticate the user.  
  2. Find the document in the database to get its path.  
  3. Use Node.js's fs module to delete the file from the filesystem (e.g., fs.unlinkSync(document.path)).  
  4. Delete the document's record from the database using Prisma.

## **5\. Frontend Components**

### **Upload Dialog: src/components/documents/UploadDocumentDialog.tsx**

This component will now have two form fields: one for the title and one for the file.

### **Display Table: src/components/documents/DocumentsDataTable.tsx**

This is a new component that will be the centerpiece of your /dashboard/documents page. It will be a client component ("use client") and will:

* Fetch all documents for the user.  
* Use the established useState/useMemo pattern for client-side searching and sorting.  
* Render rows with columns for Title, File Name, Type, Size, and Upload Date.  
* Include a "Delete" button for each row.

## **6\. Local vs. Railway Environment Strategy**

This strategy remains unchanged and is crucial for the plan.

1. **In your .env file (for local development):**  
   UPLOAD\_DIR=./public/uploads

2. **In your Railway service variables:**  
   UPLOAD\_DIR=/data/uploads

Our API route will read process.env.UPLOAD\_DIR to know where to save the files, allowing the same code to work seamlessly in both environments.