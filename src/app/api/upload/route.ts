import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// This line tells Next.js to always run this route dynamically.
export const dynamic = 'force-dynamic';

/**
 * @description Handles file uploads for logos and icons using modern formData() method.
 * Files are saved to a persistent volume specified by an environment variable.
 */
export async function POST(request: Request) {
  // 1. Authenticate the user
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Not authenticated', { status: 401 });
  }

  try {
    // 2. Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file was uploaded.' }, { status: 400 });
    }

    // 3. Validate file type and size
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Uploaded file is not an image.' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json({ error: 'File size exceeds the 5MB limit.' }, { status: 400 });
    }

    // 4. Define the upload directory and ensure it exists
    const uploadDir = process.env.LOGO_UPLOAD_DIR;
    if (!uploadDir) {
        console.error('CRITICAL: LOGO_UPLOAD_DIR environment variable is not set.');
        return new NextResponse('Server configuration error.', { status: 500 });
    }
    await fs.mkdir(uploadDir, { recursive: true });

    // 5. Create a unique filename and file path
    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const finalFilePath = path.join(uploadDir, uniqueFilename);

    // 6. Convert file to a Buffer and write to the persistent volume
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(finalFilePath, buffer);

    console.log(`File uploaded successfully to: ${finalFilePath}`);

    // 7. Return the URL that the client can use to access the file
    const fileUrl = `/logos/${uniqueFilename}`;
    
    return NextResponse.json({ url: fileUrl });

  } catch (error) {
    console.error('File upload failed:', error);
    return new NextResponse('An error occurred during file upload.', { status: 500 });
  }
}
