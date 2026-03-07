'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getStoredApiKey } from '@/lib/storage';
import { listKeys, getActivity, ApiKey, ActivityItem } from '@/lib/openrouter';
import { slugify } from '@/lib/utils';
import KeyDetailPage from '@/components/KeyDetailPage';
import { Suspense } from 'react';

function KeyPageContent() {
  const searchParams = useSearchParams();
  const keyName = searchParams.get('name') || '';
  const router = useRouter();
  const [keyData, setKeyData] = useState<ApiKey | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const initialLoadDone = useRef(false);

  const fetchData = useCallback(async () => {
    const token = getStoredApiKey();
    if (!token) {
      router.replace('/');
      return;
    }

    if (initialLoadDone.current) {
      setSyncing(true);
    } else {
      setLoading(true);
    }

    try {
      const [keysResult, activityResult] = await Promise.allSettled([
        listKeys(token),
        getActivity(token),
      ]);

      if (keysResult.status === 'rejected') {
        setError('Failed to fetch keys');
        return;
      }

      const keys = keysResult.value.data || [];
      const matched = keys.find(
        (k) => slugify(k.name || '') === decodeURIComponent(keyName)
      );

      if (!matched) {
        setError(`Key "${decodeURIComponent(keyName)}" not found`);
        return;
      }

      setKeyData(matched);

      if (activityResult.status === 'fulfilled') {
        setActivity(activityResult.value.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setSyncing(false);
      initialLoadDone.current = true;
    }
  }, [keyName, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400">Loading key details...</span>
        </div>
      </div>
    );
  }

  if (error || !keyData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error || 'Key not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-violet-400 hover:text-violet-300 underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <KeyDetailPage keyData={keyData} activity={activity} onSync={fetchData} syncing={syncing} />;
}

export default function KeyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400">Loading...</span>
        </div>
      </div>
    }>
      <KeyPageContent />
    </Suspense>
  );
}
