import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images only.' 
      }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum size is 10MB.' 
      }, { status: 400 });
    }

    // Check if Pinata API key is configured
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

    if (!pinataApiKey || !pinataSecretApiKey) {
      return NextResponse.json({ 
        error: 'IPFS upload not configured. Please set PINATA_API_KEY and PINATA_SECRET_API_KEY environment variables.' 
      }, { status: 500 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate image dimensions (server-side check)
    try {
      // Create a temporary image to check dimensions
      const sharp = require('sharp');
      const metadata = await sharp(buffer).metadata();
      
      if (metadata.width && metadata.height) {
        if (metadata.width < 400 || metadata.height < 300) {
          return NextResponse.json({ 
            error: `Image dimensions must be at least 400x300 pixels. Current image is ${metadata.width}x${metadata.height} pixels.` 
          }, { status: 400 });
        }
      }
    } catch (sharpError) {
      // If sharp is not available, skip server-side dimension validation
      console.warn('Sharp not available for server-side image validation:', sharpError);
    }

    // Create form data for Pinata
    const pinataFormData = new FormData();
    const blob = new Blob([buffer], { type: file.type });
    pinataFormData.append('file', blob, file.name);

    // Add metadata
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedBy: 'NYALTX-Admin',
        uploadedAt: new Date().toISOString(),
        fileType: file.type,
        fileSize: file.size.toString()
      }
    });
    pinataFormData.append('pinataMetadata', metadata);

    // Upload to Pinata IPFS
    const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey,
      },
      body: pinataFormData,
    });

    if (!pinataResponse.ok) {
      const errorData = await pinataResponse.text();
      console.error('Pinata upload error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to upload to IPFS. Please try again.' 
      }, { status: 500 });
    }

    const pinataData = await pinataResponse.json();
    
    return NextResponse.json({
      success: true,
      hash: pinataData.IpfsHash,
      url: `https://ipfs.io/ipfs/${pinataData.IpfsHash}`,
      size: file.size,
      name: file.name,
      type: file.type
    });

  } catch (error: any) {
    console.error('IPFS upload error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during IPFS upload' 
    }, { status: 500 });
  }
}
