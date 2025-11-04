import { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicHeader from "@/components/PublicHeader";
import BlogArticle from "@/components/BlogArticle";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog";

export const revalidate = 300;

type PageParams = {
  slug: string;
};

const fetchPost = (slug: string) => {
  try {
    return getBlogPostBySlug(slug);
  } catch (error) {
    console.error("Failed to fetch blog post", error);
    return null;
  }
};

export async function generateStaticParams() {
  try {
    return getAllBlogPosts().map((post) => ({ slug: post.slug }));
  } catch (error) {
    console.error("Failed to generate blog params", error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const post = fetchPost(params.slug);

  if (!post) {
    return {
      title: "Blog Post Not Found - NYALTX Blog",
      description: "The requested NYALTX blog post could not be found.",
    };
  }

  const fallbackTitle = post.title ? `${post.title} - NYALTX Blog` : "NYALTX Blog";
  const fallbackDescription = post.excerpt ?? "Discover insights from the NYALTX team.";
  const ogImage = post.seo?.ogImage ?? post.featuredImage;

  return {
    title: post.seo?.metaTitle ?? fallbackTitle,
    description: post.seo?.metaDescription ?? fallbackDescription,
    keywords: post.seo?.keywords,
    openGraph: {
      title: post.seo?.metaTitle ?? fallbackTitle,
      description: post.seo?.metaDescription ?? fallbackDescription,
      type: "article",
      publishedTime: post.publishedAt,
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

const BlogPostPage = async ({ params }: { params: PageParams }) => {
  const post = fetchPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen text-white">
      <PublicHeader />
      <BlogArticle post={post} />
    </div>
  );
};

export default BlogPostPage;
