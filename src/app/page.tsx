'use client';

import { useState, useEffect } from 'react';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import { getStoredApiKey } from '@/lib/storage';

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getStoredApiKey();
    if (stored) setApiKey(stored);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!apiKey) {
    return <LandingPage onAuthenticated={setApiKey} />;
  }

  return <Dashboard apiKey={apiKey} onLogout={() => setApiKey(null)} />;
}
