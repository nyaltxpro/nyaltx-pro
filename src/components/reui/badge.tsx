import type { HTMLAttributes } from 'react';

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'info'
  | 'success'
  | 'warning'
  | 'invert'
  | 'primary-outline'
  | 'warning-outline'
  | 'success-outline'
  | 'info-outline'
  | 'destructive-outline'
  | 'invert-outline'
  | 'primary-light'
  | 'warning-light'
  | 'success-light'
  | 'info-light'
  | 'destructive-light'
  | 'invert-light';

type BadgeSize = 'default' | 'xs' | 'sm' | 'lg' | 'xl';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  radius?: 'default' | 'full';
}

const variants: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-cyan-500 text-white',
  secondary: 'border-transparent bg-slate-700 text-slate-100',
  destructive: 'border-transparent bg-red-500 text-white',
  outline: 'border-white/20 bg-transparent text-slate-200',
  info: 'border-transparent bg-blue-500 text-white',
  success: 'border-transparent bg-emerald-600 text-white',
  warning: 'border-transparent bg-amber-400 text-amber-950',
  invert: 'border-transparent bg-white text-slate-950',
  'primary-outline': 'border-cyan-400/40 bg-transparent text-cyan-200',
  'warning-outline': 'border-amber-400/40 bg-transparent text-amber-200',
  'success-outline': 'border-emerald-400/40 bg-transparent text-emerald-200',
  'info-outline': 'border-blue-400/40 bg-transparent text-blue-200',
  'destructive-outline': 'border-red-400/40 bg-transparent text-red-200',
  'invert-outline': 'border-white/30 bg-transparent text-white',
  'primary-light': 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
  'warning-light': 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  'success-light': 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  'info-light': 'border-blue-400/20 bg-blue-400/10 text-blue-200',
  'destructive-light': 'border-red-400/20 bg-red-400/10 text-red-200',
  'invert-light': 'border-white/20 bg-white/10 text-white',
};

const sizes: Record<BadgeSize, string> = {
  xs: 'h-4 gap-1 rounded px-1 text-[10px]',
  sm: 'h-5 gap-1 rounded px-1.5 text-[11px]',
  default: 'h-6 gap-1.5 rounded px-2 text-xs',
  lg: 'h-7 gap-1.5 rounded px-2.5 text-sm',
  xl: 'h-8 gap-2 rounded px-3 text-sm',
};

export function Badge({
  className = '',
  variant = 'default',
  size = 'default',
  radius = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap border font-medium transition-colors ${variants[variant]} ${sizes[size]} ${radius === 'full' ? 'rounded-full' : ''} ${className}`}
      {...props}
    />
  );
}
