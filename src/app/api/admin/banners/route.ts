import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const BUCKET_NAME = 'banners';

// Ensure bucket exists
async function ensureBucket() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
  
  if (!bucketExists) {
    const { error } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 10485760, // 10MB
    });
    if (error) {
      console.error('Error creating bucket:', error);
    }
  }
}

// GET - List all banners
export async function GET() {
  try {
    await ensureBucket();
    
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    const { data: files, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }

    const banners = files?.map((file) => {
      const { data: publicUrl } = supabaseAdmin!.storage
        .from(BUCKET_NAME)
        .getPublicUrl(file.name);

      return {
        name: file.name,
        path: file.name,
        url: publicUrl.publicUrl,
        size: file.metadata?.size || 0,
        lastModified: file.created_at || new Date().toISOString(),
      };
    }) || [];

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
    await ensureBucket();
    
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

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
      const timestamp = Date.now();
      const uniqueName = `${timestamp}_${sanitizedName}`;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        
        const { error } = await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .upload(uniqueName, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          results.push({ filename: file.name, status: 'failed', reason: error.message });
        } else {
          uploaded++;
          results.push({ filename: uniqueName, status: 'uploaded' });
        }
      } catch (error: any) {
        results.push({ filename: file.name, status: 'failed', reason: error.message || 'Upload error' });
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
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Delete the file from Supabase storage
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([filename]);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete banner: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Banner ${filename} deleted successfully` 
    });

  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
