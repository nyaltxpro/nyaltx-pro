'use client';

import { Smile } from 'lucide-react';
import { useState } from 'react';

const EMOJIS = [
  ['😀', 'Grinning face'],
  ['😂', 'Face with tears of joy'],
  ['😍', 'Heart eyes'],
  ['😊', 'Smiling face'],
  ['🤔', 'Thinking face'],
  ['👍', 'Thumbs up'],
  ['👏', 'Clapping hands'],
  ['🙏', 'Folded hands'],
  ['🎉', 'Party popper'],
  ['🔥', 'Fire'],
  ['💡', 'Light bulb'],
  ['💯', 'Hundred points'],
  ['❤️', 'Red heart'],
  ['✅', 'Check mark'],
  ['🚀', 'Rocket'],
  ['🌟', 'Glowing star'],
] as const;

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  label?: string;
  disabled?: boolean;
}

export function EmojiPicker({
  onSelect,
  label = 'Insert emoji',
  disabled = false,
}: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        onKeyDown={event => {
          if (event.key === 'Escape') setOpen(false);
        }}
        disabled={disabled}
        className="inline-flex size-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 disabled:opacity-50"
      >
        <Smile aria-hidden="true" className="size-4" />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Emoji picker"
          className="absolute bottom-full right-0 z-[130] mb-2 w-56 rounded-xl border border-white/10 bg-[#111821] p-3 shadow-xl"
        >
          <div className="grid grid-cols-4 gap-1">
            {EMOJIS.map(([emoji, name]) => (
              <button
                key={emoji}
                type="button"
                aria-label={name}
                title={name}
                onClick={() => {
                  onSelect(emoji);
                  setOpen(false);
                }}
                className="flex size-10 items-center justify-center rounded-lg text-xl transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
