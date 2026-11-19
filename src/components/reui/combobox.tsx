'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  id: string;
  name?: string;
  value: string;
  options: ComboboxOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function Combobox({
  id,
  name,
  value,
  options,
  onValueChange,
  placeholder = 'Choose an option',
  required = false,
  className = '',
}: ComboboxProps) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = options.find(option => option.value === value);
  const [query, setQuery] = useState(selected?.label || '');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const matches = options.filter(option =>
    option.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    if (!open) setQuery(selected?.label || '');
  }, [open, selected?.label]);

  const choose = (option: ComboboxOption) => {
    onValueChange(option.value);
    setQuery(option.label);
    setOpen(false);
    inputRef.current?.setCustomValidity('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(index =>
        matches.length ? (index < 0 ? 0 : Math.min(index + 1, matches.length - 1)) : -1
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(index => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && open && matches[activeIndex]) {
      event.preventDefault();
      choose(matches[activeIndex]);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setQuery(selected?.label || '');
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && matches[activeIndex] ? `${listId}-${activeIndex}` : undefined}
        aria-required={required}
        required={required && !value}
        autoComplete="off"
        value={query}
        placeholder={placeholder}
        onFocus={() => {
          setActiveIndex(-1);
          setOpen(true);
          setQuery('');
        }}
        onBlur={() => {
          setOpen(false);
          setQuery(selected?.label || '');
          inputRef.current?.setCustomValidity(
            required && !selected ? 'Choose an option from the list.' : ''
          );
        }}
        onChange={event => {
          const nextQuery = event.target.value;
          const exactMatch = options.find(
            option =>
              option.label.toLowerCase() === nextQuery.trim().toLowerCase() ||
              option.value.toLowerCase() === nextQuery.trim().toLowerCase()
          );
          setQuery(nextQuery);
          setActiveIndex(0);
          setOpen(true);
          onValueChange(exactMatch?.value || '');
          inputRef.current?.setCustomValidity(
            required && nextQuery.length > 0 && !exactMatch ? 'Choose an option from the list.' : ''
          );
        }}
        onKeyDown={handleKeyDown}
        className={`w-full pr-10 ${className}`}
      />
      <ChevronsUpDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-40 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-white/10 bg-[#111821] p-1 shadow-xl"
        >
          {matches.length ? (
            matches.map((option, index) => (
              <li key={option.value} role="presentation">
                <button
                  id={`${listId}-${index}`}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={value === option.value}
                  onMouseDown={event => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(option)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                    index === activeIndex ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {option.label}
                  {value === option.value && <Check aria-hidden="true" className="size-4 text-cyan-300" />}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-slate-400" role="presentation">
              No matching options.
            </li>
          )}
        </ul>
      )}
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
}
