'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiKey, listKeys } from '@/lib/openrouter';
import { clearStoredApiKey } from '@/lib/storage';
import SummaryCards from './SummaryCards';
import CreditsBars from './CreditsBars';
import KeysTable from './KeysTable';
import CreateKeyDialog from './CreateKeyDialog';
import EditKeyDialog from './EditKeyDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { Plus, RefreshCw, Search, LogOut, KeyRound, ChevronLeft, ChevronRight } from 'lucide-react';

interface DashboardProps {
  apiKey: string;
  onLogout: () => void;
}

const PAGE_SIZE = 100;
const REFRESH_INTERVAL = 30000;

export default function Dashboard({ apiKey, onLogout }: DashboardProps) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editKey, setEditKey] = useState<ApiKey | null>(null);
  const [deleteKey, setDeleteKey] = useState<ApiKey | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchKeys = useCallback(async (currentOffset = offset) => {
    setLoading(true);
    setError('');
    try {
      const res = await listKeys(apiKey, currentOffset);
      setKeys(res.data || []);
      setHasMore((res.data || []).length === PAGE_SIZE);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch keys');
    } finally {
      setLoading(false);
    }
  }, [apiKey, offset]);

  useEffect(() => {
    fetchKeys(offset);
  }, [offset]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    intervalRef.current = setInterval(() => fetchKeys(offset), REFRESH_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchKeys, offset]);

  const filteredKeys = keys.filter((k) =>
    !search || k.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    clearStoredApiKey();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">OpenRouter Dashboard</h1>
              <p className="text-xs text-zinc-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchKeys(offset)}
              disabled={loading}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Summary Cards */}
        <SummaryCards keys={keys} />

        {/* Credits Bars */}
        <CreditsBars keys={keys} />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-violet-500"
            />
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create New Key
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        {/* Table */}
        <KeysTable
          keys={filteredKeys}
          onEdit={setEditKey}
          onDelete={setDeleteKey}
        />

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Showing {filteredKeys.length} of {keys.length} keys
            {search && ` (filtered from ${keys.length})`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0 || loading}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm text-zinc-500">Page {Math.floor(offset / PAGE_SIZE) + 1}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasMore || loading}
              onClick={() => setOffset(offset + PAGE_SIZE)}
              className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 disabled:opacity-40"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <CreateKeyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        apiKey={apiKey}
        onCreated={() => fetchKeys(offset)}
      />
      <EditKeyDialog
        open={!!editKey}
        onOpenChange={(open) => { if (!open) setEditKey(null); }}
        apiKey={apiKey}
        keyData={editKey}
        onUpdated={() => fetchKeys(offset)}
      />
      <DeleteConfirmDialog
        open={!!deleteKey}
        onOpenChange={(open) => { if (!open) setDeleteKey(null); }}
        apiKey={apiKey}
        keyData={deleteKey}
        onDeleted={() => fetchKeys(offset)}
      />
    </div>
  );
}
