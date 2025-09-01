// src/services/providers/honeypot.js
import { fetchJson } from "../../lib/http.js";

/**
 * Best-effort honeypot check.
 * Uses api.honeypot.is public endpoint (no key). If it fails, returns graceful "unknown".
 */
export async function checkHoneypot(address) {
  if (!address) throw new Error("Missing token address");
  const url = `https://api.honeypot.is/v2/IsHoneypot?address=${encodeURIComponent(address)}`;
  try {
    const json = await fetchJson(url, { timeout: 15000 });
    const sim = json?.simulation || {};
    const is = Boolean(json?.IsHoneypot || json?.isHoneypot || sim?.isHoneypot);
    const buyTax = Number(sim?.buyTax || json?.buyTax || 0);
    const sellTax = Number(sim?.sellTax || json?.sellTax || 0);
    return {
      supported: true,
      ok: true,
      isHoneypot: is,
      buyTax,
      sellTax,
      reason: json?.reason || json?.message || null
    };
  } catch (e) {
    return { supported: false, ok: false, isHoneypot: null, buyTax: null, sellTax: null, reason: "honeypot API unreachable" };
  }
}
