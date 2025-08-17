import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  console.log('Upload API endpoint hit.'); // Log to confirm the route is reached

  // Ensure the user is authenticated before allowing uploads
  const session = await getServerSession(authOptions);
  if (!session) {
    console.error('Upload rejected: User not authenticated.');
    return new NextResponse('Not authenticated', { status: 401 });
  }

  let data;
  try {
    data = await request.formData();
    console.log('Successfully parsed formData.');
  } catch (parseError) {
    console.error('Error parsing formData:', parseError);
    return NextResponse.json({ success: false, error: 'Error parsing form data.' }, { status: 400 });
  }

  try {
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      console.error('Upload failed: No file found in formData.');
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
    }
    console.log(`File received: ${file.name}, Size: ${file.size}, Type: ${file.type}`);


    // Basic validation for file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
        console.error(`Upload rejected: Invalid file type - ${file.type}`);
        return NextResponse.json({ success: false, error: 'Invalid file type. Only JPG, PNG, GIF, SVG are allowed.' }, { status: 400 });
    }

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxFileSize) {
        console.error(`Upload rejected: File size (${file.size}) exceeds limit of ${maxFileSize}`);
        return NextResponse.json({ success: false, error: 'File is too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // --- ALIGNED LOGIC FOR DETERMINING UPLOAD PATH ---
    const logoUploadDir = process.env.LOGO_UPLOAD_DIR;
    if (!logoUploadDir) {
        console.warn('LOGO_UPLOAD_DIR environment variable not set. Falling back to local path. This will not work in production.');
    }
    const uploadDir = logoUploadDir 
      ? logoUploadDir
      : path.join(process.cwd(), 'public/uploads');
    
    console.log(`Determined upload directory: ${uploadDir}`);

    // Ensure the directory exists before writing the file
    await mkdir(uploadDir, { recursive: true });

    // Create a unique filename to prevent overwrites
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const filePath = path.join(uploadDir, filename);

    // Write the file to the server's filesystem
    await writeFile(filePath, buffer);
    console.log(`File successfully uploaded to ${filePath}`);

    // The public path for the <img> src attribute is always /uploads/filename
    const publicPath = `/uploads/${filename}`;
    return NextResponse.json({ success: true, path: publicPath });

  } catch (error) {
    // Log the full error object for detailed debugging
    console.error('An unexpected error occurred during upload:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong during the upload.' }, { status: 500 });
  }
}
