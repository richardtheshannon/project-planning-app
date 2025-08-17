import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  // Ensure the user is authenticated before allowing uploads
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Not authenticated', { status: 401 });
  }

  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
    }

    // Basic validation for file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ success: false, error: 'Invalid file type. Only JPG, PNG, GIF, SVG are allowed.' }, { status: 400 });
    }

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxFileSize) {
        return NextResponse.json({ success: false, error: 'File is too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // --- ALIGNED LOGIC FOR DETERMINING UPLOAD PATH ---
    // Use a specific environment variable for logos.
    // Fallback to the local public directory for development.
    const logoUploadDir = process.env.LOGO_UPLOAD_DIR;
    const uploadDir = logoUploadDir 
      ? logoUploadDir
      : path.join(process.cwd(), 'public/uploads');

    // Ensure the directory exists before writing the file
    await mkdir(uploadDir, { recursive: true });

    // Create a unique filename to prevent overwrites
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const filePath = path.join(uploadDir, filename);

    // Write the file to the server's filesystem
    await writeFile(filePath, buffer);
    console.log(`File uploaded to ${filePath}`);

    // The public path for the <img> src attribute is always /uploads/filename
    // because the web server serves the 'public' directory at the root.
    const publicPath = `/uploads/${filename}`;
    return NextResponse.json({ success: true, path: publicPath });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong during the upload.' }, { status: 500 });
  }
}
