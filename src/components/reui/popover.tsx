'use client';

import type { ReactNode } from 'react';

export function Popover({ trigger, children, className = '' }: { trigger: ReactNode; children: ReactNode; className?: string }) {
  return (
    <details data-slot="popover" className={`relative ${className}`}>
      <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">{trigger}</summary>
      <div className="absolute right-0 z-[120] mt-2 min-w-52 rounded-xl border border-white/10 bg-[#111821] p-3 text-sm text-slate-200 shadow-xl">
        {children}
      </div>
    </details>
  );
}
