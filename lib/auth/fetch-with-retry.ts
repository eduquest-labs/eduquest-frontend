interface FetchWithRetryOptions {
  retries?: number;
  timeoutMs?: number;
}

function backoffDelay(attempt: number): number {
  const base = 300 * 2 ** attempt;
  const jitter = Math.random() * 150;
  return base + jitter;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch wrapper for server-side Auth.js callbacks (authorize/refresh) talking
 * to the Laravel backend. Retries only transient network/timeout failures —
 * 4xx/5xx responses are returned as-is so callers can branch on status
 * (422 invalid credentials, 429 rate limit) without retry masking them.
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  { retries = 2, timeoutMs = 12000 }: FetchWithRetryOptions = {}
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timeout);
      return response;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      // fetch only throws for network failures or the abort signal above —
      // both are transient, so every attempt but the last one retries.
      if (attempt === retries) {
        throw error;
      }
      await sleep(backoffDelay(attempt));
    }
  }

  throw lastError;
}
