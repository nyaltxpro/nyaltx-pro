import type { HTMLAttributes } from 'react';

export function Marker({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="marker"
      className={`inline-block size-2 shrink-0 rounded-full bg-cyan-400 ring-2 ring-cyan-400/15 ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}
