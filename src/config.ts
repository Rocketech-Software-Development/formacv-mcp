import { DEMO_SERVER_URL } from './demo.js';
import type { FormaCVConfig } from './types.js';

export function loadConfig(): FormaCVConfig {
  return {
    apiKey: process.env.FORMACV_API_KEY ?? '',
    serverUrl: process.env.FORMACV_SERVER_URL?.trim() || DEMO_SERVER_URL,
    timeoutMs: Number(process.env.FORMACV_TIMEOUT_MS) || 30000,
  };
}
