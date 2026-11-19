'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import type { ComponentProps } from 'react';

type AvatarSize = 'sm' | 'default' | 'lg';

const avatarSizes: Record<AvatarSize, string> = {
  sm: 'size-8',
  default: 'size-10',
  lg: 'size-12',
};

interface AvatarProps extends ComponentProps<typeof AvatarPrimitive.Root> {
  size?: AvatarSize;
}

export function Avatar({ className = '', size = 'default', ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={`relative inline-flex shrink-0 rounded-full ${avatarSizes[size]} ${className}`}
      {...props}
    />
  );
}

export function AvatarImage({
  className = '',
  ...props
}: ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={`size-full rounded-full object-cover ${className}`}
      {...props}
    />
  );
}

export function AvatarFallback({
  className = '',
  ...props
}: ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={`flex size-full items-center justify-center rounded-full bg-slate-800 text-sm font-medium text-slate-100 ${className}`}
      {...props}
    />
  );
}
