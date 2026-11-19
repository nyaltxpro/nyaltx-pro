import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

type AlertVariant = 'info' | 'success' | 'warning' | 'destructive';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const alertStyles: Record<AlertVariant, { className: string; icon: typeof Info }> = {
  info: {
    className: 'border-blue-400/20 bg-blue-400/10 text-blue-100',
    icon: Info,
  },
  success: {
    className: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
    icon: CheckCircle2,
  },
  warning: {
    className: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
    icon: TriangleAlert,
  },
  destructive: {
    className: 'border-red-400/20 bg-red-400/10 text-red-100',
    icon: AlertCircle,
  },
};

export function Alert({
  variant = 'info',
  title,
  children,
  className = '',
}: AlertProps) {
  const { className: variantClassName, icon: Icon } = alertStyles[variant];

  return (
    <div
      role={variant === 'success' ? 'status' : 'alert'}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${variantClassName} ${className}`}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">
        {title && <p className="mb-1 font-medium">{title}</p>}
        <div className="text-current/90">{children}</div>
      </div>
    </div>
  );
}
