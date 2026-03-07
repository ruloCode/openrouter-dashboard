'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredApiKey } from '@/lib/storage';
import { listKeys, getActivity, ApiKey, ActivityItem } from '@/lib/openrouter';
import { slugify } from '@/lib/utils';
import KeyDetailPage from '@/components/KeyDetailPage';

export default function KeyDetailRoute({ params }: { params: Promise<{ keyName: string }> }) {
  const { keyName } = use(params);
  const router = useRouter();
  const [keyData, setKeyData] = useState<ApiKey | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getStoredApiKey();
    if (!token) {
      router.replace('/');
      return;
    }

    async function fetchData() {
      setLoading(true);
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
      }
    }

    fetchData();
  }, [keyName, router]);

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

  return <KeyDetailPage keyData={keyData} activity={activity} />;
}
