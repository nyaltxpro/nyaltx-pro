import { getNewshubCategories } from '@/lib/newshubInitialData';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ categories: await getNewshubCategories() });
  } catch (error) {
    console.error('Failed to load public News Hub categories:', error);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}
