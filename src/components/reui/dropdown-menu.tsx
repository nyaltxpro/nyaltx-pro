'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type { ComponentPropsWithoutRef } from 'react';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuItem = DropdownMenuPrimitive.Item;
export const DropdownMenuLabel = DropdownMenuPrimitive.Label;
export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;

export function DropdownMenuContent({
  className = '',
  sideOffset = 6,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={`z-[120] min-w-44 overflow-hidden rounded-xl border border-white/10 bg-[#111821] p-1.5 text-sm text-slate-200 shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out ${className}`}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}
