'use client';

import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ActivityItem } from '@/lib/openrouter';

interface ModelRow {
  model: string;
  provider: string;
  requests: number;
  promptTokens: number;
  completionTokens: number;
  reasoningTokens: number;
  cost: number;
}

function fmtTokens(val: number) {
  return val.toLocaleString('en-US');
}

function fmtUsd(val: number) {
  return `$${val.toFixed(4)}`;
}

export default function ModelUsageTable({ activity }: { activity: ActivityItem[] }) {
  const models = useMemo(() => {
    const map = new Map<string, ModelRow>();

    for (const item of activity) {
      const key = item.model;
      const existing = map.get(key);
      if (existing) {
        existing.requests += item.requests;
        existing.promptTokens += item.prompt_tokens;
        existing.completionTokens += item.completion_tokens;
        existing.reasoningTokens += item.reasoning_tokens;
        existing.cost += item.usage;
      } else {
        map.set(key, {
          model: item.model,
          provider: item.provider_name,
          requests: item.requests,
          promptTokens: item.prompt_tokens,
          completionTokens: item.completion_tokens,
          reasoningTokens: item.reasoning_tokens,
          cost: item.usage,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.cost - a.cost);
  }, [activity]);

  if (models.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-6">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">
          Account Models
        </h3>
        <div className="text-center py-8 text-zinc-500">No model usage data available.</div>
      </div>
    );
  }

  const totalCost = models.reduce((s, m) => s + m.cost, 0);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
          Account Models
        </h3>
        <span className="text-xs text-zinc-500">{models.length} model{models.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-medium">Model</TableHead>
              <TableHead className="text-zinc-400 font-medium">Provider</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">Requests</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">Prompt Tokens</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">Completion Tokens</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">Reasoning</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">Cost</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map((m) => {
              const share = totalCost > 0 ? (m.cost / totalCost) * 100 : 0;
              return (
                <TableRow key={m.model} className="border-zinc-800 hover:bg-zinc-800/40">
                  <TableCell className="text-white font-medium text-sm max-w-[200px] truncate" title={m.model}>
                    {m.model}
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">{m.provider}</TableCell>
                  <TableCell className="text-zinc-300 text-right tabular-nums">{fmtTokens(m.requests)}</TableCell>
                  <TableCell className="text-zinc-300 text-right tabular-nums">{fmtTokens(m.promptTokens)}</TableCell>
                  <TableCell className="text-zinc-300 text-right tabular-nums">{fmtTokens(m.completionTokens)}</TableCell>
                  <TableCell className="text-zinc-300 text-right tabular-nums">{fmtTokens(m.reasoningTokens)}</TableCell>
                  <TableCell className="text-white text-right font-medium tabular-nums">{fmtUsd(m.cost)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                          style={{ width: `${Math.min(share, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 tabular-nums w-10 text-right">{share.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
