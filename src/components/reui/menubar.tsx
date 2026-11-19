import type { HTMLAttributes } from 'react';

export function Menubar({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="menubar"
      role="menubar"
      className={`flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.025] p-1 ${className}`}
      {...props}
    />
  );
}
