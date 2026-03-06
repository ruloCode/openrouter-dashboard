'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createKey } from '@/lib/openrouter';

interface CreateKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  onCreated: () => void;
}

export default function CreateKeyDialog({ open, onOpenChange, apiKey, onCreated }: CreateKeyDialogProps) {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const limitNum = limit ? parseFloat(limit) : undefined;
      await createKey(apiKey, name.trim(), limitNum);
      setName('');
      setLimit('');
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Create New API Key</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Create a new API key for your OpenRouter account.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-zinc-300">Name *</Label>
            <Input
              placeholder="My API Key"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Credit Limit (optional, in USD)</Label>
            <Input
              type="number"
              placeholder="e.g. 10.00"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading} className="bg-violet-600 hover:bg-violet-700">
            {loading ? 'Creating...' : 'Create Key'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
