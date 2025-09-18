import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokenId, tokenType, userAddress, socialLinks } = body;

    // Validate required fields
    if (!tokenId || !tokenType || !userAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['registered', 'created'].includes(tokenType)) {
      return NextResponse.json({ error: 'Invalid token type' }, { status: 400 });
    }

    // Validate social links structure
    const allowedSocialFields = ['website', 'twitter', 'telegram', 'discord', 'github', 'youtube', 'videoLink'];
    const validatedSocialLinks: any = {};
    
    for (const [key, value] of Object.entries(socialLinks || {})) {
      if (allowedSocialFields.includes(key) && typeof value === 'string') {
        validatedSocialLinks[key] = value.trim() || undefined;
      }
    }

    const now = new Date().toISOString();

    if (tokenType === 'registered') {
      // Update registered token
      const col = await getCollection<any>('token_registrations');
      
      // Find the token and verify ownership
      const token = await col.findOne({ id: tokenId });
      if (!token) {
        return NextResponse.json({ error: 'Token not found' }, { status: 404 });
      }

      // Check if user owns this token
      if (token.submittedByAddressLower !== userAddress.toLowerCase()) {
        return NextResponse.json({ error: 'Unauthorized: You can only update your own tokens' }, { status: 403 });
      }

      // Update social links
      const updateResult = await col.updateOne(
        { id: tokenId },
        { 
          $set: { 
            ...validatedSocialLinks,
            updatedAt: now 
          } 
        }
      );

      if (updateResult.matchedCount === 0) {
        return NextResponse.json({ error: 'Token not found' }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Social links updated successfully',
        tokenType: 'registered'
      });

    } else if (tokenType === 'created') {
      // Update created token (pump.fun tokens)
      const col = await getCollection<any>('created_tokens');
      
      // Find the token and verify ownership
      const token = await col.findOne({ id: tokenId });
      if (!token) {
        return NextResponse.json({ error: 'Token not found' }, { status: 404 });
      }

      // Check if user owns this token
      if (token.createdByAddressLower !== userAddress.toLowerCase()) {
        return NextResponse.json({ error: 'Unauthorized: You can only update your own tokens' }, { status: 403 });
      }

      // Update social links
      const updateResult = await col.updateOne(
        { id: tokenId },
        { 
          $set: { 
            ...validatedSocialLinks,
            updatedAt: now 
          } 
        }
      );

      if (updateResult.matchedCount === 0) {
        return NextResponse.json({ error: 'Token not found' }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Social links updated successfully',
        tokenType: 'created'
      });
    }

  } catch (error) {
    console.error('Update social links error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
