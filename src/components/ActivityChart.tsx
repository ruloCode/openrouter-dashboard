'use client';

import { useState, useMemo, useEffect } from 'react';
import { ActivityItem } from '@/lib/openrouter';

function fmt(val: number) {
  return `$${val.toFixed(4)}`;
}

function fmtTokens(val: number) {
  return val.toLocaleString('en-US');
}

interface DayData {
  date: string;
  usage: number;
  requests: number;
  tokens: number;
}

export default function ActivityChart({ activity }: { activity: ActivityItem[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const days = useMemo(() => {
    const map = new Map<string, DayData>();

    for (const item of activity) {
      const dateKey = item.date.split(' ')[0]; // normalize "2026-03-06 00:00:00" → "2026-03-06"
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
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-6">
        Account Activity ({days.length} days)
      </h3>

      <div className="relative">
        {/* Tooltip */}
        {hoveredIdx !== null && days[hoveredIdx] && (
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

            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center justify-end cursor-pointer group relative"
                style={{ height: '100%' }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div
                  className={`w-full rounded-t-sm transition-all duration-700 ease-out ${
                    isHovered
                      ? 'bg-gradient-to-t from-violet-400 to-fuchsia-400 shadow-lg shadow-violet-500/30'
                      : 'bg-gradient-to-t from-violet-600 to-fuchsia-500'
                  }`}
                  style={{
                    height: `${Math.max(heightPct, 1)}%`,
                    transitionDelay: `${i * 20}ms`,
                    opacity: isHovered ? 1 : 0.7,
                    minHeight: '2px',
                  }}
                />
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
    </div>
  );
}
