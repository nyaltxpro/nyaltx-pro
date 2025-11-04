import { NextRequest, NextResponse } from "next/server";
import { getPublishedBlogPosts } from "@/lib/blogServer";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(Number.parseInt(url.searchParams.get("limit") || "20", 10) || 20, 100);
    const posts = await getPublishedBlogPosts(limit);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Failed to fetch blog posts", error);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}
