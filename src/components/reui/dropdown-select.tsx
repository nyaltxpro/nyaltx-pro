'use client';

import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/reui/dropdown-menu';

export interface DropdownSelectOption {
  value: string;
  label: string;
}

interface DropdownSelectProps {
  id?: string;
  'aria-label'?: string;
  value: string;
  options: DropdownSelectOption[];
  onValueChange: (value: string) => void;
  className?: string;
}

export function DropdownSelect({
  id,
  'aria-label': ariaLabel,
  value,
  options,
  onValueChange,
  className = '',
}: DropdownSelectProps) {
  const selectedOption = options.find(option => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          id={id}
          type="button"
          aria-label={ariaLabel}
          className={`flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-white/15 bg-[#15191f] px-3 text-left text-sm text-slate-100 outline-none transition focus:border-cyan-400/70 focus:ring-3 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        >
          <span className="truncate">{selectedOption?.label ?? value}</span>
          <ChevronDown className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
        {options.map(option => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => onValueChange(option.value)}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2.5 py-2 outline-none focus:bg-white/10 data-[highlighted]:bg-white/10"
          >
            <span className="truncate">{option.label}</span>
            {option.value === value && (
              <Check className="size-4 shrink-0 text-cyan-300" aria-hidden="true" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
