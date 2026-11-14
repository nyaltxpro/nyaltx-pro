import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET all newshub banners
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const collection = db.collection('newshub_banners');

    const banners = await collection
      .find({})
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json({ banners });
  } catch (error: any) {
    console.error('Error fetching newshub banners:', error);
    return NextResponse.json({ error: 'Failed to fetch newshub banners' }, { status: 500 });
  }
}

// POST create a new banner
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const collection = db.collection('newshub_banners');

    const body = await request.json();
    const {
      title,
      description = '',
      category = 'NYAX',
      imageUrl = '',
      gradientIndex = 0,
      linkUrl = '',
      isSponsored = false,
      isActive = true,
      displayOrder = 0,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const bannerDoc = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'NYAX',
      imageUrl: imageUrl.trim(),
      gradientIndex: Number(gradientIndex) || 0,
      linkUrl: linkUrl.trim(),
      isSponsored: Boolean(isSponsored),
      isActive: Boolean(isActive),
      displayOrder: Number(displayOrder) || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(bannerDoc);

    return NextResponse.json({
      success: true,
      message: 'Newshub banner created successfully',
      banner: { ...bannerDoc, _id: result.insertedId },
    });
  } catch (error: any) {
    console.error('Error creating newshub banner:', error);
    return NextResponse.json({ error: 'Failed to create newshub banner' }, { status: 500 });
  }
}

// PUT update a banner
export async function PUT(request: NextRequest) {
  try {
    const db = await getDb();
    const collection = db.collection('newshub_banners');

    const body = await request.json();
    const {
      id,
      title,
      description,
      category,
      imageUrl,
      gradientIndex,
      linkUrl,
      isSponsored,
      isActive,
      displayOrder,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    const updateDoc: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateDoc.title = title.trim();
    if (description !== undefined) updateDoc.description = description.trim();
    if (category !== undefined) updateDoc.category = category.trim();
    if (imageUrl !== undefined) updateDoc.imageUrl = imageUrl.trim();
    if (gradientIndex !== undefined) updateDoc.gradientIndex = Number(gradientIndex);
    if (linkUrl !== undefined) updateDoc.linkUrl = linkUrl.trim();
    if (isSponsored !== undefined) updateDoc.isSponsored = Boolean(isSponsored);
    if (isActive !== undefined) updateDoc.isActive = Boolean(isActive);
    if (displayOrder !== undefined) updateDoc.displayOrder = Number(displayOrder);

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Newshub banner updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating newshub banner:', error);
    return NextResponse.json({ error: 'Failed to update newshub banner' }, { status: 500 });
  }
}

// DELETE a banner
export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();
    const collection = db.collection('newshub_banners');

    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('id');

    let id = queryId;
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Newshub banner deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting newshub banner:', error);
    return NextResponse.json({ error: 'Failed to delete newshub banner' }, { status: 500 });
  }
}
