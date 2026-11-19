import type { HTMLAttributes } from 'react';

export function ScrollArea({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="scroll-area"
      className={`overflow-auto overscroll-contain ${className}`}
      {...props}
    />
  );
}
