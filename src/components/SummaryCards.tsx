'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiKey } from '@/lib/openrouter';
import { Key, CheckCircle, TrendingUp, Wallet } from 'lucide-react';

interface SummaryCardsProps {
  keys: ApiKey[];
}

export default function SummaryCards({ keys }: SummaryCardsProps) {
  const totalKeys = keys.length;
  const activeKeys = keys.filter((k) => !k.disabled).length;
  const totalUsage = keys.reduce((sum, k) => sum + (k.usage || 0), 0);
  const totalLimitRemaining = keys.reduce((sum, k) => sum + (k.limit_remaining || 0), 0);

  const cards = [
    {
      title: 'Total Keys',
      value: totalKeys,
      icon: Key,
      color: 'text-violet-400',
      bg: 'bg-violet-600/10',
      border: 'border-violet-500/20',
    },
    {
      title: 'Active Keys',
      value: activeKeys,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-600/10',
      border: 'border-emerald-500/20',
    },
    {
      title: 'Total Usage',
      value: `$${totalUsage.toFixed(4)}`,
      icon: TrendingUp,
      color: 'text-blue-400',
      bg: 'bg-blue-600/10',
      border: 'border-blue-500/20',
    },
    {
      title: 'Limit Remaining',
      value: `$${totalLimitRemaining.toFixed(4)}`,
      icon: Wallet,
      color: 'text-amber-400',
      bg: 'bg-amber-600/10',
      border: 'border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className={`bg-zinc-900 border-zinc-800 ${card.border}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">{card.title}</CardTitle>
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
