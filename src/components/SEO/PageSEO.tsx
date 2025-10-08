'use client';

import { NextSeo } from 'next-seo';

interface PageSEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
  };
  additionalMetaTags?: any[];
}

export default function PageSEO({
  title,
  description,
  canonical,
  openGraph,
  additionalMetaTags = [],
}: PageSEOProps) {
  return (
    <NextSeo
      title={title}
      description={description}
      canonical={canonical}
      openGraph={openGraph}
      additionalMetaTags={additionalMetaTags}
    />
  );
}
