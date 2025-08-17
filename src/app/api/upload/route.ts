import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import formidable, { File } from 'formidable';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Disable the default Next.js body parser to allow formidable to handle the stream.
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * @description Handles file uploads for logos and icons.
 * It uses the 'formidable' library to parse multipart/form-data.
 * Files are saved to a persistent volume specified by an environment variable.
 */
export async function POST(request: Request) {
  // 1. Authenticate the user
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Not authenticated', { status: 401 });
  }

  try {
    // 2. Define the upload directory from environment variables
    // This path should point to your mounted persistent volume on Railway.
    const uploadDir = process.env.LOGO_UPLOAD_DIR;
    if (!uploadDir) {
        console.error('CRITICAL: LOGO_UPLOAD_DIR environment variable is not set.');
        return new NextResponse('Server configuration error.', { status: 500 });
    }

    // Ensure the upload directory exists.
    await fs.mkdir(uploadDir, { recursive: true });

    // 3. Parse the incoming form data using formidable
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      filter: function ({ mimetype }) {
        // Ensure we only accept image files
        return mimetype?.includes('image') || false;
      },
    });

    // formidable's parse method needs a Node.js-style request object.
    // We cast the Next.js request to 'any' to make it compatible.
    const [fields, files] = await form.parse(request as any);

    const file = (Array.isArray(files.file) ? files.file[0] : files.file) as File | undefined;

    if (!file) {
      return NextResponse.json({ error: 'No file was uploaded.' }, { status: 400 });
    }

    // 4. Create a unique filename and move the file to its final destination
    // Formidable saves the file with a temporary name, so we rename it.
    const uniqueFilename = `${Date.now()}-${file.originalFilename?.replace(/\s+/g, '_')}`;
    const finalFilePath = path.join(uploadDir, uniqueFilename);
    await fs.rename(file.filepath, finalFilePath);

    console.log(`File uploaded successfully to: ${finalFilePath}`);

    // 5. Return the URL that the client can use to access the file.
    // This URL points to our dedicated file-serving route.
    const fileUrl = `/logos/${uniqueFilename}`;
    
    // IMPORTANT: The client-side form expects a JSON response with a 'url' property.
    return NextResponse.json({ url: fileUrl });

  } catch (error) {
    console.error('File upload failed:', error);
    return new NextResponse('An error occurred during file upload.', { status: 500 });
  }
}
