import type { HTMLAttributes } from 'react';

export function Stepper({ steps, active = 0, className = '' }: { steps: string[]; active?: number; className?: string }) {
  return (
    <ol data-slot="stepper" className={`flex items-center ${className}`}>
      {steps.map((step, index) => (
        <li key={step} className="flex flex-1 items-center last:flex-none">
          <div className="flex items-center gap-2">
            <span className={`flex size-7 items-center justify-center rounded-full border text-xs ${index <= active ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-300' : 'border-white/10 bg-white/[0.03] text-slate-500'}`}>
              {index + 1}
            </span>
            <span className={`hidden text-xs sm:block ${index <= active ? 'text-slate-200' : 'text-slate-500'}`}>{step}</span>
          </div>
          {index < steps.length - 1 && <span className="mx-3 h-px flex-1 bg-white/10" />}
        </li>
      ))}
    </ol>
  );
}
