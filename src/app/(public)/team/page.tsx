'use client';

import PublicHeader from '@/components/PublicHeader';
import { useTeamContent } from '@/hooks/useTinaContent';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { FiLinkedin, FiSend, FiTwitter } from 'react-icons/fi';

export default function TeamPage() {
  const { content, loading } = useTeamContent();
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Force use static content for debugging
  const [useStatic, setUseStatic] = useState(false);

  const fallbackContent = {
    hero: {
      title: 'Meet the NYALTX Team',
      subtitle:
        'A multidisciplinary crew of builders, traders, and storytellers committed to elevating crypto-native projects.',
      backgroundImage: '/images/team-hero.jpg',
    },
    members: [
      {
        name: 'Frank Ferraro',
        role: 'Founder & Host',
        description:
          'Seasoned market maker and blockchain strategist driving partnerships and media innovation across the Web3 landscape.',
        image: '/IMG_0374.png',
        socials: {
          twitter: 'https://x.com/nyaltx',
          linkedin: 'https://www.linkedin.com/in/ferrarofrank/',
          telegram: 'https://t.me/newyorkaltexchangegroup'
        },
      },
      {
        name: 'Andrea Cataneo',
        role: 'General Counsel',
        description:
          'Seasoned securities attorney and capital markets strategist, guiding companies through public offerings, compliance, and Web3 expansion.',
        image: '/img.png',
        socials: {
          twitter: '',
          linkedin: 'https://www.linkedin.com/in/andreacataneo/',
          telegram: ''
        },
      },
      {
        name: 'John',
        role: 'CMO',
        description:
          'Im CMO',
        image: '/IMG_1273.png',
        socials: {
          twitter: '',
          linkedin: '',
          telegram: ''
        },
      },
    ],
  };

  const teamContent = useStatic ? fallbackContent : (content ?? fallbackContent);
  const hero = teamContent.hero ?? fallbackContent.hero;
  const members = teamContent.members ?? fallbackContent.members;

  // Debug logging
  console.log('Team content loaded:', { content, loading, useStatic });
  console.log('Members data:', members);
  console.log('Image errors state:', imgErrors);
  console.log('Content source:', useStatic ? 'Static fallback' : (content ? 'API' : 'Fallback'));

  const socialIcon = (platform: string) => {
    if (platform === 'twitter' || platform === 'x') {
      return <FiTwitter className="h-4 w-4" />;
    }
    if (platform === 'linkedin') {
      return <FiLinkedin className="h-4 w-4" />;
    }
    if (platform === 'telegram') {
      return <FiSend className="h-4 w-4" />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-inherit text-white">


      <main>
        <PublicHeader />
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_50%_-100px,rgba(14,165,233,0.25),rgba(14,165,233,0)_65%)]" />
          {hero?.backgroundImage && (
            <div className="absolute inset-0">
              <Image
                src={hero.backgroundImage}
                alt="Team background"
                fill
                className="object-cover opacity-10"
                unoptimized
                priority
              />
            </div>
          )}
          <div className="relative container mx-auto px-4 py-20 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur">
                <span>Team</span>
              </div>
              <h1 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  {hero?.title}
                </span>
              </h1>
              {/* <button 
                onClick={() => setUseStatic(!useStatic)}
                className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-md text-sm"
              >
                {useStatic ? 'Use API Content' : 'Use Static Content'} (Debug)
              </button> */}
              {hero?.subtitle && (
                <p className="mt-4 text-lg text-white/70">{hero.subtitle}</p>
              )}
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 max-w-6xl">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-72 rounded-2xl border border-white/10 bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {members?.map(member => {
                const socialEntries = Object.entries(member.socials ?? {}).filter(
                  ([, url]) => typeof url === 'string' && url.length > 0
                );
                const keyName = `${member.name}-${member.role ?? 'member'}`;
                const hasError = imgErrors[keyName];

                return (
                  <div
                    key={keyName}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40"
                  >
                    <div className="relative h-52 bg-gradient-to-br from-gray-900 to-gray-800">
                      {member.image && !hasError ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover"
                          unoptimized
                          onError={(e) => {
                            console.error(`Failed to load image for ${member.name}:`, member.image, e);
                            setImgErrors(prev => ({ ...prev, [keyName]: true }));
                          }}
                          onLoad={() => console.log(`Successfully loaded image for ${member.name}:`, member.image)}
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                          <div className="text-4xl font-semibold">
                            {member.name
                              .split(' ')
                              .map(part => part.charAt(0))
                              .join('')}
                          </div>
                          <div className="text-xs mt-2 text-red-400">
                            {hasError ? 'Image failed to load' : 'No image'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {member.image}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{member.name}</h3>
                          {member.role && (
                            <p className="text-sm text-cyan-300/80 mt-1">{member.role}</p>
                          )}
                        </div>
                      </div>
                      {member.description && (
                        <p className="mt-4 text-sm text-white/70 leading-relaxed">
                          {member.description}
                        </p>
                      )}

                      {socialEntries.length > 0 && (
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          {socialEntries.map(([platform, url]) => (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 transition-colors hover:border-cyan-500/40 hover:text-white"
                            >
                              {socialIcon(platform)}
                              <span className="capitalize">{platform}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </section>
      </main>
    </div>
  );
}
