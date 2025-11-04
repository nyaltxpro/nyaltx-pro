"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { SerializedBlogPost } from "@/lib/blogServer";

interface BlogResponse {
  posts: SerializedBlogPost[];
}

const formatPublishedDate = (dateString?: string) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (error) {
    console.warn("Failed to format blog date", error);
    return dateString;
  }
};

const convertToWorkingIPFSUrl = (url?: string | null) => {
  if (!url) return undefined;

  if (url.includes("gateway.pinata.cloud/ipfs/")) {
    const hash = url.split("gateway.pinata.cloud/ipfs/")[1];
    return `https://ipfs.io/ipfs/${hash}`;
  }

  return url;
};

const BlogGrid = () => {
  const [posts, setPosts] = useState<SerializedBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/blog?limit=60", { cache: "no-store" });

        if (!response.ok) {
          throw new Error(`Failed to load blog posts (${response.status})`);
        }

        const data: BlogResponse = await response.json();
        setPosts(data.posts ?? []);
      } catch (err) {
        console.error("Failed to load blog posts", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const categories = useMemo(() => {
    const all = posts.flatMap((post) => post.categories ?? []);
    return Array.from(new Set(all)).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!activeCategory) return posts;
    return posts.filter((post) => post.categories?.includes(activeCategory));
  }, [posts, activeCategory]);

  if (loading) {
    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur">
            <div className="mb-4 h-40 rounded-xl bg-white/10" />
            <div className="mb-3 h-5 rounded bg-white/10" />
            <div className="mb-2 h-4 rounded bg-white/10" />
            <div className="h-4 rounded bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-200">
        <h3 className="text-lg font-semibold">Failed to load blog posts</h3>
        <p className="mt-2 text-sm text-red-100/80">{error}</p>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/80">
        <h3 className="text-xl font-semibold">No blog posts yet</h3>
        <p className="mt-3 text-sm text-white/60">
          Check back soon for fresh updates from the NYALTX team.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              activeCategory === null
                ? "bg-cyan-500/20 text-cyan-200"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                activeCategory === category
                  ? "bg-cyan-500/20 text-cyan-200"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => {
          const publishedAt = formatPublishedDate(post.publishedAt ?? undefined);
          const image = convertToWorkingIPFSUrl(post.featuredImage);

          return (
            <article
              key={post.slug}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition-transform duration-300 hover:-translate-y-1 hover:border-cyan-500/40"
            >
              <div className="relative h-48 w-full overflow-hidden">
                {image ? (
                  <>
                    <Image
                      src={image}
                      alt={post.title ?? "Blog post"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized={image.includes("ipfs.io")}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-cyan-500/30 via-indigo-500/20 to-transparent">
                    <span className="text-sm font-semibold uppercase tracking-[0.4em] text-white/70">
                      NYALTX
                    </span>
                  </div>
                )}
                {publishedAt && (
                  <span className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs uppercase tracking-wide text-white/80 backdrop-blur">
                    {publishedAt}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3 text-xs text-white/60">
                  {post.readingTime ? <span>{post.readingTime}</span> : null}
                  {post.author ? (
                    <span>
                      By <span className="text-white/80">{post.author}</span>
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-3 text-xl font-semibold text-white">
                  <Link href={`/blog/${post.slug}`} className="hover:text-cyan-300">
                    {post.title}
                  </Link>
                </h3>

                {post.excerpt ? (
                  <p className="mt-3 line-clamp-3 text-sm text-white/70">{post.excerpt}</p>
                ) : null}

                {post.tags?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-6 flex items-center justify-between">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm font-medium text-cyan-300 transition-colors hover:text-cyan-200"
                  >
                    Read article →
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default BlogGrid;
