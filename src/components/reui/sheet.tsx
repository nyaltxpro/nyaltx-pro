'use client';

import type { ReactNode } from 'react';
import { Dialog } from '@/components/reui/dialog';

export function Sheet({ open, onOpenChange, title, description, children, className = '' }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description} className={`sm:max-w-lg ${className}`}>
      {children}
    </Dialog>
  );
}
