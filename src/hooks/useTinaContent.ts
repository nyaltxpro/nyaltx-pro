'use client';

import { useState, useEffect } from 'react';

// Types for landing page content
export interface HeroSection {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

export interface FeaturesSection {
  title: string;
  subtitle: string;
  items: FeatureItem[];
}

export interface StatItem {
  value: string;
  label: string;
  description: string;
}

export interface StatsSection {
  title: string;
  items: StatItem[];
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}

export interface TestimonialsSection {
  title: string;
  items: TestimonialItem[];
}

export interface LandingPageContent {
  hero: HeroSection;
  features: FeaturesSection;
  stats: StatsSection;
  testimonials: TestimonialsSection;
}

// Types for footer content
export interface FooterLink {
  label: string;
  url: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  items: FooterLink[];
}

export interface FooterBranding {
  title: string;
  subtitle: string;
  description: string;
  logo?: string;
}

export interface FooterSocial {
  title: string;
  description: string;
  platforms: {
    twitter?: string;
    discord?: string;
    telegram?: string;
    youtube?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface FooterNewsletter {
  title: string;
  description: string;
  placeholder: string;
  buttonText: string;
}

export interface FooterLegal {
  copyright: string;
  disclaimer: string;
  links: FooterLink[];
}

export interface FooterContent {
  branding: FooterBranding;
  links: {
    sections: FooterSection[];
  };
  social: FooterSocial;
  newsletter: FooterNewsletter;
  legal: FooterLegal;
}

// Hook for landing page content
export const useLandingPageContent = () => {
  const [content, setContent] = useState<LandingPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        // In development, we'll fetch from the static JSON file
        // In production with Tina Cloud, this would use Tina's GraphQL API
        const response = await fetch('/api/tina/landing-page');
        
        if (!response.ok) {
          // Fallback to static content
          const fallbackResponse = await fetch('/content/landing/home.json');
          if (!fallbackResponse.ok) {
            throw new Error('Failed to fetch landing page content');
          }
          const fallbackData = await fallbackResponse.json();
          setContent(fallbackData);
          return;
        }

        const data = await response.json();
        setContent(data);
      } catch (err) {
        console.error('Error fetching landing page content:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Try to load fallback content
        try {
          const fallbackResponse = await fetch('/content/landing/home.json');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setContent(fallbackData);
            setError(null);
          }
        } catch (fallbackErr) {
          console.error('Failed to load fallback content:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { content, loading, error };
};

// Hook for footer content
export const useFooterContent = () => {
  const [content, setContent] = useState<FooterContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        // In development, we'll fetch from the static JSON file
        // In production with Tina Cloud, this would use Tina's GraphQL API
        const response = await fetch('/api/tina/footer');
        
        if (!response.ok) {
          // Fallback to static content
          const fallbackResponse = await fetch('/content/footer/settings.json');
          if (!fallbackResponse.ok) {
            throw new Error('Failed to fetch footer content');
          }
          const fallbackData = await fallbackResponse.json();
          setContent(fallbackData);
          return;
        }

        const data = await response.json();
        setContent(data);
      } catch (err) {
        console.error('Error fetching footer content:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Try to load fallback content
        try {
          const fallbackResponse = await fetch('/content/footer/settings.json');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setContent(fallbackData);
            setError(null);
          }
        } catch (fallbackErr) {
          console.error('Failed to load fallback content:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { content, loading, error };
};

// Hook for public page content
export const usePublicPageContent = (slug: string) => {
  const [content, setContent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/tina/public-pages/${slug}`);
        
        if (!response.ok) {
          // Fallback to static content
          const fallbackResponse = await fetch(`/content/public-pages/${slug}.json`);
          if (!fallbackResponse.ok) {
            throw new Error(`Failed to fetch public page content for ${slug}`);
          }
          const fallbackData = await fallbackResponse.json();
          setContent(fallbackData);
          return;
        }

        const data = await response.json();
        setContent(data);
      } catch (err) {
        console.error(`Error fetching public page content for ${slug}:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [slug]);

  return { content, loading, error };
};

// Hook for FAQ content
export const useFAQContent = () => {
  const [content, setContent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/tina/faq');
        
        if (!response.ok) {
          // Fallback to static content
          const fallbackResponse = await fetch('/content/faq/faq-data.json');
          if (!fallbackResponse.ok) {
            throw new Error('Failed to fetch FAQ content');
          }
          const fallbackData = await fallbackResponse.json();
          setContent(fallbackData);
          return;
        }

        const data = await response.json();
        setContent(data);
      } catch (err) {
        console.error('Error fetching FAQ content:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { content, loading, error };
};

// Hook for pricing content
export const usePricingContent = () => {
  const [content, setContent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/tina/pricing');
        
        if (!response.ok) {
          // Fallback to static content
          const fallbackResponse = await fetch('/content/pricing/pricing-data.json');
          if (!fallbackResponse.ok) {
            throw new Error('Failed to fetch pricing content');
          }
          const fallbackData = await fallbackResponse.json();
          setContent(fallbackData);
          return;
        }

        const data = await response.json();
        setContent(data);
      } catch (err) {
        console.error('Error fetching pricing content:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { content, loading, error };
};

// Hook for contact content
export const useContactContent = () => {
  const [content, setContent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/tina/contact');
        
        if (!response.ok) {
          // Fallback to static content
          const fallbackResponse = await fetch('/content/contact/contact-data.json');
          if (!fallbackResponse.ok) {
            throw new Error('Failed to fetch contact content');
          }
          const fallbackData = await fallbackResponse.json();
          setContent(fallbackData);
          return;
        }

        const data = await response.json();
        setContent(data);
      } catch (err) {
        console.error('Error fetching contact content:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { content, loading, error };
};

// Generic hook for any Tina content
export const useTinaContent = <T>(contentPath: string, fallbackPath?: string) => {
  const [content, setContent] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/tina/${contentPath}`);
        
        if (!response.ok) {
          if (fallbackPath) {
            const fallbackResponse = await fetch(fallbackPath);
            if (!fallbackResponse.ok) {
              throw new Error(`Failed to fetch content from ${contentPath}`);
            }
            const fallbackData = await fallbackResponse.json();
            setContent(fallbackData);
            return;
          }
          throw new Error(`Failed to fetch content from ${contentPath}`);
        }

        const data = await response.json();
        setContent(data);
      } catch (err) {
        console.error(`Error fetching content from ${contentPath}:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentPath, fallbackPath]);

  return { content, loading, error };
};
