import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import mime from 'mime-types';

// This is a GET-only route for serving files.
export async function GET(
  request: Request,
  { params }: { params: { filename: string[] } }
) {
  try {
    const filename = params.filename.join('/');
    console.log(`[SERVE] Attempting to serve file: ${filename}`);

    if (!filename) {
      console.log('[SERVE] No filename provided');
      return new NextResponse('Filename is required', { status: 400 });
    }

    // Determine the base directory for uploads from environment variables,
    // falling back to the local public directory for development.
    const logoUploadDir = process.env.LOGO_UPLOAD_DIR;
    const uploadDir = logoUploadDir 
      ? logoUploadDir
      : path.join(process.cwd(), 'public/uploads');
    
    console.log(`[SERVE] Upload directory: ${uploadDir}`);
    console.log(`[SERVE] LOGO_UPLOAD_DIR env: ${process.env.LOGO_UPLOAD_DIR}`);
      
    const filePath = path.join(uploadDir, filename);
    console.log(`[SERVE] Full file path: ${filePath}`);

    // Read the file from the persistent volume.
    const buffer = await readFile(filePath);
    console.log(`[SERVE] File read successfully, size: ${buffer.length} bytes`);

    // Determine the content type from the filename.
    const contentType = mime.lookup(filename) || 'application/octet-stream';
    console.log(`[SERVE] Content type: ${contentType}`);

    // Return the file content with the correct headers.
    return new NextResponse(Buffer.from(buffer) as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    // If the file doesn't exist (ENOENT), return a 404.
    if (error.code === 'ENOENT') {
      console.error(`[SERVE] File not found: ${params.filename.join('/')}`);
      console.error(`[SERVE] Error details:`, error);
      return new NextResponse('File not found', { status: 404 });
    }
    // For any other errors, return a 500.
    console.error('[SERVE] Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}