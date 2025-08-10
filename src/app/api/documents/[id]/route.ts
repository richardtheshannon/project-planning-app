import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import fs from 'fs';

// The DELETE handler for deleting a single document.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // 1. Authenticate the user
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const documentId = params.id;

  try {
    // 2. Find the document record in the database to ensure it exists and belongs to the user.
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
        userId: userId, // CRITICAL: Security check to ensure users can only delete their own documents.
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found or you do not have permission to delete it.' }, { status: 404 });
    }

    // 3. Delete the physical file from the filesystem.
    // We wrap this in a try/catch in case the file was already deleted somehow.
    try {
      await fs.promises.unlink(document.path);
    } catch (fileError: any) {
      // If the file doesn't exist (ENOENT), we can ignore the error and proceed to delete the DB record.
      // For any other error, we log it but still proceed, as the primary goal is to remove the DB record.
      if (fileError.code !== 'ENOENT') {
        console.error(`Error deleting file ${document.path}:`, fileError);
      }
    }

    // 4. Delete the document record from the database.
    await prisma.document.delete({
      where: {
        id: documentId,
      },
    });

    return NextResponse.json({ message: 'Document deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'An error occurred while deleting the document.' }, { status: 500 });
  }
}
