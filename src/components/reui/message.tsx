import type { HTMLAttributes, ReactNode } from 'react';

interface MessageProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  tone?: 'info' | 'success' | 'warning' | 'error';
}

const tones = {
  info: 'border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-100',
  success: 'border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-100',
  warning: 'border-amber-400/20 bg-amber-400/[0.07] text-amber-100',
  error: 'border-rose-400/20 bg-rose-400/[0.07] text-rose-100',
};

export function Message({ title, tone = 'info', className = '', children, ...props }: MessageProps) {
  return (
    <div data-slot="message" role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border p-3 ${tones[tone]} ${className}`} {...props}>
      {title && <div className="mb-1 font-medium">{title}</div>}
      <div className="text-sm opacity-90">{children}</div>
    </div>
  );
}
