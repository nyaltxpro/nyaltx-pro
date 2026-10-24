import {
  getAllBlogPosts as getTinaBlogPosts,
  getBlogPostBySlug as getTinaBlogPostBySlug,
  type BlogPost as TinaBlogPost,
} from '@/lib/blog';
import {
  getBlogPostBySlug as getMongoBlogPostBySlug,
  getPublishedBlogPosts as getMongoPublishedBlogPosts,
  type SerializedBlogPost,
} from '@/lib/blogServer';

const tinaToSerialized = (post: TinaBlogPost): SerializedBlogPost => {
  const now = new Date().toISOString();
  return {
    _id: `tina:${post.slug}`,
    title: post.title ?? 'Untitled',
    slug: post.slug,
    content: post.content ?? '',
    excerpt: post.excerpt ?? '',
    featuredImage: post.featuredImage ?? null,
    status: (post.status as 'draft' | 'published') ?? 'draft',
    publishedAt: post.publishedAt ?? null,
    tags: post.tags ?? [],
    categories: post.categories ?? [],
    author: post.author ?? 'NYALTX Team',
    readingTime: post.readingTime,
    seo: post.seo,
    createdAt: post.publishedAt ?? now,
    updatedAt: post.publishedAt ?? now,
  };
};

/** Published posts from Mongo + Tina filesystem (deduped by slug, Mongo wins). */
export async function getPublicBlogPosts(limit = 50): Promise<SerializedBlogPost[]> {
  const mongoPosts = await getMongoPublishedBlogPosts(limit).catch(() => [] as SerializedBlogPost[]);
  const tinaPosts = getTinaBlogPosts({ includeDrafts: false }).map(tinaToSerialized);

  const bySlug = new Map<string, SerializedBlogPost>();
  for (const post of tinaPosts) {
    if (post.slug) bySlug.set(post.slug, post);
  }
  for (const post of mongoPosts) {
    if (post.slug) bySlug.set(post.slug, post);
  }

  return Array.from(bySlug.values())
    .sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}

export async function getPublicBlogPostBySlug(slug: string): Promise<SerializedBlogPost | null> {
  const mongo = await getMongoBlogPostBySlug(slug).catch(() => null);
  if (mongo) return mongo;

  // Tina filesystem posts (including drafts so editors can preview by URL)
  const tina = getTinaBlogPostBySlug(slug, { includeDrafts: true });
  return tina ? tinaToSerialized(tina) : null;
}
