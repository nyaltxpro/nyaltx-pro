import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface BlogPostDoc {
  _id?: ObjectId | string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string | null;
  status: "draft" | "published";
  publishedAt?: Date | null;
  tags: string[];
  categories: string[];
  author: string;
  readingTime?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
    ogImage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SerializedBlogPost extends Omit<BlogPostDoc, "_id" | "publishedAt" | "createdAt" | "updatedAt"> {
  _id: string;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

const COLLECTION_NAME = "blog_posts";

const serializeDate = (value?: Date | null) => (value ? value.toISOString() : null);

export const serializeBlogPost = (doc: BlogPostDoc): SerializedBlogPost => ({
  ...doc,
  _id: (doc._id instanceof ObjectId ? doc._id.toHexString() : doc._id) ?? "",
  publishedAt: serializeDate(doc.publishedAt),
  createdAt: serializeDate(doc.createdAt) ?? new Date().toISOString(),
  updatedAt: serializeDate(doc.updatedAt) ?? new Date().toISOString(),
});

export const getBlogCollection = async () => {
  const db = await getDb();
  return db.collection<BlogPostDoc>(COLLECTION_NAME);
};

export const getPublishedBlogPosts = async (limit = 50) => {
  const collection = await getBlogCollection();
  const posts = await collection
    .find({ status: "published" })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(limit)
    .toArray();

  return posts.map(serializeBlogPost);
};

export const getBlogPostBySlug = async (slug: string) => {
  const collection = await getBlogCollection();
  const doc = await collection.findOne({ slug });
  return doc ? serializeBlogPost(doc) : null;
};

export const getAllBlogPostsPaginated = async ({
  status,
  page = 1,
  limit = 10,
}: {
  status?: "draft" | "published" | "all";
  page?: number;
  limit?: number;
}) => {
  const collection = await getBlogCollection();
  const query: Record<string, any> = {};

  if (status && status !== "all") {
    query.status = status;
  }

  const skip = (page - 1) * limit;
  const [total, posts] = await Promise.all([
    collection.countDocuments(query),
    collection
      .find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
  ]);

  return {
    total,
    posts: posts.map(serializeBlogPost),
  };
};
