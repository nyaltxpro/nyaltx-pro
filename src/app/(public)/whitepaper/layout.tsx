import { whitepaperBaseOptions } from '@/lib/whitepaper-layout.shared';
import { whitepaperSource } from '@/lib/whitepaper-source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { RootProvider } from 'fumadocs-ui/provider';
import type { ReactNode } from 'react';

export default function WhitepaperLayout({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      theme={{
        enabled: true,
        defaultTheme: 'dark',
        forcedTheme: 'dark',
      }}
      search={{
        enabled: true,
        options: {
          api: '/api/whitepaper-search',
        },
      }}
    >
      <div className="whitepaper-shell min-h-screen text-white">
        <DocsLayout tree={whitepaperSource.getPageTree()} {...whitepaperBaseOptions()}>
          {children}
        </DocsLayout>
      </div>
    </RootProvider>
  );
}
