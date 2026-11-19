import type { ReactNode } from 'react';
import { ScrollArea } from '@/components/reui/scroll-area';

export function MessageScroller({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <ScrollArea data-slot="message-scroller" className={`max-h-72 ${className}`}>
      {children}
    </ScrollArea>
  );
}
