'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { ActivityItem } from '@/lib/openrouter';
import { X } from 'lucide-react';

function fmt(val: number) {
  return `$${val.toFixed(4)}`;
}

function fmtTokens(val: number) {
  return val.toLocaleString('en-US');
}

function formatFullDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface DayData {
  date: string;
  usage: number;
  requests: number;
  tokens: number;
}

interface ActivityChartProps {
  activity: ActivityItem[];
  selectedDate?: string | null;
  onSelectDate?: (date: string | null) => void;
}

export default function ActivityChart({ activity, selectedDate, onSelectDate }: ActivityChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clear selection on Escape
  useEffect(() => {
    if (!selectedDate) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSelectDate?.(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedDate, onSelectDate]);

  const days = useMemo(() => {
    const map = new Map<string, DayData>();

    for (const item of activity) {
      const dateKey = item.date.split(' ')[0];
      const existing = map.get(dateKey);
      if (existing) {
        existing.usage += item.usage;
        existing.requests += item.requests;
        existing.tokens += item.prompt_tokens + item.completion_tokens + item.reasoning_tokens;
      } else {
        map.set(dateKey, {
          date: dateKey,
          usage: item.usage,
          requests: item.requests,
          tokens: item.prompt_tokens + item.completion_tokens + item.reasoning_tokens,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [activity]);

  const maxUsage = useMemo(() => Math.max(...days.map((d) => d.usage), 0.0001), [days]);

  const selectedDay = useMemo(
    () => (selectedDate ? days.find((d) => d.date === selectedDate) : null),
    [days, selectedDate]
  );

  const handleBarClick = useCallback(
    (date: string) => {
      onSelectDate?.(selectedDate === date ? null : date);
    },
    [selectedDate, onSelectDate]
  );

  const handleBarKeyDown = useCallback(
    (e: React.KeyboardEvent, date: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleBarClick(date);
      }
    },
    [handleBarClick]
  );

  if (days.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-6">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">
          Account Activity (30 days)
        </h3>
        <div className="text-center py-12 text-zinc-500">No activity data available.</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
          Account Activity ({days.length} days)
        </h3>
        {selectedDate && (
          <button
            onClick={() => onSelectDate?.(null)}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
            Clear filter
          </button>
        )}
      </div>

      <div className="relative">
        {/* Tooltip — only show when no selection active */}
        {hoveredIdx !== null && days[hoveredIdx] && !selectedDate && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-20 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs pointer-events-none whitespace-nowrap shadow-xl">
            <p className="text-white font-medium">{days[hoveredIdx].date}</p>
            <p className="text-zinc-400">
              {fmt(days[hoveredIdx].usage)} &middot; {days[hoveredIdx].requests} req &middot; {fmtTokens(days[hoveredIdx].tokens)} tok
            </p>
          </div>
        )}

        {/* Bars */}
        <div className="flex items-end gap-[2px] h-40">
          {days.map((day, i) => {
            const heightPct = mounted ? (day.usage / maxUsage) * 100 : 0;
            const isHovered = hoveredIdx === i;
            const isSelected = selectedDate === day.date;
            const hasSelection = selectedDate !== null;

            let opacity: number;
            let barClass: string;

            if (isSelected) {
              opacity = 1;
              barClass = 'bg-gradient-to-t from-violet-400 to-fuchsia-400 shadow-lg shadow-violet-500/30';
            } else if (hasSelection) {
              opacity = 0.3;
              barClass = 'bg-gradient-to-t from-violet-600 to-fuchsia-500';
            } else if (isHovered) {
              opacity = 1;
              barClass = 'bg-gradient-to-t from-violet-400 to-fuchsia-400 shadow-lg shadow-violet-500/30';
            } else {
              opacity = 0.7;
              barClass = 'bg-gradient-to-t from-violet-600 to-fuchsia-500';
            }

            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center justify-end cursor-pointer group relative"
                style={{ height: '100%' }}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`${day.date}: ${fmt(day.usage)}, ${day.requests} requests`}
                onClick={() => handleBarClick(day.date)}
                onKeyDown={(e) => handleBarKeyDown(e, day.date)}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div
                  className={`w-full rounded-t-sm transition-all duration-700 ease-out ${barClass}`}
                  style={{
                    height: `${Math.max(heightPct, 1)}%`,
                    transitionDelay: `${i * 20}ms`,
                    opacity,
                    minHeight: '2px',
                  }}
                />
                {/* Selection dot */}
                {isSelected && (
                  <div className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-violet-400" />
                )}
              </div>
            );
          })}
        </div>

        {/* Date labels */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-zinc-600">{days[0]?.date}</span>
          <span className="text-[10px] text-zinc-600">{days[days.length - 1]?.date}</span>
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <div className="mt-4 pt-4 border-t border-zinc-800 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white">{formatFullDate(selectedDay.date)}</h4>
            <button
              onClick={() => onSelectDate?.(null)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Clear selection
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Cost</p>
              <p className="text-lg font-mono tabular-nums text-white">{fmt(selectedDay.usage)}</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Requests</p>
              <p className="text-lg font-mono tabular-nums text-white">{fmtTokens(selectedDay.requests)}</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Tokens</p>
              <p className="text-lg font-mono tabular-nums text-white">{fmtTokens(selectedDay.tokens)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
