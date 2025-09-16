import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ valid: false, error: 'No file provided' });
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ valid: false, error: 'File must be an image' });
    }

    // Check file size (10MB limit)
    if (file.size > 10485760) {
      return NextResponse.json({ valid: false, error: 'File size must be less than 10MB' });
    }

    // Validate image by reading header
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Check for valid image headers
    const isValidImage = validateImageHeader(uint8Array, file.type);

    if (!isValidImage) {
      return NextResponse.json({ valid: false, error: 'Invalid or corrupted image file' });
    }

    return NextResponse.json({ 
      valid: true, 
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    });

  } catch (error: any) {
    console.error('File validation error:', error);
    return NextResponse.json({ valid: false, error: 'File validation failed' });
  }
}

function validateImageHeader(buffer: Uint8Array, mimeType: string): boolean {
  if (buffer.length < 8) return false;

  // JPEG validation
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  }

  // PNG validation
  if (mimeType === 'image/png') {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  }

  // GIF validation
  if (mimeType === 'image/gif') {
    return (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) &&
           (buffer[3] === 0x38 && (buffer[4] === 0x37 || buffer[4] === 0x39));
  }

  // WebP validation
  if (mimeType === 'image/webp') {
    return buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
           buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
  }

  return false;
}
