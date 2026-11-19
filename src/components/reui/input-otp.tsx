'use client';

import { useRef, type KeyboardEvent } from 'react';

interface InputOtpProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function InputOtp({ length = 6, value = '', onChange, className = '' }: InputOtpProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const chars = Array.from({ length }, (_, index) => value[index] || '');

  function update(index: number, next: string) {
    const normalized = next.replace(/\D/g, '').slice(-1);
    const nextValue = chars.map((char, charIndex) => (charIndex === index ? normalized : char)).join('');
    onChange?.(nextValue);
  }

  function handleKey(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !chars[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  return (
    <div data-slot="input-otp" className={`flex gap-2 ${className}`}>
      {chars.map((char, index) => (
        <input
          key={index}
          ref={element => { refs.current[index] = element; }}
          aria-label={`Digit ${index + 1}`}
          inputMode="numeric"
          maxLength={1}
          value={char}
          onChange={event => {
            update(index, event.target.value);
            if (event.target.value && index < length - 1) refs.current[index + 1]?.focus();
          }}
          onKeyDown={event => handleKey(index, event)}
          className="size-10 rounded-lg border border-white/15 bg-white/[0.03] text-center text-lg text-slate-100 outline-none focus:border-cyan-400/70"
        />
      ))}
    </div>
  );
}
