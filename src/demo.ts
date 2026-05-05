export const DEMO_SERVER_URL = 'https://demo.formacv.ai';

const SENTINEL_HOSTS = new Set(['demo.formacv.ai', '']);

export function isDemoMode(serverUrl: string): boolean {
  if (!serverUrl) return true;
  try {
    const url = new URL(serverUrl);
    if (SENTINEL_HOSTS.has(url.hostname)) return true;
    if (url.hostname.endsWith('.demo.formacv.ai')) return true;
    return false;
  } catch {
    return true;
  }
}
