import type { FormaCVConfig, HttpClient } from './types.js';
import { FormaCVError } from './types.js';

const USER_AGENT = '@formacv/mcp/0.1.0';

function normalizeErrorCode(status: number, bodyText: string): string {
  try {
    const parsed = JSON.parse(bodyText) as { error?: { code?: string }; code?: string };
    const code = parsed.error?.code ?? parsed.code;
    if (typeof code === 'string' && code.length > 0) return code;
  } catch {
    // ignore
  }
  return `HTTP_${status}`;
}

export function createHttpClient(config: FormaCVConfig): HttpClient {
  return {
    async call<T>(operation: string, payload: unknown): Promise<T> {
      const base = config.serverUrl.replace(/\/$/, '');
      const url = `${base}/v1/${operation}`;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), config.timeoutMs);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
            'User-Agent': USER_AGENT,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        const text = await response.text().catch(() => '');

        if (!response.ok) {
          const message =
            text.trim().length > 0
              ? `FormaCV API error ${response.status}: ${text}`
              : `FormaCV API error ${response.status}: ${response.statusText}`;
          throw new FormaCVError(message, normalizeErrorCode(response.status, text), response.status);
        }

        if (!text) {
          return undefined as T;
        }

        try {
          return JSON.parse(text) as T;
        } catch {
          throw new FormaCVError('FormaCV API returned non-JSON response', 'INVALID_JSON', response.status);
        }
      } catch (err) {
        if (err instanceof FormaCVError) throw err;
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            throw new FormaCVError(
              `FormaCV request timed out after ${config.timeoutMs}ms`,
              'TIMEOUT',
            );
          }
          throw new FormaCVError(err.message, 'NETWORK_ERROR');
        }
        throw new FormaCVError('Unknown error during FormaCV request', 'UNKNOWN');
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
