import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Explore Tokens – Browse Project Profiles',
    description:
        'Browse through token profiles and learn about different projects, their ideas, and their communities — all in one easy-to-navigate directory.',
    openGraph: {
        title: 'Explore Tokens – Browse Project Profiles',
        description:
            'Browse through token profiles and learn about different projects, their ideas, and their communities — all in one easy-to-navigate directory.',
        type: 'website',
    },
};

export default function TokensLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
