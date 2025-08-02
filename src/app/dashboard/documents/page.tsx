import { prisma } from "@/lib/prisma";
import DocumentsTable from "./DocumentsTable";

// This function fetches all file records from the database
// and includes related project and uploader names.
async function getFiles() {
  const files = await prisma.file.findMany({
    include: {
      project: {
        select: {
          name: true,
        },
      },
      uploader: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    }
  });
  return files;
}

export default async function DocumentsPage() {
  const files = await getFiles();

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">All Documents</h2>
        <p className="text-gray-600">
          Browse and manage all files uploaded across all projects.
        </p>
      </div>
      {/* We will pass the fetched data to a client component for interaction */}
      <DocumentsTable files={files} />
    </div>
  );
}
