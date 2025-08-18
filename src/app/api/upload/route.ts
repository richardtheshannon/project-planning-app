import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// This line tells Next.js to always run this route dynamically.
export const dynamic = 'force-dynamic';

/**
 * @description Handles file uploads for logos and icons.
 * Files are saved to a persistent volume on production (via LOGO_UPLOAD_DIR)
 * or to a local 'public/uploads' directory during development.
 */
export async function POST(request: Request) {
  try {
    // 1. Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file');

    // Use a type guard to ensure we have a File object
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file was uploaded or the upload format is incorrect.' }, { status: 400 });
    }

    // 3. Validate file type and size
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Uploaded file is not an image.' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json({ error: 'File size exceeds the 5MB limit.' }, { status: 400 });
    }

    // 4. Define the upload directory with a fallback for local development
    // On Railway, LOGO_UPLOAD_DIR will be set. Locally, it will use public/uploads.
    const uploadDir = process.env.LOGO_UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure the upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // 5. Create a unique filename and file path
    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const finalFilePath = path.join(uploadDir, uniqueFilename);

    // 6. Convert file to a Buffer and write to the file system
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(finalFilePath, buffer);

    console.log(`[API/UPLOAD] File uploaded successfully to: ${finalFilePath}`);

    // 7. Return the public URL that the client can use to access the file
    const fileUrl = `/logos/${uniqueFilename}`;
    
    return NextResponse.json({ url: fileUrl });

  } catch (error) {
    console.error('[API/UPLOAD] File upload failed:', error);
    // IMPORTANT: Always return errors in JSON format
    return NextResponse.json(
      { error: 'An internal error occurred during file upload.' }, 
      { status: 500 }
    );
  }
}
