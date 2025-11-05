'use client';

import PublicHeader from '@/components/PublicHeader';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';

interface WhitepaperPageProps {
  data: any;
}

type HighlightStyle = 'cyan' | 'green' | 'purple' | 'indigo' | 'orange' | 'teal' | 'blue';

type Section = {
  id?: string;
  title?: string;
  level?: number | string;
  content?: any;
  highlight?: {
    style?: HighlightStyle;
    content?: any;
  } | null;
  listItems?: { content?: any }[] | null;
  stats?: { value: string; description?: string; color?: HighlightStyle }[] | null;
  cards?: { title: string; description?: string; color?: HighlightStyle }[] | null;
  details?: { label: string; value: string }[] | null;
  subsections?: Section[] | null;
  timeline?: {
    id?: string;
    title?: string;
    subtitle?: string;
    color?: HighlightStyle;
    items?: { text?: string }[];
  }[] | null;
};

const highlightStyleMap: Record<HighlightStyle, { container: string; text: string }> = {
  cyan: {
    container: 'from-cyan-500/10 to-blue-600/10 border-cyan-400',
    text: 'text-cyan-300',
  },
  green: {
    container: 'from-green-500/10 to-emerald-600/10 border-green-400',
    text: 'text-green-300',
  },
  purple: {
    container: 'from-purple-500/10 to-violet-600/10 border-purple-400',
    text: 'text-purple-300',
  },
  indigo: {
    container: 'from-indigo-500/10 to-purple-600/10 border-indigo-400',
    text: 'text-indigo-300',
  },
  orange: {
    container: 'from-orange-500/10 to-amber-600/10 border-orange-400',
    text: 'text-orange-300',
  },
  teal: {
    container: 'from-teal-500/10 to-cyan-600/10 border-teal-400',
    text: 'text-teal-300',
  },
  blue: {
    container: 'from-blue-500/10 to-cyan-600/10 border-blue-400',
    text: 'text-blue-300',
  },
};

const cardStyleMap: Record<HighlightStyle, string> = {
  cyan: 'from-cyan-500/10 to-blue-600/10 border-cyan-500/20 text-cyan-200',
  green: 'from-green-500/10 to-emerald-600/10 border-green-500/20 text-green-200',
  purple: 'from-purple-500/10 to-violet-600/10 border-purple-500/20 text-purple-200',
  indigo: 'from-indigo-500/10 to-blue-600/10 border-indigo-500/20 text-indigo-200',
  orange: 'from-orange-500/10 to-amber-600/10 border-orange-500/20 text-orange-200',
  teal: 'from-teal-500/10 to-cyan-600/10 border-teal-500/20 text-teal-200',
  blue: 'from-blue-500/10 to-sky-600/10 border-blue-500/20 text-blue-200',
};

const renderContent = (value: any) => {
  if (!value) return null;
  if (typeof value === 'string') {
    const paragraphs = value
      .split(/\n{2,}/)
      .map((paragraph, index) => (
        <p key={index} className="leading-relaxed">
          {paragraph}
        </p>
      ));
    return <>{paragraphs}</>;
  }

  return <TinaMarkdown content={value} />;
};

const normalizeLevel = (value: Section['level']) => {
  if (value === undefined || value === null) return undefined;
  const numeric = typeof value === 'string' ? parseInt(value, 10) : value;
  return Number.isNaN(numeric as number) ? undefined : numeric;
};

const SectionRenderer: React.FC<{ section: Section; isNested?: boolean }> = ({ section, isNested }) => {
  if (!section?.id && !section?.title) return null;

  const sectionLevel = normalizeLevel(section.level) ?? 0;
  const HeadingTag = (sectionLevel > 0 ? 'h3' : 'h2') as React.ElementType;

  const highlight = section.highlight?.style
    ? highlightStyleMap[section.highlight.style as HighlightStyle] ?? highlightStyleMap.cyan
    : null;

  const titleClass = sectionLevel > 0 ? 'text-2xl font-semibold text-gray-200 mb-4' : 'text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6';

  return (
    <section
      id={section.id}
      className={clsx('mb-8 sm:mb-12 scroll-mt-32', isNested && 'mb-6 sm:mb-8')}
    >
      {section.title && (
        <HeadingTag className={titleClass}>{section.title}</HeadingTag>
      )}

      {highlight?.container && section.highlight?.content && (
        <div
          className={clsx(
            'bg-linear-to-r border-l-4 p-6 mb-6 rounded-r-lg',
            highlight.container,
          )}
        >
          <div className={clsx('space-y-3', highlight.text)}>{renderContent(section.highlight.content)}</div>
        </div>
      )}

      {section.content && (
        <div className="text-gray-300 space-y-4">{renderContent(section.content)}</div>
      )}

      {Array.isArray(section.stats) && section.stats.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-6">
          {section.stats.map((stat, index) => {
            const style = stat.color ? cardStyleMap[stat.color as HighlightStyle] ?? cardStyleMap.cyan : cardStyleMap.cyan;
            return (
              <div
                key={`${section.id}-stat-${index}`}
                className={clsx('bg-linear-to-br border p-6 rounded-lg', style)}
              >
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                {stat.description && <p className="text-sm text-white/80">{stat.description}</p>}
              </div>
            );
          })}
        </div>
      )}

      {Array.isArray(section.listItems) && section.listItems.length > 0 && (
        <ul className="space-y-4 text-gray-300">
          {section.listItems.map((item, index) => (
            <li key={`${section.id}-list-${index}`} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0"></div>
              <div className="space-y-2">{renderContent(item?.content)}</div>
            </li>
          ))}
        </ul>
      )}

      {Array.isArray(section.cards) && section.cards.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
          {section.cards.map((card, index) => {
            const style = card.color ? cardStyleMap[card.color as HighlightStyle] ?? cardStyleMap.cyan : cardStyleMap.cyan;
            return (
              <div
                key={`${section.id}-card-${index}`}
                className={clsx('bg-linear-to-br border p-6 rounded-lg', style)}
              >
                <h4 className="font-semibold text-white mb-2">{card.title}</h4>
                {card.description && <p className="text-sm text-white/80">{card.description}</p>}
              </div>
            );
          })}
        </div>
      )}

      {Array.isArray(section.details) && section.details.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg mt-6">
          <ul className="space-y-2 text-gray-300">
            {section.details.map((detail, index) => (
              <li key={`${section.id}-detail-${index}`}>
                <strong className="text-white">{detail.label}:</strong> {detail.value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(section.timeline) && section.timeline.length > 0 && (
        <div className="space-y-8">
          {section.timeline.map((item, index) => {
            const style = item.color ? cardStyleMap[item.color as HighlightStyle] ?? cardStyleMap.cyan : cardStyleMap.cyan;
            return (
              <div key={`${section.id}-timeline-${item.id ?? index}`} className="space-y-3">
                <div
                  id={item.id}
                  className={clsx('bg-linear-to-r border-l-4 p-6 rounded-r-lg', style)}
                >
                  <h3 className="text-xl font-semibold text-white mb-1">{item.title}</h3>
                  {item.subtitle && <p className="text-sm text-white/80">{item.subtitle}</p>}
                </div>
                {Array.isArray(item.items) && item.items.length > 0 && (
                  <ul className="space-y-2 text-gray-300 ml-6">
                    {item.items.map((timelineItem, itemIndex) => (
                      <li key={`${section.id}-timeline-${index}-${itemIndex}`}>
                        • {timelineItem.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {Array.isArray(section.subsections) && section.subsections.length > 0 && (
        <div className="space-y-8 mt-6">
          {section.subsections.map((subsection, index) => (
            <SectionRenderer key={`${section.id}-sub-${subsection.id ?? index}`} section={subsection} isNested />
          ))}
        </div>
      )}
    </section>
  );
};

const WhitepaperPage: React.FC<WhitepaperPageProps> = ({ data }) => {
  const { data: tinaData } = useTina(data) as { data: any };
  const pageData = tinaData?.whitepaper ?? tinaData ?? {};

  const sections: Section[] = useMemo(
    () => (Array.isArray(pageData.sections) ? (pageData.sections as Section[]) : []),
    [pageData.sections],
  );
  const toc = useMemo(
    () =>
      Array.isArray(pageData.toc)
        ? pageData.toc.map((item: any) => {
          const normalizedLevel = normalizeLevel(item?.level);
          return {
            ...item,
            level: normalizedLevel,
          };
        })
        : [],
    [pageData.toc],
  ) as Array<{
    id: string;
    title: string;
    level?: number;
  }>;

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('Whitepaper sections', sections);
  }, [sections]);

  const [activeSection, setActiveSection] = useState<string>(toc?.[0]?.id ?? sections?.[0]?.id ?? '');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleSection?.target?.id) {
          setActiveSection(visibleSection.target.id);
        }
      },
      { rootMargin: '-120px 0px -70%' },
    );

    const ids = [...toc.map((item: any) => item.id), ...sections.map((section) => section.id)].filter(Boolean) as string[];

    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [toc, sections]);

  const handleScrollToSection = (sectionId: string) => {
    setSidebarOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="min-h-screen  text-white">
      <PublicHeader />

      <div className="z-40 sticky top-16 flex items-center justify-between border-b border-white/10 bg-[#0b1217]/95 px-4 py-4 lg:hidden">
        <div>
          <h1 className="text-lg font-semibold">{pageData?.title ?? 'Whitepaper'}</h1>
          {pageData?.hero?.subtitle && (
            <p className="text-xs text-gray-400">{pageData.hero.subtitle}</p>
          )}
        </div>
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="rounded-md border border-cyan-500 px-3 py-1 text-sm text-cyan-300"
        >
          {sidebarOpen ? 'Close' : 'Contents'}
        </button>
      </div>

      <div className="flex">
        <aside
          className={clsx(
            'fixed top-32 left-0 z-30 w-80 h-[calc(100vh-8rem)] border-r border-white/10 transition-transform duration-300 ease-in-out overflow-y-auto',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'lg:translate-x-0 lg:static lg:z-0',
          )}
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
            <nav className="space-y-0.5">
              {toc.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => handleScrollToSection(item.id)}
                  className={clsx(
                    'block w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                    item.level === 1 && 'ml-4 text-xs',
                    activeSection === item.id
                      ? 'bg-linear-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 font-medium border-l-2 border-cyan-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5',
                  )}
                >
                  {item.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 top-32 z-20 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 min-h-screen ">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <article className="max-w-none">
              <section id={pageData.hero?.id ?? 'introduction'} className="mb-8 sm:mb-12 scroll-mt-32">
                {pageData?.hero?.title && (
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
                    {pageData.hero.title}
                  </h1>
                )}
                {pageData?.hero?.subtitle && (
                  <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8">
                    {pageData.hero.subtitle}
                  </p>
                )}
                {pageData?.description && (
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                    {pageData.description}
                  </p>
                )}
              </section>

              {sections.map((section) => (
                <SectionRenderer key={section.id} section={section} />
              ))}
            </article>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WhitepaperPage;
