// src/lib/http.js
const DEFAULT_TIMEOUT_MS = 12_000;

/**
 * Simple JSON fetch with timeout and defensive errors.
 */
export async function fetchJson(url, opts = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(new Error("Timeout")), opts.timeout ?? DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: opts.method || "GET",
      headers: { "accept": "application/json", ...(opts.headers || {}) },
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText} — ${text.slice(0,180)}`);
    }
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}
