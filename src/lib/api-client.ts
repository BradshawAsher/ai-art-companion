import { pushDebugEntry } from "@/lib/debug-log";

const ANALYZE_ENDPOINT = "/api/analyze-artwork";


export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface PostOptions {
  retries?: number;
  timeoutMs?: number;
}

/**
 * POST to the analysis endpoint with automatic retries.
 * Retries transient failures: network errors ("Failed to fetch"), timeouts,
 * 429 rate limits and 5xx/502 gateway blips. Terminal 4xx errors are thrown immediately.
 */
export async function postAnalyze<T = any>(body: unknown, opts: PostOptions = {}): Promise<T> {
  const retries = opts.retries ?? 3;
  const timeoutMs = opts.timeoutMs ?? 120000;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(ANALYZE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      const data = await response.json().catch(() => null);

      if (response.ok) {
        if (!data) throw new ApiError("No response received from the AI", 502);
        return data as T;
      }

      const message = data?.error || `The analysis service returned an error (${response.status})`;
      // Retry only transient statuses
      if ((response.status === 429 || response.status >= 500) && attempt < retries) {
        lastError = new ApiError(message, response.status);
        await sleep(800 * Math.pow(2, attempt));
        continue;
      }
      throw new ApiError(message, response.status);
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof ApiError) {
        if ((err.status === 429 || err.status >= 500) && attempt < retries) {
          lastError = err;
          await sleep(800 * Math.pow(2, attempt));
          continue;
        }
        throw err;
      }
      // Network failure ("Failed to fetch") or abort — retry with backoff
      lastError = err;
      const aborted = err instanceof DOMException && err.name === "AbortError";
      if (attempt < retries) {
        await sleep(800 * Math.pow(2, attempt));
        continue;
      }
      throw new ApiError(
        aborted
          ? "The request timed out. Please try again."
          : "Couldn't reach the analysis service. Check your connection and try again.",
        0,
      );
    }
  }

  throw lastError instanceof Error ? lastError : new ApiError("Request failed", 0);
}
