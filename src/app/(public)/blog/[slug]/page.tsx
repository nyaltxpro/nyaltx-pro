import { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicHeader from "@/components/PublicHeader";
import BlogArticle from "@/components/BlogArticle";
import { getPublicBlogPostBySlug, getPublicBlogPosts } from "@/lib/publicBlog";
import { resolveBlogImageUrl } from "@/lib/blogImage";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const posts = await getPublicBlogPosts(100);
    return posts.map((post) => ({ slug: post.slug }));
  } catch (error) {
    console.error("Failed to generate blog params", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Blog Post Not Found - NYALTX Blog",
      description: "The requested NYALTX blog post could not be found.",
    };
  }

  const fallbackTitle = post.title ? `${post.title} - NYALTX Blog` : "NYALTX Blog";
  const fallbackDescription = post.excerpt ?? "Discover insights from the NYALTX team.";
  const ogImage = resolveBlogImageUrl(post.seo?.ogImage ?? post.featuredImage);

  return {
    title: post.seo?.metaTitle ?? fallbackTitle,
    description: post.seo?.metaDescription ?? fallbackDescription,
    keywords: post.seo?.keywords,
    openGraph: {
      title: post.seo?.metaTitle ?? fallbackTitle,
      description: post.seo?.metaDescription ?? fallbackDescription,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags,
      images: ogImage
        ? [
            {
              url: ogImage,
              alt: post.title ?? "NYALTX Blog",
            },
          ]
        : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: post.seo?.metaTitle ?? fallbackTitle,
      description: post.seo?.metaDescription ?? fallbackDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

const BlogPostPage = async ({ params }: PageProps) => {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#101010] to-[#0a0a0a] text-white">
      <PublicHeader />
      <BlogArticle post={post} />
    </div>
  );
};

export default BlogPostPage;
