import { Input, type InputProps } from '@/components/reui/input';

export function PhoneInput({ className = '', ...props }: InputProps) {
  return (
    <div data-slot="phone-input" className={`flex items-center ${className}`}>
      <span className="flex h-10 items-center rounded-l-lg border border-r-0 border-white/15 bg-white/[0.04] px-3 text-sm text-slate-400">
        +
      </span>
      <Input
        type="tel"
        inputMode="tel"
        className="rounded-l-none"
        {...props}
      />
    </div>
  );
}
