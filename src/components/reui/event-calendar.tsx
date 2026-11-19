'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/reui/badge';
import { Button } from '@/components/reui/button';
import { Card } from '@/components/reui/card';

export interface CalendarEvent {
  id: string;
  title: string;
  startsAt: string | Date;
  status?: string;
}

interface EventCalendarProps {
  events: CalendarEvent[];
  onEventSelect?: (event: CalendarEvent) => void;
  title?: string;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function EventCalendar({
  events,
  onEventSelect,
  title = 'Event calendar',
}: EventCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const date = new Date(event.startsAt);
      if (!Number.isFinite(date.getTime())) continue;
      const key = toDateKey(date);
      grouped.set(key, [...(grouped.get(key) ?? []), event]);
    }
    return grouped;
  }, [events]);

  const cells = useMemo(() => {
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const totalDays = new Date(year, month + 1, 0).getDate();
    const count = Math.ceil((firstWeekday + totalDays) / 7) * 7;
    return Array.from({ length: count }, (_, index) => {
      const day = index - firstWeekday + 1;
      return day > 0 && day <= totalDays ? new Date(year, month, day) : null;
    });
  }, [month, year]);

  const selectedEvents = eventsByDate.get(selectedDate) ?? [];
  const monthLabel = visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <Card className="p-4 sm:p-5">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="text-xs text-slate-400">{events.length} scheduled item{events.length === 1 ? '' : 's'}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous month"
            onClick={() => setVisibleMonth(new Date(year, month - 1, 1))}
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </Button>
          <span aria-live="polite" className="min-w-32 text-center text-sm font-medium text-slate-200">
            {monthLabel}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next month"
            onClick={() => setVisibleMonth(new Date(year, month + 1, 1))}
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </header>

      <div role="grid" aria-label={monthLabel} className="grid grid-cols-7 overflow-hidden rounded-lg border border-white/10">
        {WEEKDAYS.map(day => (
          <div
            key={day}
            role="columnheader"
            className="border-b border-white/10 bg-white/[0.03] px-1 py-2 text-center text-[10px] font-medium uppercase text-slate-500 sm:text-xs"
          >
            {day}
          </div>
        ))}
        {cells.map((date, index) => {
          const dateKey = date ? toDateKey(date) : `empty-${index}`;
          const dayEvents = date ? eventsByDate.get(dateKey) ?? [] : [];
          const isSelected = dateKey === selectedDate;
          return (
            <button
              key={dateKey}
              type="button"
              role="gridcell"
              aria-label={date ? `${date.toLocaleDateString()}, ${dayEvents.length} scheduled items` : undefined}
              aria-pressed={date ? isSelected : undefined}
              disabled={!date}
              onClick={() => date && setSelectedDate(dateKey)}
              className={`min-h-16 border-b border-r border-white/10 p-1 text-left transition-colors sm:min-h-20 sm:p-2 ${
                !date
                  ? 'bg-black/10'
                  : isSelected
                    ? 'bg-cyan-500/10 ring-1 ring-inset ring-cyan-400/50'
                    : 'bg-transparent hover:bg-white/[0.04]'
              }`}
            >
              {date && (
                <>
                  <span className={`text-xs ${isSelected ? 'font-semibold text-cyan-200' : 'text-slate-400'}`}>
                    {date.getDate()}
                  </span>
                  <span className="mt-1 flex flex-col gap-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <span key={event.id} className="truncate rounded bg-cyan-500/15 px-1 py-0.5 text-[9px] text-cyan-100">
                        {event.title}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-slate-500">+{dayEvents.length - 2} more</span>
                    )}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </h3>
        {selectedEvents.length ? (
          <ul className="space-y-2">
            {selectedEvents.map(event => (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onEventSelect?.(event)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/[0.06]"
                >
                  <span className="min-w-0 truncate">{event.title}</span>
                  {event.status && <Badge variant={event.status === 'published' ? 'success-light' : 'warning-light'} size="xs">{event.status}</Badge>}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No scheduled items for this day.</p>
        )}
      </div>
    </Card>
  );
}
