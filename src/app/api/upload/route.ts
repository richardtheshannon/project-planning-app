import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
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

    // Create a unique filename to prevent overwrites
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const uploadPath = path.join(process.cwd(), 'public/uploads', filename);

    // Write the file to the server's filesystem
    await writeFile(uploadPath, buffer);
    console.log(`File uploaded to ${uploadPath}`);

    // Return the public path that can be used in an <img> src attribute
    const publicPath = `/uploads/${filename}`;
    return NextResponse.json({ success: true, path: publicPath });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong during the upload.' }, { status: 500 });
  }
}
