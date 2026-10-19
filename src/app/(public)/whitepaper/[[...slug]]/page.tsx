import { getMDXComponents } from '@/components/mdx';
import { whitepaperSource } from '@/lib/whitepaper-source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ slug?: string[] }>;
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

  return {
    title: `${page.data.title} | NYALTX Whitepaper`,
    description: page.data.description,
  };
}
