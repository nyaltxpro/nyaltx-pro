'use client';

import PublicHeader from '@/components/PublicHeader';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useMemo } from 'react';
import { useTina } from 'tinacms/dist/react';

interface PodcastPageProps {
  tinaData: any;
}

interface PodcastHost {
  name?: string;
  title?: string;
  bio?: string;
  photo?: string;
  twitter?: string;
  linkedin?: string;
}

interface PodcastGuest {
  name?: string;
  title?: string;
  bio?: string;
  photo?: string;
  twitter?: string;
  linkedin?: string;
}

interface PodcastResource {
  label?: string;
  url?: string;
}

interface PodcastEpisode {
  datetime?: string;
  duration?: string;
  topic?: string;
  description?: string;
  guest?: PodcastGuest;
  resources?: PodcastResource[];
}

interface PodcastPastEpisode {
  topic?: string;
  summary?: string;
  guest?: PodcastGuest;
  recordingUrl?: string;
}

const normalizeImageSrc = (value?: string) => {
  if (!value) return null;
  if (value.startsWith('http') || value.startsWith('data:')) return value;
  return value.startsWith('/') ? value : `/${value}`;
};

const formatDateTime = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const PodcastPage: React.FC<PodcastPageProps> = ({ tinaData }) => {
  const { data }: any = useTina(tinaData);
  const page = (data?.podcast ?? data) || {};

  const hero = page.hero ?? {};
  const host: PodcastHost = hero.host ?? {};
  const schedule = page.schedule ?? {};
  const upcomingEpisodes: PodcastEpisode[] = schedule.episodes ?? [];
  const sortedEpisodes = useMemo(() => {
    return [...upcomingEpisodes].sort((a, b) => {
      const aDate = a?.datetime ? new Date(a.datetime).getTime() : Number.MAX_SAFE_INTEGER;
      const bDate = b?.datetime ? new Date(b.datetime).getTime() : Number.MAX_SAFE_INTEGER;
      return aDate - bDate;
    });
  }, [upcomingEpisodes]);

  const pastEpisodesSection = page.pastEpisodes ?? {};
  const pastEpisodes: PodcastPastEpisode[] = pastEpisodesSection.episodes ?? [];
  const cta = page.cta ?? {};

  // --- Check image paths before normalizing ---
  console.log('🖼️ [Hero backgroundImage raw]:', hero.backgroundImage);
  console.log('🧑‍💼 [Host photo raw]:', host.photo);

  const heroImage = normalizeImageSrc(hero.backgroundImage);
  const hostImage = normalizeImageSrc(host.photo);

  // --- After normalization ---
  console.log('✨ [Hero image normalized]:', heroImage);
  console.log('✨ [Host image normalized]:', hostImage);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PublicHeader />
      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_50%_-100px,rgba(14,165,233,0.25),rgba(14,165,233,0)_65%)]" />
          {heroImage ? (
            <div className="absolute inset-0">
              <Image src={heroImage} alt={hero.title ?? 'Podcast hero background'} fill className="object-cover opacity-10" priority />
            </div>
          ) : null}
          <div className="relative mx-auto max-w-5xl px-4 py-20">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {hero.badge ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur">
                  <span>{hero.badge}</span>
                </div>
              ) : null}
              {hero.title ? (
                <h1 className="mt-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                  <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">{hero.title}</span>
                </h1>
              ) : null}
              {hero.subtitle ? <p className="mt-4 text-lg text-white/70 max-w-3xl">{hero.subtitle}</p> : null}
              {host.name || host.bio ? (
                <div className="mt-10 flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur md:flex-row md:items-center md:gap-8">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border border-cyan-400/50">
                    {hostImage ? (
                      <Image src={hostImage} alt={host.name ?? 'Podcast host'} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-cyan-500/20 text-2xl text-cyan-200">
                        {host.name?.[0] ?? 'H'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    {host.name ? <h2 className="text-2xl font-semibold">Hosted by {host.name}</h2> : null}
                    {host.title ? <p className="text-sm text-cyan-200/90">{host.title}</p> : null}
                    {host.bio ? <p className="mt-3 text-sm text-white/70 leading-relaxed">{host.bio}</p> : null}
                    {(host.twitter || host.linkedin) ? (
                      <div className="mt-4 flex flex-wrap gap-4 text-sm">
                        {host.twitter ? (
                          <a href={host.twitter} target="_blank" rel="noreferrer" className="text-cyan-300 transition-colors hover:text-cyan-200">
                            X (Twitter)
                          </a>
                        ) : null}
                        {host.linkedin ? (
                          <a href={host.linkedin} target="_blank" rel="noreferrer" className="text-cyan-300 transition-colors hover:text-cyan-200">
                            LinkedIn
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        </section>

        {sortedEpisodes.length ? (
          <section className="mx-auto max-w-6xl px-4 py-16">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  {schedule.title ? <h2 className="text-3xl font-semibold">{schedule.title}</h2> : null}
                  {schedule.subtitle ? <p className="mt-2 text-sm text-white/70 max-w-2xl">{schedule.subtitle}</p> : null}
                </div>
              </div>
              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                {sortedEpisodes.map((episode, index) => {
                  const formattedDate = formatDateTime(episode.datetime);
                  const guestImage = normalizeImageSrc(episode.guest?.photo);
                  const guestInitial = episode.guest?.name?.[0]?.toUpperCase() ?? 'G';
                  return (
                    <div key={episode.topic ?? index} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                      <div className="flex flex-col gap-5">
                        <div className="flex items-center justify-between gap-3">
                          {formattedDate ? <span className="text-sm font-medium text-cyan-300">{formattedDate}</span> : null}
                          {episode.duration ? <span className="text-xs text-white/60">{episode.duration}</span> : null}
                        </div>
                        {episode.topic ? <h3 className="text-2xl font-semibold leading-snug">{episode.topic}</h3> : null}
                        {episode.description ? <p className="text-sm text-white/70 leading-relaxed">{episode.description}</p> : null}
                        {episode.guest?.name ? (
                          <div className="flex items-center gap-4">
                            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-cyan-400/40">
                              {guestImage ? (
                                <Image src={guestImage} alt={episode.guest.name} fill className="object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-cyan-500/20 text-cyan-200">
                                  {guestInitial}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{episode.guest.name}</p>
                              {episode.guest.title ? <p className="text-xs text-white/60">{episode.guest.title}</p> : null}
                            </div>
                          </div>
                        ) : null}
                        {episode.resources?.length ? (
                          <div className="flex flex-wrap gap-3">
                            {episode.resources.map((resource, resourceIndex) => (
                              <a
                                key={resource.url ?? resourceIndex}
                                href={resource.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200 transition-colors hover:border-cyan-300"
                              >
                                {resource.label ?? 'View'}
                              </a>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </section>
        ) : null}

        {pastEpisodes.length ? (
          <section className="mx-auto max-w-6xl px-4 pb-16">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  {pastEpisodesSection.title ? <h2 className="text-3xl font-semibold">{pastEpisodesSection.title}</h2> : null}
                  {pastEpisodesSection.subtitle ? <p className="mt-2 text-sm text-white/70 max-w-2xl">{pastEpisodesSection.subtitle}</p> : null}
                </div>
              </div>
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastEpisodes.map((episode, index) => {
                  const pastGuestImage = normalizeImageSrc(episode.guest?.photo);
                  const pastGuestInitial = episode.guest?.name?.[0]?.toUpperCase() ?? 'G';

                  return (
                    <div key={episode.topic ?? index} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                      <div className="flex flex-col gap-4">
                        {episode.topic ? <h3 className="text-xl font-semibold leading-snug">{episode.topic}</h3> : null}
                        {episode.summary ? <p className="text-sm text-white/70 leading-relaxed">{episode.summary}</p> : null}
                        {episode.guest?.name ? (
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-cyan-400/40">
                              {pastGuestImage ? (
                                <Image src={pastGuestImage} alt={episode.guest.name} fill className="object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-cyan-500/20 text-cyan-200">
                                  {pastGuestInitial}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{episode.guest.name}</p>
                              {episode.guest.title ? <p className="text-xs text-white/60">{episode.guest.title}</p> : null}
                            </div>
                          </div>
                        ) : null}
                        {episode.recordingUrl ? (
                          <a
                            href={episode.recordingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-cyan-300 transition-colors hover:text-cyan-200"
                          >
                            Listen to recording
                          </a>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </section>
        ) : null}

        {cta.title || cta.description ? (
          <section className="mx-auto max-w-4xl px-4 pb-20">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
              <div className="rounded-3xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 p-10 text-center backdrop-blur">
                {cta.title ? <h2 className="text-3xl font-semibold">{cta.title}</h2> : null}
                {cta.description ? <p className="mt-3 text-sm text-white/70 leading-relaxed">{cta.description}</p> : null}
                {cta.buttonLabel && cta.buttonLink ? (
                  <div className="mt-6 flex justify-center">
                    <a
                      href={cta.buttonLink}
                      className="inline-flex items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-500/20 px-6 py-2 text-sm font-semibold text-cyan-100 transition-colors hover:border-cyan-300 hover:bg-cyan-500/30"
                    >
                      {cta.buttonLabel}
                    </a>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </section>
        ) : null}
      </main>
    </div>
  );
};

export default PodcastPage;
