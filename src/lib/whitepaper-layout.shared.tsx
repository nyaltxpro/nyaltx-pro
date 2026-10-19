import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function whitepaperBaseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <span className="font-semibold tracking-tight">NYALTX</span>
          <span className="ml-2 text-fd-muted-foreground font-normal">Whitepaper</span>
        </>
      ),
      url: '/whitepaper',
    },
    links: [
      {
        text: 'Home',
        url: '/',
        active: 'none',
      },
      {
        text: 'Dashboard',
        url: '/dashboard',
        active: 'none',
      },
      {
        text: 'Governa',
        url: '/governa',
        active: 'none',
      },
      {
        text: 'Tokenized Securities',
        url: '/dashboard/tokenized-securities',
        active: 'none',
      },
    ],
  };
}
