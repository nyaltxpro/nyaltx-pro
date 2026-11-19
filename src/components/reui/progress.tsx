interface ProgressProps {
  value?: number;
  className?: string;
  label?: string;
}

export function Progress({ value = 0, className = '', label }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={label}
      className={`h-2 overflow-hidden rounded-full bg-white/10 ${className}`}
    >
      <div className="h-full rounded-full bg-cyan-400 transition-[width]" style={{ width: `${clamped}%` }} />
    </div>
  );
}
