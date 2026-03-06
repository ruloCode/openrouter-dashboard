'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ApiKey, deleteKey } from '@/lib/openrouter';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  keyData: ApiKey | null;
  onDeleted: () => void;
}

export default function DeleteConfirmDialog({ open, onOpenChange, apiKey, keyData, onDeleted }: DeleteConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!keyData) return;
    setLoading(true);
    setError('');
    try {
      await deleteKey(apiKey, keyData.hash);
      onOpenChange(false);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Delete API Key
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Are you sure you want to delete <span className="text-white font-medium">&quot;{keyData?.name}&quot;</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            Cancel
          </Button>
          <Button onClick={handleDelete} disabled={loading} variant="destructive">
            {loading ? 'Deleting...' : 'Delete Key'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
