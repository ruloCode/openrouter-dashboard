'use client';

import { useEffect, useState } from 'react';
import { ApiKey } from '@/lib/openrouter';
import { Infinity as InfinityIcon } from 'lucide-react';

interface CreditsBarProps {
  keys: ApiKey[];
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

export default function CreditsBars({ keys }: CreditsBarProps) {
  const keysWithLimit = keys.filter((k) => k.limit !== null && k.limit > 0);
  const totalUsed = keys.reduce((s, k) => s + (k.usage || 0), 0);
  const totalLimit = keysWithLimit.reduce((s, k) => s + (k.limit || 0), 0);
  const totalRemaining = keysWithLimit.reduce((s, k) => s + (k.limit_remaining || 0), 0);
  const globalPct = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;

  const sorted = [...keys].sort((a, b) => (b.usage || 0) - (a.usage || 0));

  return (
    <div className="space-y-4">
      {/* Global Bar */}
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

            <div className="relative">
              <div className="w-full h-4 sm:h-3 rounded-full bg-zinc-800 overflow-hidden">
                <GlobalAnimatedBar pct={globalPct} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-white drop-shadow-md tabular-nums">
                  {globalPct.toFixed(1)}%
                </span>
              </div>
            </div>

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

      {/* Per-Key Grid */}
      {sorted.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {sorted.map((key, i) => {
            const hasLimit = key.limit !== null && key.limit > 0;
            const pct = hasLimit ? ((key.usage || 0) / (key.limit || 1)) * 100 : 0;
            const color = usageColor(pct);
            const gradient = hasLimit ? usageBg(pct) : 'from-zinc-600 to-zinc-500';
            const glow = hasLimit ? usageGlow(pct) : '';

            return (
              <div
                key={key.hash}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-4 space-y-3 opacity-0 animate-fade-up"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'forwards' }}
              >
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

      <style jsx>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-up {
          animation: fade-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

function GlobalAnimatedBar({ pct }: { pct: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(Math.min(pct, 100)), 80);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div
      className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-violet-500 shadow-lg shadow-violet-500/40 transition-all duration-1000 ease-out"
      style={{ width: `${width}%` }}
    />
  );
}
