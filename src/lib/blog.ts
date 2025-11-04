import fs from 'fs';
import path from 'path';

export interface BlogPostSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogImage?: string;
}

export interface BlogPost {
  slug: string;
  title?: string;
  author?: string;
  excerpt?: string;
  content?: any;
  featuredImage?: string;
  tags?: string[];
  categories?: string[];
  status?: 'draft' | 'published';
  publishedAt?: string;
  readingTime?: string;
  seo?: BlogPostSEO;
  [key: string]: any;
}

const BLOG_CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

const parseBlogFile = (filePath: string): BlogPost | null => {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    const slug = data.slug ?? path.basename(filePath, path.extname(filePath));

    return {
      ...data,
      slug,
    } as BlogPost;
  } catch (error) {
    console.error(`Failed to parse blog file: ${filePath}`, error);
    return null;
  }
};

export const getAllBlogPosts = (options?: { includeDrafts?: boolean }): BlogPost[] => {
  const includeDrafts = options?.includeDrafts ?? false;

  if (!fs.existsSync(BLOG_CONTENT_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(BLOG_CONTENT_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => parseBlogFile(path.join(BLOG_CONTENT_DIR, file)))
    .filter((post): post is BlogPost => Boolean(post));

  const filtered = includeDrafts
    ? files
    : files.filter((post) => (post.status ?? 'draft') === 'published');

  return filtered.sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime;
  });
};

export const getBlogPostBySlug = (
  slug: string,
  options?: { includeDrafts?: boolean }
): BlogPost | null => {
  const includeDrafts = options?.includeDrafts ?? false;

  if (!fs.existsSync(BLOG_CONTENT_DIR)) {
    return null;
  }

  const files = fs.readdirSync(BLOG_CONTENT_DIR).filter((file) => file.endsWith('.json'));

  for (const file of files) {
    const post = parseBlogFile(path.join(BLOG_CONTENT_DIR, file));
    if (!post) continue;

    if (post.slug === slug) {
      if (!includeDrafts && (post.status ?? 'draft') !== 'published') {
        return null;
      }
      return post;
    }
  }

  return null;
};
