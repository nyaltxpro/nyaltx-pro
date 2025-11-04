import { NextResponse } from 'next/server';
import { getAllBlogPosts } from '@/lib/blog';

export async function GET() {
  try {
    const posts = getAllBlogPosts();

    return NextResponse.json(
      {
        posts,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        },
      },
    );
  } catch (error) {
    console.error('Failed to fetch blog posts', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}
