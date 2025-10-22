'use client';

import PublicHeader from '@/components/PublicHeader';
import TinaRichText from '@/components/TinaRichText';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTina } from 'tinacms/dist/react';

interface VentureGroupPageProps {
  tinaData: any;
}

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

const VentureGroupPage: React.FC<VentureGroupPageProps> = ({ tinaData }) => {
  const { data }: any = useTina(tinaData);
  const pageData = (data?.venturegroup ?? data) || {};

  const hero = pageData.hero ?? {};
  const teamSection = pageData.teamSection ?? {};
  const teamMembers: VentureGroupTeamMember[] = teamSection.members ?? [];
  const extraSections: VentureGroupSection[] = pageData.sections ?? [];
  const introContent = pageData.content;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PublicHeader />

      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_50%_-100px,rgba(14,165,233,0.25),rgba(14,165,233,0)_65%)]" />
          {hero.backgroundImage ? (
            <div className="absolute inset-0">
              <Image
                src={hero.backgroundImage}
                alt="Venture group background"
                fill
                className="object-cover opacity-10"
                priority
              />
            </div>
          ) : null}
          <div className="relative mx-auto max-w-4xl px-4 py-20">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur">
                <span>Venture Group</span>
              </div>
              {hero.title ? (
                <h1 className="mt-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                  <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                    {hero.title}
                  </span>
                </h1>
              ) : null}
              {hero.subtitle ? <p className="mt-4 text-lg text-white/70">{hero.subtitle}</p> : null}
            </motion.div>
          </div>
        </section>

        {introContent ? (
          <section className="mx-auto max-w-4xl px-4 py-16">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="prose prose-invert max-w-none prose-p:leading-relaxed">
                <TinaRichText content={introContent} />
              </div>
            </motion.div>
          </section>
        ) : null}

        {teamMembers.length ? (
          <section className="mx-auto max-w-5xl px-4 py-16">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="mb-10 text-center">
                {teamSection.title ? <h2 className="text-3xl font-semibold">{teamSection.title}</h2> : null}
                {teamSection.subtitle ? <p className="mt-3 text-base text-white/70">{teamSection.subtitle}</p> : null}
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
                      {member?.name ? <h3 className="mt-4 text-xl font-semibold">{member.name}</h3> : null}
                      {member?.role ? <p className="text-sm text-cyan-200/90">{member.role}</p> : null}
                      {member?.bio ? <p className="mt-3 text-sm leading-relaxed text-white/70">{member.bio}</p> : null}
                      <div className="mt-4 flex gap-3">
                        {member?.linkedin ? (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-cyan-300 transition-colors hover:text-cyan-200"
                          >
                            LinkedIn
                          </a>
                        ) : null}
                        {member?.twitter ? (
                          <a
                            href={member.twitter}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-cyan-300 transition-colors hover:text-cyan-200"
                          >
                            X
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>
        ) : null}

        {extraSections.length ? (
          <section className="mx-auto max-w-5xl px-4 pb-16">
            <div className="space-y-12">
              {extraSections.map((section, index) => (
                <motion.div
                  key={section?.title ?? index}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur"
                >
                  <div className="md:flex md:items-start md:justify-between md:gap-10">
                    <div className="md:w-1/3">
                      {section?.title ? <h3 className="text-2xl font-semibold">{section.title}</h3> : null}
                      {section?.description ? <p className="mt-3 text-sm text-white/70">{section.description}</p> : null}
                    </div>
                    {section.items?.length ? (
                      <div className="mt-6 grid flex-1 gap-6 md:mt-0 md:grid-cols-2">
                        {section.items.map((item, itemIdx) => (
                          <div key={item?.title ?? itemIdx} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            {item?.title ? <h4 className="text-lg font-semibold">{item.title}</h4> : null}
                            {item?.description ? <p className="mt-2 text-sm text-white/70">{item.description}</p> : null}
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
};

export default VentureGroupPage;
