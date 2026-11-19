import type { HTMLAttributes, ReactNode } from 'react';

interface ItemProps extends HTMLAttributes<HTMLDivElement> {
  leading?: ReactNode;
  trailing?: ReactNode;
}

export function Item({ leading, trailing, className = '', children, ...props }: ItemProps) {
  return (
    <div
      data-slot="item"
      className={`flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 ${className}`}
      {...props}
    >
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="min-w-0 flex-1">{children}</div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}
