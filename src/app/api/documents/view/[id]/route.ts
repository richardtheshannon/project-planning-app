import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import mime from 'mime-types'; // We'll need to install this small helper library

// The GET handler for securely serving a single file.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // 1. Authenticate the user
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;
  const documentId = params.id;

  try {
    // 2. Find the document record to get its path and ensure it belongs to the user
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
        userId: userId, // CRITICAL: Security check
      },
    });

    if (!document) {
      return new Response('Document not found or access denied.', { status: 404 });
    }

    // 3. Check if the file exists at the stored path
    if (!fs.existsSync(document.path)) {
      console.error(`File not found on server at path: ${document.path}`);
      return new Response('File not found on server.', { status: 404 });
    }

    // 4. Read the file from the filesystem
    const fileBuffer = fs.readFileSync(document.path);

    // 5. Determine the content type
    const contentType = mime.lookup(document.path) || 'application/octet-stream';

    // 6. Create and return the response with the correct headers
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `inline; filename="${document.name}"`);

    return new Response(fileBuffer, { status: 200, headers });

  } catch (error) {
    console.error('Error serving document:', error);
    return new Response('An error occurred while serving the document.', { status: 500 });
  }
}
