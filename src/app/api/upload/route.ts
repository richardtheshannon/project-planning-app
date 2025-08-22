import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

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

    // *** FINAL FIX ***
    // We can't use `instanceof File` on the server because the File object
    // doesn't exist in all Node.js environments.
    // Instead, we use "duck typing" to check if the object has the properties of a file.
    if (!file || typeof file === 'string' || !('arrayBuffer' in file) || !('name' in file)) {
      return NextResponse.json({ error: 'No file was uploaded or the upload format is incorrect.' }, { status: 400 });
    }

    // We can now safely treat `file` as a File-like object.
    const uploadedFile = file as File;

    // 3. Validate file type and size
    if (!uploadedFile.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Uploaded file is not an image.' }, { status: 400 });
    }
    if (uploadedFile.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json({ error: 'File size exceeds the 5MB limit.' }, { status: 400 });
    }

    // 4. Define the upload directory with a fallback for local development
    const uploadDir = process.env.LOGO_UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure the upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // 5. Create a unique filename and file path
    const uniqueFilename = `${Date.now()}-${uploadedFile.name.replace(/\s+/g, '_')}`;
    const finalFilePath = path.join(uploadDir, uniqueFilename);

    // 6. Convert file to a Buffer and write to the file system
    const buffer = Buffer.from(await uploadedFile.arrayBuffer());
    await fs.writeFile(finalFilePath, buffer);

    console.log(`[API/UPLOAD] File uploaded successfully to: ${finalFilePath}`);

    // 7. Return the public URL that the client can use to access the file
    const fileUrl = `/logos/${uniqueFilename}`;
    
    return NextResponse.json({ url: fileUrl });

  } catch (error) {
    console.error('[API/UPLOAD] File upload failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    
    return NextResponse.json(
      { 
        error: 'An internal error occurred during file upload.',
        details: errorMessage
      }, 
      { status: 500 }
    );
  }
}
