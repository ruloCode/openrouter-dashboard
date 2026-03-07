'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ApiKey, ActivityItem } from '@/lib/openrouter';
import UsageBreakdown from './UsageBreakdown';
import ActivityChart from './ActivityChart';
import ModelUsageTable from './ModelUsageTable';
import { ArrowLeft, Hash, Tag, Calendar, Shield } from 'lucide-react';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmt(val: number | null | undefined): string {
  if (val == null) return '—';
  return `$${val.toFixed(4)}`;
}

interface KeyDetailPageProps {
  keyData: ApiKey;
  activity: ActivityItem[];
}

export default function KeyDetailPage({ keyData, activity }: KeyDetailPageProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const filteredActivity = useMemo(() => {
    if (!selectedDate) return activity;
    return activity.filter((item) => item.date.split(' ')[0] === selectedDate);
  }, [activity, selectedDate]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <div className="w-px h-5 bg-zinc-700" />
            <h1 className="text-lg font-semibold text-white truncate max-w-[300px]">
              {keyData.name || 'Unnamed Key'}
            </h1>
          </div>
          {keyData.disabled ? (
            <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10">Disabled</Badge>
          ) : (
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10">Active</Badge>
          )}
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Usage Breakdown */}
        <UsageBreakdown keyData={keyData} />

        {/* Key Info Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">Key Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-zinc-800">
                <Hash className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Hash</p>
                <p className="text-sm text-zinc-300 font-mono truncate max-w-[180px]" title={keyData.hash}>
                  {keyData.hash}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-zinc-800">
                <Shield className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Limits</p>
                <p className="text-sm text-zinc-300">
                  {keyData.limit !== null ? `${fmt(keyData.limit)} (${fmt(keyData.limit_remaining)} left)` : 'No limit'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-zinc-800">
                <Tag className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Label</p>
                <p className="text-sm text-zinc-300 font-mono truncate max-w-[180px]">
                  {keyData.label ? `${keyData.label.slice(0, 8)}...` : '—'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-zinc-800">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Created</p>
                <p className="text-sm text-zinc-300">{formatDate(keyData.created_at)}</p>
              </div>
            </div>
          </div>

          {/* BYOK row */}
          {keyData.byok_usage > 0 && (
            <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-wrap gap-4 text-xs text-zinc-400">
              <span>BYOK Daily: <span className="text-zinc-300 font-medium">{fmt(keyData.byok_usage_daily)}</span></span>
              <span>BYOK Weekly: <span className="text-zinc-300 font-medium">{fmt(keyData.byok_usage_weekly)}</span></span>
              <span>BYOK Monthly: <span className="text-zinc-300 font-medium">{fmt(keyData.byok_usage_monthly)}</span></span>
              <span>BYOK Total: <span className="text-zinc-300 font-medium">{fmt(keyData.byok_usage)}</span></span>
            </div>
          )}
        </div>

        {/* Activity Chart */}
        <ActivityChart activity={activity} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        {/* Model Usage Table */}
        <ModelUsageTable activity={filteredActivity} selectedDate={selectedDate} />
      </main>
    </div>
  );
}
