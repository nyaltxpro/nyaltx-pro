'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <TooltipPrimitive.Provider delayDuration={300}>{children}</TooltipPrimitive.Provider>;
}

export function Tooltip({ children }: { children: ReactNode }) {
  return <TooltipPrimitive.Root>{children}</TooltipPrimitive.Root>;
}

export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={6}
        className={`z-[130] rounded-md border border-white/10 bg-[#171c24] px-2 py-1 text-xs text-slate-200 shadow-xl ${className}`}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
