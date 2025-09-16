import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const BANNER_DIR = path.join(process.cwd(), 'public', 'banner');

// Ensure banner directory exists
async function ensureBannerDir() {
  try {
    await fs.access(BANNER_DIR);
  } catch {
    await fs.mkdir(BANNER_DIR, { recursive: true });
  }
}

// GET - List all banners
export async function GET() {
  try {
    await ensureBannerDir();
    
    const files = await fs.readdir(BANNER_DIR);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    const banners = await Promise.all(
      imageFiles.map(async (file) => {
        const filePath = path.join(BANNER_DIR, file);
        const stats = await fs.stat(filePath);
        
        return {
          name: file,
          path: `/banner/${file}`,
          url: `/banner/${file}`,
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
        };
      })
    );

    // Sort by last modified (newest first)
    banners.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

    return NextResponse.json({ banners });
  } catch (error: any) {
    console.error('Error listing banners:', error);
    return NextResponse.json(
      { error: 'Failed to list banners' },
      { status: 500 }
    );
  }
}

// POST - Upload banners
export async function POST(request: NextRequest) {
  try {
    await ensureBannerDir();
    
    const formData = await request.formData();
    const files = formData.getAll('banners') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    let uploaded = 0;
    const results = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        results.push({ filename: file.name, status: 'skipped', reason: 'Not an image file' });
        continue;
      }

      // Sanitize filename
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = path.join(BANNER_DIR, sanitizedName);

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);
        
        uploaded++;
        results.push({ filename: sanitizedName, status: 'uploaded' });
      } catch (error) {
        results.push({ filename: file.name, status: 'failed', reason: 'Write error' });
      }
    }

    return NextResponse.json({
      uploaded,
      total: files.length,
      results
    });

  } catch (error: any) {
    console.error('Error uploading banners:', error);
    return NextResponse.json(
      { error: 'Failed to upload banners' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a banner
export async function DELETE(request: NextRequest) {
  try {
    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(BANNER_DIR, sanitizedFilename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete the file
    await fs.unlink(filePath);

    return NextResponse.json({ 
      success: true, 
      message: `Banner ${sanitizedFilename} deleted successfully` 
    });

  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
