'use client';

import { useEffect, useState } from 'react';
import { ApiKey } from '@/lib/openrouter';
import { TrendingUp, Clock, CalendarDays, CalendarRange } from 'lucide-react';

function fmt(val: number) {
  return `$${val.toFixed(4)}`;
}

function AnimatedBar({ pct, delay = 0 }: { pct: number; delay?: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(Math.min(pct, 100)), 50 + delay);
    return () => clearTimeout(timer);
  }, [pct, delay]);

  return (
    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30 transition-all duration-1000 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

interface UsageCardProps {
  title: string;
  icon: React.ElementType;
  usage: number;
  byokUsage: number;
  limit: number | null;
  delay: number;
}

function UsageCard({ title, icon: Icon, usage, byokUsage, limit, delay }: UsageCardProps) {
  const hasLimit = limit !== null && limit > 0;
  const pct = hasLimit ? (usage / limit) * 100 : 0;

  return (
    <div
      className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-4 space-y-3 opacity-0 animate-fade-up relative overflow-hidden"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-600/10">
            <Icon className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{title}</span>
        </div>
        {hasLimit && (
          <span className="text-[10px] text-zinc-500">/ {fmt(limit)}</span>
        )}
      </div>

      <p className="text-2xl font-mono font-bold text-white tabular-nums">{fmt(usage)}</p>

      {hasLimit && <AnimatedBar pct={pct} delay={delay} />}

      {byokUsage > 0 && (
        <p className="text-[10px] text-zinc-500">
          BYOK: {fmt(byokUsage)}
        </p>
      )}
    </div>
  );
}

export default function UsageBreakdown({ keyData }: { keyData: ApiKey }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      <UsageCard
        title="Total Usage"
        icon={TrendingUp}
        usage={keyData.usage}
        byokUsage={keyData.byok_usage}
        limit={keyData.limit}
        delay={0}
      />
      <UsageCard
        title="Daily"
        icon={Clock}
        usage={keyData.usage_daily}
        byokUsage={keyData.byok_usage_daily}
        limit={null}
        delay={60}
      />
      <UsageCard
        title="Weekly"
        icon={CalendarDays}
        usage={keyData.usage_weekly}
        byokUsage={keyData.byok_usage_weekly}
        limit={null}
        delay={120}
      />
      <UsageCard
        title="Monthly"
        icon={CalendarRange}
        usage={keyData.usage_monthly}
        byokUsage={keyData.byok_usage_monthly}
        limit={null}
        delay={180}
      />
    </div>
  );
}
