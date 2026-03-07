'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiKey } from '@/lib/openrouter';
import { slugify } from '@/lib/utils';
import { Edit2, Trash2 } from 'lucide-react';

interface KeysTableProps {
  keys: ApiKey[];
  onEdit: (key: ApiKey) => void;
  onDelete: (key: ApiKey) => void;
}

function maskLabel(label: string): string {
  if (!label) return '—';
  if (label.length <= 8) return '••••••••';
  return label.slice(0, 4) + '••••••••' + label.slice(-4);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatUsd(val: number | null | undefined): string {
  if (val == null) return '—';
  return `$${val.toFixed(4)}`;
}

export default function KeysTable({ keys, onEdit, onDelete }: KeysTableProps) {
  if (keys.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500">
        No API keys found. Create one to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400 font-medium">Name</TableHead>
            <TableHead className="text-zinc-400 font-medium">Label</TableHead>
            <TableHead className="text-zinc-400 font-medium">Status</TableHead>
            <TableHead className="text-zinc-400 font-medium">Limit</TableHead>
            <TableHead className="text-zinc-400 font-medium">Remaining</TableHead>
            <TableHead className="text-zinc-400 font-medium">Usage</TableHead>
            <TableHead className="text-zinc-400 font-medium">Daily</TableHead>
            <TableHead className="text-zinc-400 font-medium">Weekly</TableHead>
            <TableHead className="text-zinc-400 font-medium">Monthly</TableHead>
            <TableHead className="text-zinc-400 font-medium">BYOK</TableHead>
            <TableHead className="text-zinc-400 font-medium">Created</TableHead>
            <TableHead className="text-zinc-400 font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => (
            <TableRow key={key.hash} className="border-zinc-800 hover:bg-zinc-800/40">
              <TableCell className="font-medium max-w-[150px] truncate">
                {key.name ? (
                  <Link
                    href={`/key?name=${encodeURIComponent(slugify(key.name))}`}
                    className="text-white hover:text-violet-400 transition-colors"
                  >
                    {key.name}
                  </Link>
                ) : '—'}
              </TableCell>
              <TableCell className="font-mono text-xs text-zinc-400">{maskLabel(key.label)}</TableCell>
              <TableCell>
                {key.disabled ? (
                  <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10">Disabled</Badge>
                ) : (
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10">Active</Badge>
                )}
              </TableCell>
              <TableCell className="text-zinc-300">{formatUsd(key.limit)}</TableCell>
              <TableCell className="text-zinc-300">{formatUsd(key.limit_remaining)}</TableCell>
              <TableCell className="text-zinc-300">{formatUsd(key.usage)}</TableCell>
              <TableCell className="text-zinc-300">{formatUsd(key.usage_daily)}</TableCell>
              <TableCell className="text-zinc-300">{formatUsd(key.usage_weekly)}</TableCell>
              <TableCell className="text-zinc-300">{formatUsd(key.usage_monthly)}</TableCell>
              <TableCell className="text-zinc-300">{formatUsd(key.byok_usage)}</TableCell>
              <TableCell className="text-zinc-400 text-sm">{formatDate(key.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(key)}
                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(key)}
                    className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
