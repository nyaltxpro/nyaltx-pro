import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  default: 'border border-transparent bg-cyan-500 text-white hover:bg-cyan-400',
  secondary: 'border border-transparent bg-slate-700 text-slate-100 hover:bg-slate-600',
  outline: 'border border-white/15 bg-transparent text-slate-200 hover:bg-white/5',
  ghost: 'border border-transparent bg-transparent text-slate-300 hover:bg-white/5 hover:text-white',
  destructive: 'border border-transparent bg-red-500/15 text-red-200 hover:bg-red-500/25',
  link: 'border border-transparent bg-transparent text-cyan-300 underline-offset-4 hover:underline',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 rounded-md px-3 text-xs',
  default: 'h-9 gap-2 rounded-lg px-4 text-sm',
  lg: 'h-10 gap-2 rounded-lg px-5 text-sm',
  icon: 'size-9 rounded-lg p-0',
};

export function Button({
  className = '',
  variant = 'default',
  size = 'default',
  type = 'button',
  asChild = false,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      data-slot="button"
      {...(!asChild ? { type } : {})}
      className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
