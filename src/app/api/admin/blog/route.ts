import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getBlogCollection, getAllBlogPostsPaginated, serializeBlogPost } from "@/lib/blogServer";

const parseStringArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const slugify = (input: string) =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const statusParam = (url.searchParams.get("status") || "all") as "draft" | "published" | "all";
    const page = Number.parseInt(url.searchParams.get("page") || "1", 10) || 1;
    const limit = Math.min(Number.parseInt(url.searchParams.get("limit") || "20", 10) || 20, 100);

    const { posts, total } = await getAllBlogPostsPaginated({ status: statusParam, page, limit });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Failed to fetch admin blog posts", error);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const title: string = payload.title?.trim();
    const content: string = payload.content ?? "";
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const collection = await getBlogCollection();

    const slug = payload.slug?.trim() ? slugify(payload.slug) : slugify(title);
    const existing = await collection.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: "A blog post with this slug already exists" }, { status: 400 });
    }

    const status: "draft" | "published" = payload.status === "published" ? "published" : "draft";
    const now = new Date();
    const publishedAt = status === "published" ? new Date(payload.publishedAt ?? now) : null;

    const doc = {
      title,
      slug,
      content,
      excerpt: payload.excerpt?.trim() || content.substring(0, 240),
      featuredImage: payload.featuredImage?.trim() || null,
      author: payload.author?.trim() || "NYALTX Team",
      readingTime: payload.readingTime?.trim() || undefined,
      categories: parseStringArray(payload.categories),
      tags: parseStringArray(payload.tags),
      status,
      publishedAt,
      seo: payload.seo && typeof payload.seo === "object" ? payload.seo : undefined,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(doc);
    const inserted = await collection.findOne({ _id: result.insertedId });

    return NextResponse.json({
      success: true,
      post: inserted ? serializeBlogPost(inserted) : null,
    });
  } catch (error) {
    console.error("Failed to create blog post", error);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await request.json();
    const id = payload.id?.trim();
    if (!id) {
      return NextResponse.json({ error: "Blog post id is required" }, { status: 400 });
    }

    const update: Record<string, any> = { updatedAt: new Date() };

    if (payload.title) {
      update.title = payload.title.trim();
    }
    if (payload.content !== undefined) {
      update.content = payload.content;
    }
    if (payload.excerpt !== undefined) {
      update.excerpt = payload.excerpt.trim();
    }
    if (payload.featuredImage !== undefined) {
      update.featuredImage = payload.featuredImage?.trim() || null;
    }
    if (payload.author !== undefined) {
      update.author = payload.author?.trim() || "NYALTX Team";
    }
    if (payload.readingTime !== undefined) {
      update.readingTime = payload.readingTime?.trim() || undefined;
    }
    if (payload.categories !== undefined) {
      update.categories = parseStringArray(payload.categories);
    }
    if (payload.tags !== undefined) {
      update.tags = parseStringArray(payload.tags);
    }
    if (payload.status) {
      const status: "draft" | "published" = payload.status === "published" ? "published" : "draft";
      update.status = status;
      if (status === "published") {
        update.publishedAt = payload.publishedAt ? new Date(payload.publishedAt) : new Date();
      } else {
        update.publishedAt = null;
      }
    }
    if (payload.slug) {
      update.slug = slugify(payload.slug);
    }
    if (payload.seo !== undefined && typeof payload.seo === "object") {
      update.seo = payload.seo;
    }

    const collection = await getBlogCollection();

    if (update.slug) {
      const existing = await collection.findOne({ slug: update.slug, _id: { $ne: new ObjectId(id) } });
      if (existing) {
        return NextResponse.json({ error: "Another blog post already uses this slug" }, { status: 400 });
      }
    }

    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: update });
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    const updatedDoc = await collection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true, post: updatedDoc ? serializeBlogPost(updatedDoc) : null });
  } catch (error) {
    console.error("Failed to update blog post", error);
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = await request.json();
    const id = payload.id?.trim();
    if (!id) {
      return NextResponse.json({ error: "Blog post id is required" }, { status: 400 });
    }

    const collection = await getBlogCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete blog post", error);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
