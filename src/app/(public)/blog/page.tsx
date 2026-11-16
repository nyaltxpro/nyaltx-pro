import BlogGrid from "@/components/BlogGrid";
import PublicHeader from "@/components/PublicHeader";
import { getPublicBlogPosts } from "@/lib/publicBlog";
import { Metadata } from "next";
import type { SerializedBlogPost } from "@/lib/blogServer";

export const metadata: Metadata = {
    metadataBase: new URL('https://www.nyaltx.pro'),
    title: { absolute: "NYALTX Blog: Crypto, DeFi and Tokenization Insights" },
    description:
        "Expert articles on tokenized securities, altcoin markets, and blockchain capital markets from the NYALTX team.",
    keywords:
        "nyaltx blog, defi insights, platform updates, crypto education, trading tips, nyaltx news",
    alternates: {
        canonical: "https://www.nyaltx.pro/blog",
    },
    openGraph: {
        title: "NYALTX Blog: Crypto, DeFi and Tokenization Insights",
        description:
            "Expert articles on tokenized securities, altcoin markets, and blockchain capital markets from the NYALTX team.",
        type: "website",
        url: "https://www.nyaltx.pro/blog",
        siteName: "NYALTX",
    },
};

export const revalidate = 300;

const BlogPage = async () => {
    let initialPosts: SerializedBlogPost[] | undefined;
    try {
        initialPosts = await getPublicBlogPosts(60);
    } catch (error) {
        console.error("Failed to load public blog posts for SSR", error);
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#101010] to-[#0a0a0a] text-white">
            <PublicHeader />

            <section className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div className="absolute right-10 top-40 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />
                </div>

                <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-200">
                            Insights
                        </span>
                        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white md:text-6xl">
                            <span className="bg-linear-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                                NYALTX Blog
                            </span>
                        </h1>
                        <p className="mt-6 text-lg text-white/70">
                            Feature releases, trading education, and community stories — published directly by the
                            NYALTX team
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 pb-24">
                <BlogGrid initialPosts={initialPosts} />
            </section>
        </div>
    );
};

export default BlogPage;
