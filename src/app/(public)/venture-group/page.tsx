'use client';

import PublicHeader from '@/components/PublicHeader';
import TinaRichText from '@/components/TinaRichText';
import { usePublicPageContent } from '@/hooks/useTinaContent';
import { motion } from 'framer-motion';
import Image from 'next/image';

type VentureGroupTeamMember = {
  name?: string;
  role?: string;
  bio?: string;
  photo?: string;
  linkedin?: string;
  twitter?: string;
};

type VentureGroupSectionItem = {
  title?: string;
  description?: string;
};

type VentureGroupSection = {
  title?: string;
  description?: string;
  items?: VentureGroupSectionItem[];
};

export default function VentureGroupPage() {
  const { content } = usePublicPageContent('venture-group');

  const fallbackContent = {
    hero: {
      title: 'NYALTX Venture Group',
      subtitle:
        'We back crypto-native founders redefining decentralized markets through capital, advisory, and hands-on operating support.',
      backgroundImage: '/images/venture-group-hero.jpg',
    },
    content: {
      type: 'doc' as const,
      content: [
        {
          type: 'paragraph' as const,
          content: [
            {
              type: 'text' as const,
              text: 'We partner with visionary builders creating new liquidity rails, consumer experiences, and infrastructure that expand the crypto economy.',
            },
          ],
        },
      ],
    },
    teamSection: undefined,
    sections: undefined,
  };

  const pageContent = content ?? fallbackContent;
  const teamMembers = (pageContent.teamSection?.members ?? []) as VentureGroupTeamMember[];
  const extraSections = (pageContent.sections ?? []) as VentureGroupSection[];

  return (
    <div className="min-h-screen bg-inherit text-white">
      <PublicHeader />

      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_50%_-100px,rgba(14,165,233,0.25),rgba(14,165,233,0)_65%)]" />
          {pageContent.hero?.backgroundImage && (
            <div className="absolute inset-0">
              <Image
                src={pageContent.hero.backgroundImage}
                alt="Venture group background"
                fill
                className="object-cover opacity-10"
                priority
              />
            </div>
          )}
          <div className="relative container mx-auto px-4 py-20 max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur">
                <span>Venture Group</span>
              </div>
              <h1 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  {pageContent.hero?.title}
                </span>
              </h1>
              {pageContent.hero?.subtitle && (
                <p className="mt-4 text-lg text-white/70">{pageContent.hero.subtitle}</p>
              )}
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed">
              {pageContent.content && <TinaRichText content={pageContent.content} />}
            </div>
          </motion.div>
        </section>

        {teamMembers.length ? (
          <section className="container mx-auto px-4 py-16 max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="text-center mb-10">
                {pageContent.teamSection.title && (
                  <h2 className="text-3xl font-semibold text-white">{pageContent.teamSection.title}</h2>
                )}
                {pageContent.teamSection.subtitle && (
                  <p className="mt-3 text-base text-white/70">{pageContent.teamSection.subtitle}</p>
                )}
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((member, idx) => (
                  <div key={member?.name ?? idx} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative h-24 w-24 overflow-hidden rounded-full border border-cyan-400/40">
                        {member?.photo ? (
                          <Image src={member.photo} alt={member?.name ?? 'Team member'} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-cyan-500/20 text-cyan-200">
                            {member?.name?.[0] ?? 'N'}
                          </div>
                        )}
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-white">{member?.name}</h3>
                      {member?.role && <p className="text-sm text-cyan-200/90">{member.role}</p>}
                      {member?.bio && <p className="mt-3 text-sm leading-relaxed text-white/70">{member.bio}</p>}
                      <div className="mt-4 flex gap-3">
                        {member?.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors"
                          >
                            LinkedIn
                          </a>
                        )}
                        {member?.twitter && (
                          <a
                            href={member.twitter}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors"
                          >
                            X
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>
        ) : null}

        {extraSections.length ? (
          <section className="container mx-auto px-4 pb-16">
            <div className="space-y-12">
              {extraSections.map((section, sectionIdx) => (
                <motion.div
                  key={section?.title ?? sectionIdx}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur"
                >
                  <div className="md:flex md:items-start md:justify-between md:gap-10">
                    <div className="md:w-1/3">
                      {section?.title && <h3 className="text-2xl font-semibold text-white">{section.title}</h3>}
                      {section?.description && <p className="mt-3 text-sm text-white/70">{section.description}</p>}
                    </div>
                    {(section.items ?? []).length ? (
                      <div className="mt-6 grid flex-1 gap-6 md:mt-0 md:grid-cols-2">
                        {(section.items ?? []).map((item: VentureGroupSectionItem, itemIdx: number) => (
                          <div key={item?.title ?? itemIdx} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            {item?.title && <h4 className="text-lg font-semibold text-white">{item.title}</h4>}
                            {item?.description && <p className="mt-2 text-sm text-white/70">{item.description}</p>}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
