'use client';

import { useEffect, useState } from 'react';
import { ApiKey, CreditsData } from '@/lib/openrouter';
import { Infinity as InfinityIcon } from 'lucide-react';

interface CreditsBarProps {
  keys: ApiKey[];
  credits: CreditsData | null;
}

function fmt(val: number) {
  return `$${val.toFixed(2)}`;
}

function usageColor(pct: number) {
  if (pct >= 80) return 'text-red-400';
  if (pct >= 50) return 'text-amber-400';
  return 'text-emerald-400';
}

function usageBg(pct: number) {
  if (pct >= 80) return 'from-red-500 to-orange-500';
  if (pct >= 50) return 'from-amber-500 to-yellow-400';
  return 'from-emerald-500 to-teal-400';
}

function usageGlow(pct: number) {
  if (pct >= 80) return 'shadow-red-500/50';
  if (pct >= 50) return 'shadow-amber-500/50';
  return 'shadow-emerald-500/50';
}

function balanceColor(pct: number) {
  if (pct >= 80) return 'text-red-400';
  if (pct >= 50) return 'text-amber-400';
  return 'text-emerald-400';
}

function balanceBadgeBg(pct: number) {
  if (pct >= 80) return 'bg-red-500/15 text-red-400 border-red-500/30';
  if (pct >= 50) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
}

interface AnimatedBarProps {
  pct: number;
  gradient: string;
  glow: string;
  height?: string;
  delay?: number;
}

function AnimatedBar({ pct, gradient, glow, height = 'h-2', delay = 0 }: AnimatedBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(Math.min(pct, 100)), 50 + delay);
    return () => clearTimeout(timer);
  }, [pct, delay]);

  return (
    <div className={`w-full ${height} rounded-full bg-zinc-800 overflow-hidden relative`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r ${gradient} shadow-lg ${glow} transition-all duration-1000 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function HeroAnimatedBar({ pct }: { pct: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(Math.min(pct, 100)), 80);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div className="w-full h-5 rounded-full bg-zinc-800 overflow-hidden relative">
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/40 transition-all duration-1000 ease-out relative overflow-hidden"
        style={{ width: `${width}%` }}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 animate-shimmer">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>
      {/* Percentage label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[10px] font-bold text-white drop-shadow-md tabular-nums">
          {pct.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

function AccountHero({ credits }: { credits: CreditsData }) {
  const { total_credits, total_usage } = credits;
  const balance = total_credits - total_usage;
  const pct = total_credits > 0 ? (total_usage / total_credits) * 100 : 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-5 sm:p-6 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-violet-600/10 rounded-full blur-3xl animate-glow-pulse pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-fuchsia-600/10 rounded-full blur-3xl animate-glow-pulse pointer-events-none" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-glow-pulse" />
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Account Balance
          </span>
        </div>

        {/* Numbers */}
        <div className="flex items-end justify-between mb-4 gap-4">
          <div>
            <p className="text-3xl font-mono font-bold text-white tabular-nums">{fmt(total_usage)}</p>
            <p className="text-xs text-zinc-500 mt-0.5">used</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-mono font-bold text-zinc-400 tabular-nums">{fmt(total_credits)}</p>
            <p className="text-xs text-zinc-500 mt-0.5">total credits</p>
          </div>
        </div>

        {/* Progress bar */}
        <HeroAnimatedBar pct={pct} />

        {/* Balance remaining */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold tabular-nums ${balanceColor(pct)}`}>
              {fmt(balance)}
            </span>
            <span className="text-xs text-zinc-500">remaining</span>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${balanceBadgeBg(pct)}`}>
            {pct.toFixed(1)}% used
          </span>
        </div>
      </div>
    </div>
  );
}

function GlobalBarFallback({ keys }: { keys: ApiKey[] }) {
  const keysWithLimit = keys.filter((k) => k.limit !== null && k.limit > 0);
  const totalUsed = keys.reduce((s, k) => s + (k.usage || 0), 0);
  const totalLimit = keysWithLimit.reduce((s, k) => s + (k.limit || 0), 0);
  const totalRemaining = keysWithLimit.reduce((s, k) => s + (k.limit_remaining || 0), 0);
  const globalPct = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Global Credit Usage
        </span>
        {keysWithLimit.length > 0 && (
          <span className="text-xs text-zinc-500">
            {keysWithLimit.length} key{keysWithLimit.length !== 1 ? 's' : ''} with limits
          </span>
        )}
      </div>

      {totalLimit > 0 ? (
        <>
          <div className="flex items-end justify-between mb-2 gap-4">
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-white tabular-nums">{fmt(totalUsed)}</p>
              <p className="text-xs text-zinc-500 mt-0.5">used</p>
            </div>
            <div className="text-right">
              <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${globalPct >= 80 ? 'text-red-400' : globalPct >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {fmt(totalRemaining)}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">remaining</p>
            </div>
          </div>

          <AnimatedBar
            pct={globalPct}
            gradient="from-emerald-500 via-teal-400 to-violet-500"
            glow="shadow-violet-500/40"
            height="h-4 sm:h-3"
          />

          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-zinc-600">{fmt(0)}</span>
            <span className="text-[10px] text-zinc-600">{fmt(totalLimit)}</span>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-3 rounded-full bg-zinc-800" />
          <span className="text-sm text-zinc-500 shrink-0">No limits set</span>
          <div className="flex-1 h-3 rounded-full bg-zinc-800" />
        </div>
      )}

      {totalLimit === 0 && totalUsed > 0 && (
        <p className="text-2xl font-bold text-white tabular-nums mt-2">
          {fmt(totalUsed)} <span className="text-sm text-zinc-500 font-normal">total usage across all keys</span>
        </p>
      )}
    </div>
  );
}

export default function CreditsBars({ keys, credits }: CreditsBarProps) {
  const totalUsed = keys.reduce((s, k) => s + (k.usage || 0), 0);
  const sorted = [...keys].sort((a, b) => (b.usage || 0) - (a.usage || 0));

  return (
    <div className="space-y-4">
      {/* Hero: Account Balance or Fallback Global Bar */}
      {credits ? <AccountHero credits={credits} /> : <GlobalBarFallback keys={keys} />}

      {/* Per-Key Grid */}
      {sorted.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {sorted.map((key, i) => {
            const hasLimit = key.limit !== null && key.limit > 0;
            const pct = hasLimit ? ((key.usage || 0) / (key.limit || 1)) * 100 : 0;
            const color = usageColor(pct);
            const gradient = hasLimit ? usageBg(pct) : 'from-zinc-600 to-zinc-500';
            const glow = hasLimit ? usageGlow(pct) : '';
            const accountPct = totalUsed > 0 ? ((key.usage || 0) / totalUsed) * 100 : 0;

            return (
              <div
                key={key.hash}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-4 space-y-3 opacity-0 animate-fade-up hover:border-zinc-700 hover:bg-zinc-900/80 transition-colors duration-200 relative overflow-hidden"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'forwards' }}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

                {/* Key name + badge */}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white truncate flex-1" title={key.name}>
                    {key.name || key.label || 'Unnamed Key'}
                  </p>
                  <span
                    className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                      key.disabled
                        ? 'text-zinc-500 border-zinc-700 bg-zinc-800/50'
                        : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                    }`}
                  >
                    {key.disabled ? 'disabled' : 'active'}
                  </span>
                </div>

                {/* Usage amount */}
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-xl font-bold tabular-nums ${hasLimit ? color : 'text-zinc-300'}`}>
                    {fmt(key.usage || 0)}
                  </span>
                  {hasLimit ? (
                    <span className="text-xs text-zinc-500">
                      / {fmt(key.limit || 0)}
                    </span>
                  ) : (
                    <InfinityIcon className="w-3.5 h-3.5 text-zinc-600" />
                  )}
                </div>

                {/* Progress bar */}
                <AnimatedBar
                  pct={hasLimit ? pct : 0}
                  gradient={gradient}
                  glow={glow}
                  height="h-3 sm:h-2"
                  delay={i * 40}
                />

                {/* Account share mini bar */}
                {totalUsed > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-600">
                      <span>{accountPct.toFixed(1)}% of total usage</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500/60 to-fuchsia-500/60 transition-all duration-700 ease-out"
                        style={{ width: `${Math.min(accountPct, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Remaining / no limit */}
                {hasLimit ? (
                  <div className="flex justify-between text-[10px] text-zinc-600">
                    <span className={`font-medium ${color}`}>{pct.toFixed(1)}% used</span>
                    <span>{fmt(key.limit_remaining || 0)} left</span>
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-600">No spending limit</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
