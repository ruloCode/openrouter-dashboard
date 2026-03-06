'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ApiKey, updateKey } from '@/lib/openrouter';

interface EditKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  keyData: ApiKey | null;
  onUpdated: () => void;
}

export default function EditKeyDialog({ open, onOpenChange, apiKey, keyData, onUpdated }: EditKeyDialogProps) {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [includeByok, setIncludeByok] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (keyData) {
      setName(keyData.name || '');
      setLimit(keyData.limit != null ? String(keyData.limit) : '');
      setDisabled(keyData.disabled);
      setIncludeByok(keyData.include_byok_in_limit);
    }
  }, [keyData]);

  const handleUpdate = async () => {
    if (!keyData) return;
    setLoading(true);
    setError('');
    try {
      await updateKey(apiKey, keyData.hash, {
        name: name.trim() || undefined,
        disabled,
        limit: limit ? parseFloat(limit) : null,
        includeByokInLimit: includeByok,
      });
      onOpenChange(false);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Edit API Key</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Update the settings for this API key.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-zinc-300">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Credit Limit (USD, empty = unlimited)</Label>
            <Input
              type="number"
              placeholder="unlimited"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-zinc-300">Disabled</Label>
            <Switch checked={disabled} onCheckedChange={setDisabled} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-zinc-300">Include BYOK in Limit</Label>
            <Switch checked={includeByok} onCheckedChange={setIncludeByok} />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={loading} className="bg-violet-600 hover:bg-violet-700">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
