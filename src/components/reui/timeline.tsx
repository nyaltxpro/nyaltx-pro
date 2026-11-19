import type { HTMLAttributes, ReactNode } from 'react';
import { Marker } from '@/components/reui/marker';

export function Timeline({ className = '', ...props }: HTMLAttributes<HTMLOListElement>) {
  return <ol data-slot="timeline" className={`space-y-4 ${className}`} {...props} />;
}

export function TimelineItem({ title, children, time }: { title: ReactNode; children?: ReactNode; time?: ReactNode }) {
  return (
    <li className="relative flex gap-3">
      <Marker className="mt-2" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-slate-200">{title}</div>
          {time && <div className="text-xs text-slate-500">{time}</div>}
        </div>
        {children && <div className="mt-1 text-xs text-slate-400">{children}</div>}
      </div>
    </li>
  );
}
