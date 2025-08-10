import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

// ✅ NEW: The GET handler for fetching all documents for the current user.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const documents = await prisma.document.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents.' }, { status: 500 });
  }
}

// ✅ FIXED: The POST handler has been refactored to remove 'formidable'
// and use the built-in req.formData() method, which is compatible with the Next.js App Router.
export async function POST(req: NextRequest) {
  // 1. Authenticate the user
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  // 2. Parse the incoming form data using the built-in method
  const data = await req.formData();
  const file: File | null = data.get('file') as unknown as File;
  const title: string | null = data.get('title') as string;

  // 3. Validate that we received a file and a title
  if (!file || !title) {
    return NextResponse.json({ error: 'Missing file or title.' }, { status: 400 });
  }

  // 4. Get the upload directory and ensure it exists
  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads');
  try {
    await fs.promises.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  // 5. Create a unique filename and path
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileExtension = path.extname(file.name);
  const fileNameWithoutExt = path.basename(file.name, fileExtension);
  const uniqueFilename = `${fileNameWithoutExt.replace(/\s+/g, '-')}-${Date.now()}${fileExtension}`;
  const filePath = path.join(uploadDir, uniqueFilename);

  // 6. Write the file to the filesystem
  await writeFile(filePath, buffer);

  // 7. Create the document record in the database
  try {
    const newDocument = await prisma.document.create({
      data: {
        userId: userId,
        title: title,
        name: file.name, // The original name of the file
        type: file.type, // The MIME type of the file
        size: file.size, // The size of the file in bytes
        path: filePath, // The full path to where the file was saved on the server
      },
    });
    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    console.error('Error creating document in database:', error);
    // If we fail to create the database record, delete the orphaned file.
    await fs.promises.unlink(filePath);
    return NextResponse.json({ error: 'Failed to save document record.' }, { status: 500 });
  }
}
