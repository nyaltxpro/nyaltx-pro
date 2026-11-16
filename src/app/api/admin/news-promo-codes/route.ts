import { NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/adminAuth';
import { getCollection } from '@/lib/mongodb';
import { PROMO_PACKAGE_OPTIONS, type NewsPromoCode, type PromoPackageId } from '@/lib/newsPromoCodes';

export const dynamic = 'force-dynamic';

const MAX_DISCOUNT_PERCENT = 99;
const PACKAGE_IDS = PROMO_PACKAGE_OPTIONS.map(option => option.id);
const PACKAGE_ID_SET = new Set<string>(PACKAGE_IDS);

function validPackageIds(value: unknown): value is PromoPackageId[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    new Set(value).size === value.length &&
    value.every(packageId => typeof packageId === 'string' && PACKAGE_ID_SET.has(packageId))
  );
}

function parseExpiration(value: unknown): Date | null | undefined {
  if (value === null || value === '') return null;
  if (typeof value !== 'string') return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function validDiscount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= MAX_DISCOUNT_PERCENT;
}

export async function GET() {
  if (!(await getAdminFromRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const promoCodes = await getCollection<NewsPromoCode>('news_promo_codes');
    const codes = await promoCodes.find({}).sort({ createdAt: -1 }).toArray();
    const data = codes.map(promo => ({
      ...promo,
      packageIds: promo.packageIds ?? ['news:feed', 'news:slider'],
    }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Could not load news promo codes:', error);
    return NextResponse.json({ error: 'Could not load promo codes.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await getAdminFromRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
    const discountPercent = Number(body.discountPercent);
    const expiresAt = parseExpiration(body.expiresAt);
    const packageIds = body.packageIds;

    if (!/^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(code)) {
      return NextResponse.json(
        { error: 'Codes must be 3-32 characters using letters, numbers, hyphens, or underscores.' },
        { status: 400 }
      );
    }
    if (!validDiscount(discountPercent)) {
      return NextResponse.json(
        { error: `Discount must be a whole percentage from 1 to ${MAX_DISCOUNT_PERCENT}.` },
        { status: 400 }
      );
    }
    if (!validPackageIds(packageIds)) {
      return NextResponse.json({ error: 'Select at least one valid package for this promo code.' }, { status: 400 });
    }
    if (expiresAt === undefined) {
      return NextResponse.json({ error: 'Enter a valid expiration date or leave it blank.' }, { status: 400 });
    }
    if (expiresAt && expiresAt.getTime() <= Date.now()) {
      return NextResponse.json({ error: 'Expiration must be in the future.' }, { status: 400 });
    }

    const promoCodes = await getCollection<NewsPromoCode>('news_promo_codes');
    await promoCodes.createIndex({ code: 1 }, { unique: true });

    const now = new Date();
    const promo: NewsPromoCode = {
      code,
      discountPercent,
      packageIds,
      active: true,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    };
    await promoCodes.insertOne(promo);

    return NextResponse.json({ success: true, data: promo }, { status: 201 });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json({ error: 'That promo code already exists.' }, { status: 409 });
    }
    console.error('Could not create news promo code:', error);
    return NextResponse.json({ error: 'Could not create promo code.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await getAdminFromRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
    const updates: Partial<Pick<NewsPromoCode, 'active' | 'discountPercent' | 'expiresAt'>> = {};

    if (!code) {
      return NextResponse.json({ error: 'Promo code is required.' }, { status: 400 });
    }
    if ('active' in body) {
      if (typeof body.active !== 'boolean') {
        return NextResponse.json({ error: 'Active status must be true or false.' }, { status: 400 });
      }
      updates.active = body.active;
    }
    if ('discountPercent' in body) {
      const discountPercent = Number(body.discountPercent);
      if (!validDiscount(discountPercent)) {
        return NextResponse.json(
          { error: `Discount must be a whole percentage from 1 to ${MAX_DISCOUNT_PERCENT}.` },
          { status: 400 }
        );
      }
      updates.discountPercent = discountPercent;
    }
    if ('expiresAt' in body) {
      const expiresAt = parseExpiration(body.expiresAt);
      if (expiresAt === undefined) {
        return NextResponse.json({ error: 'Enter a valid expiration date or leave it blank.' }, { status: 400 });
      }
      if (expiresAt && expiresAt.getTime() <= Date.now()) {
        return NextResponse.json({ error: 'Expiration must be in the future.' }, { status: 400 });
      }
      updates.expiresAt = expiresAt;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Provide a promo code field to update.' }, { status: 400 });
    }

    updates.updatedAt = new Date();
    const promoCodes = await getCollection<NewsPromoCode>('news_promo_codes');
    const result = await promoCodes.updateOne({ code }, { $set: updates });
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Promo code not found.' }, { status: 404 });
    }

    const updatedPromo = await promoCodes.findOne({ code });
    return NextResponse.json({ success: true, data: updatedPromo });
  } catch (error) {
    console.error('Could not update news promo code:', error);
    return NextResponse.json({ error: 'Could not update promo code.' }, { status: 500 });
  }
}
