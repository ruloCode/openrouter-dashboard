'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { setStoredApiKey } from '@/lib/storage';
import { KeyRound, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  onAuthenticated: (key: string) => void;
}

export default function LandingPage({ onAuthenticated }: LandingPageProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Please enter your Management API Key');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://openrouter.ai/api/v1/keys?offset=0', {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
      });
      if (!res.ok) throw new Error('Invalid API key or insufficient permissions');
      setStoredApiKey(apiKey.trim());
      onAuthenticated(apiKey.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-4">
            <KeyRound className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">OpenRouter Dashboard</h1>
          <p className="text-zinc-400">Manage your API keys securely</p>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Enter Management API Key</CardTitle>
            <CardDescription className="text-zinc-400">
              Your key is stored locally and never sent to any backend server.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-zinc-300">Management API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-or-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-violet-500"
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
              >
                {loading ? 'Verifying...' : 'Access Dashboard'}
              </Button>
            </form>
            <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-400">
                API calls go directly from your browser to OpenRouter. Your key is stored in localStorage only.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
