const STORAGE_KEY = 'openrouter_mgmt_key';

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY) || process.env.NEXT_PUBLIC_OPENROUTER_MGMT_KEY || '';
}

export function setStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, key);
}

export function clearStoredApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
