export const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1/keys';

export interface ApiKey {
  created_at: string;
  updated_at: string;
  hash: string;
  label: string;
  name: string;
  disabled: boolean;
  limit: number | null;
  limit_remaining: number | null;
  limit_reset: string | null;
  include_byok_in_limit: boolean;
  usage: number;
  usage_daily: number;
  usage_weekly: number;
  usage_monthly: number;
  byok_usage: number;
  byok_usage_daily: number;
  byok_usage_weekly: number;
  byok_usage_monthly: number;
}

export interface ApiKeysResponse {
  data: ApiKey[];
}

export async function listKeys(token: string, offset = 0): Promise<ApiKeysResponse> {
  const res = await fetch(`${OPENROUTER_API_BASE}?offset=${offset}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch keys: ${res.statusText}`);
  return res.json();
}

export async function createKey(token: string, name: string, limit?: number): Promise<{ key: ApiKey }> {
  const body: Record<string, unknown> = { name };
  if (limit !== undefined && limit > 0) body.limit = limit;
  const res = await fetch(OPENROUTER_API_BASE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to create key: ${res.statusText}`);
  return res.json();
}

export async function updateKey(
  token: string,
  hash: string,
  updates: { name?: string; disabled?: boolean; limit?: number | null; limitReset?: string; includeByokInLimit?: boolean }
): Promise<{ key: ApiKey }> {
  const res = await fetch(`${OPENROUTER_API_BASE}/${hash}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Failed to update key: ${res.statusText}`);
  return res.json();
}

export async function deleteKey(token: string, hash: string): Promise<void> {
  const res = await fetch(`${OPENROUTER_API_BASE}/${hash}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to delete key: ${res.statusText}`);
}

// Credits API
export const OPENROUTER_CREDITS_URL = 'https://openrouter.ai/api/v1/credits';

export interface CreditsData {
  total_credits: number;
  total_usage: number;
}

export async function getCredits(token: string): Promise<{ data: CreditsData }> {
  const res = await fetch(OPENROUTER_CREDITS_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch credits: ${res.statusText}`);
  return res.json();
}
