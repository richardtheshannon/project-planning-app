import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const uploadDir = process.env.LOGO_UPLOAD_DIR || path.join(process.cwd(), 'public/uploads');
    
    console.log(`[DEBUG] Checking directory: ${uploadDir}`);
    
    const files = await readdir(uploadDir);
    
    return NextResponse.json({
      directory: uploadDir,
      files: files,
      count: files.length,
      env: process.env.LOGO_UPLOAD_DIR
    });
  } catch (error: any) {
    console.error('[DEBUG] Error reading directory:', error);
    return NextResponse.json({
      error: error.message,
      code: error.code,
      directory: process.env.LOGO_UPLOAD_DIR || 'not set'
    }, { status: 500 });
  }
}