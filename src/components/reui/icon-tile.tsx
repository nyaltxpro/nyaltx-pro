import type { HTMLAttributes, ReactNode } from 'react';

interface IconTileProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  tone?: 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose';
}

const tones = {
  cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
  violet: 'border-violet-400/20 bg-violet-400/10 text-violet-300',
  emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  amber: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  rose: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
};

export function IconTile({ icon, tone = 'cyan', className = '', children, ...props }: IconTileProps) {
  return (
    <div
      data-slot="icon-tile"
      className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${tones[tone]} ${className}`}
      {...props}
    >
      {icon ?? children}
    </div>
  );
}
