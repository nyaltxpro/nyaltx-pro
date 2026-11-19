import type { HTMLAttributes } from 'react';

export function Kbd({ className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      data-slot="kbd"
      className={`inline-flex min-w-5 items-center justify-center rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-slate-400 ${className}`}
      {...props}
    />
  );
}
