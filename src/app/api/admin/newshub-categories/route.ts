import { getAdminFromRequest } from '@/lib/adminAuth';
import { getDb } from '@/lib/mongodb';
import { PAID_NEWS_CATEGORIES } from '@/lib/paidNewsCategories';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import type { Document } from 'mongodb';

const SETTINGS_ID = 'categories';
type CategorySettings = Document & { _id: string; categories?: string[] };

async function requireAdmin() {
  const admin = await getAdminFromRequest();
  return admin ? null : NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

async function ensureCategorySettings() {
  const db = await getDb();
  await db.collection<CategorySettings>('newshub_settings').updateOne(
    { _id: SETTINGS_ID },
    {
      $setOnInsert: {
        categories: [...PAID_NEWS_CATEGORIES],
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
  return db;
}

async function readCategories() {
  const db = await ensureCategorySettings();
  const settings = await db
    .collection<CategorySettings>('newshub_settings')
    .findOne({ _id: SETTINGS_ID });
  const categories = Array.isArray(settings?.categories)
    ? settings.categories.filter(
        (category: unknown): category is string =>
          typeof category === 'string' && category.trim().length > 0
      )
    : [...PAID_NEWS_CATEGORIES];
  return categories;
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    return NextResponse.json({ categories: await readCategories() });
  } catch (error) {
    console.error('Failed to load News Hub categories:', error);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    if (category.length < 2 || category.length > 32 || category.toLowerCase() === 'all') {
      return NextResponse.json(
        { error: 'Category must be 2–32 characters; “All” is reserved.' },
        { status: 400 }
      );
    }

    const categories = await readCategories();
    if (categories.some(existing => existing.toLowerCase() === category.toLowerCase())) {
      return NextResponse.json({ error: 'That category already exists.' }, { status: 409 });
    }

    const db = await getDb();
    await db
      .collection<CategorySettings>('newshub_settings')
      .updateOne(
        { _id: SETTINGS_ID },
        { $push: { categories: category }, $set: { updatedAt: new Date() } }
      );
    revalidatePath('/newshub');

    return NextResponse.json({ success: true, categories: await readCategories() });
  } catch (error) {
    console.error('Failed to add News Hub category:', error);
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const categories = await readCategories();
    const existing = categories.find(item => item.toLowerCase() === category.toLowerCase());
    if (!existing) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    const db = await getDb();
    const inUse = await db.collection('corporate_news').countDocuments({
      category: { $regex: `^${existing.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });
    if (inUse > 0) {
      return NextResponse.json(
        { error: 'Reassign articles in this category before removing it.' },
        { status: 409 }
      );
    }

    const remainingCategories = categories.filter(item => item !== existing);
    await db
      .collection<CategorySettings>('newshub_settings')
      .updateOne(
        { _id: SETTINGS_ID },
        { $set: { categories: remainingCategories, updatedAt: new Date() } }
      );
    revalidatePath('/newshub');

    return NextResponse.json({ success: true, categories: await readCategories() });
  } catch (error) {
    console.error('Failed to remove News Hub category:', error);
    return NextResponse.json({ error: 'Failed to remove category' }, { status: 500 });
  }
}
