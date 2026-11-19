import { CalendarDays } from 'lucide-react';
import type { ComponentProps } from 'react';

type CalendarInputProps = Omit<ComponentProps<'input'>, 'type'> & {
  type?: 'date' | 'datetime-local';
  showIcon?: boolean;
};

export function CalendarInput({
  className = '',
  type = 'date',
  showIcon = true,
  ...props
}: CalendarInputProps) {
  return (
    <div className="relative">
      {showIcon && (
        <CalendarDays
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-slate-400"
        />
      )}
      <input
        data-slot="calendar-input"
        type={type}
        className={`w-full ${showIcon ? 'pl-10' : ''} ${className}`}
        {...props}
      />
    </div>
  );
}
