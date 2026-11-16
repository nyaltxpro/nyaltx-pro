import { getMDXComponents } from '@/components/mdx';
import { whitepaperSource } from '@/lib/whitepaper-source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

const WHITEPAPER_METADATA_OVERRIDES: Record<string, { title: string; description: string }> = {
  '/governa': {
    title: 'NYALTX Governance: Token Holder Decision Making',
    description:
      'Learn how NYALTX governance works, including voting rights, proposals, and the role of the NYAX token.',
  },
  '/roadmap': {
    title: 'NYALTX Roadmap: Milestones and Launch Phases',
    description:
      'Follow the NYALTX development roadmap, from platform launch to planned features and market expansion.',
  },
  '/sources': {
    title: 'NYALTX Whitepaper Sources and References',
    description: 'See the research, data, and regulatory references behind the claims made in the NYALTX whitepaper.',
  },
  '/risks': {
    title: 'NYALTX Risk Disclosure: Market, Legal and Tech Risks',
    description:
      'Review the market, regulatory, and technical risks tied to NYALTX and tokenized securities before you participate.',
  },
  '/conclusion': {
    title: 'NYALTX Whitepaper Conclusion and Outlook',
    description: 'The closing section of the whitepaper, summarizing the NYALTX mission and the road ahead for tokenized markets.',
  },
  '/business-model': {
    title: 'NYALTX Business Model: How the Platform Earns',
    description: 'See the revenue streams, fee structure, and growth plan that support the NYALTX exchange and its ecosystem.',
  },
  '/tokenized-securities': {
    title: 'Tokenized Securities Explained | NYALTX Whitepaper',
    description:
      'See how NYALTX structures tokenized securities, from issuance and custody to trading and investor access.',
  },
  '/sec-exemption': {
    title: 'SEC Exemption Pathway | NYALTX Whitepaper',
    description:
      'Read the regulatory approach behind NYALTX, including the SEC exemption route and the compliance steps involved.',
  },
  '/competitive-positioning': {
    title: 'NYALTX vs Other Exchanges: Competitive Position',
    description:
      'Compare NYALTX with existing crypto exchanges and tokenization platforms, and see where it aims to stand apart.',
  },
  '/executive-summary': {
    title: 'NYALTX Whitepaper: Executive Summary',
    description:
      'A short overview of the NYALTX vision, the problem it targets, and how tokenized securities fit into its platform.',
  },
};

export default async function WhitepaperDocsPage(props: PageProps) {
  const params = await props.params;
  const page = whitepaperSource.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(whitepaperSource, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return whitepaperSource.generateParams();
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const page = whitepaperSource.getPage(params.slug);
  if (!page) notFound();

  const slugPath = params.slug && params.slug.length ? `/${params.slug.join('/')}` : '';
  const canonicalUrl = `https://www.nyaltx.pro/whitepaper${slugPath}`;
  const override = WHITEPAPER_METADATA_OVERRIDES[slugPath];
  const title = override?.title ?? `${page.data.title} | NYALTX Whitepaper`;
  const description = override?.description ?? page.data.description;

  return {
    metadataBase: new URL('https://www.nyaltx.pro'),
    title: { absolute: title },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'NYALTX',
      type: 'article',
    },
  };
}
