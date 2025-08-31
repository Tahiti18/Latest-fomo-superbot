import fetch from "node-fetch";
import pino from "pino";

const log = pino({ level: process.env.LOG_LEVEL || "info" });

function fmtUSD(n) {
  if (n == null || isNaN(n)) return "—";
  const v = Number(n);
  if (v >= 1_000_000) return `$${(v/1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v/1_000).toFixed(2)}k`;
  return `$${v.toFixed(2)}`;
}

export async function scanAddress(tokenAddress) {
  const addr = String(tokenAddress || "").trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) {
    return { ok: false, text: "Send a valid ERC-20 address, e.g. /scan 0xABC..." };
  }

  try {
    // 1) DexScreener (pairs, price, liquidity, volume)
    const dsUrl = `https://api.dexscreener.com/latest/dex/tokens/${addr}`;
    const dsRes = await fetch(dsUrl, { timeout: 10_000 });
    const dsJson = await dsRes.json();

    const pair = dsJson?.pairs?.[0];
    if (!pair) {
      return { ok: true, text: `No pairs found on DexScreener for ${addr}` };
    }

    const priceUsd = pair.priceUsd ? Number(pair.priceUsd) : null;
    const fdv = pair.fdv ? Number(pair.fdv) : null;
    const liqUsd = pair.liquidity?.usd ? Number(pair.liquidity.usd) : null;
    const v24 = pair.volume?.h24 ? Number(pair.volume.h24) : null;
    const baseSymbol = pair.baseToken?.symbol || "UNKNOWN";
    const chain = pair.chainId || pair.chain || "eth";
    const dex = pair.dexId || pair.dex || "dex";

    // 2) Honeypot.is basic check
    // Works for major chains (eth/bsc/etc). If chain mismatch, it may return unknown.
    let hpVerdict = "unknown";
    try {
      const hpUrl = `https://api.honeypot.is/v2/IsHoneypot?address=${addr}`;
      const hpRes = await fetch(hpUrl, { timeout: 10_000 });
      if (hpRes.ok) {
        const hp = await hpRes.json();
        // Different chains return slightly different shapes; normalize:
        const result = hp?.result || hp;
        if (result?.isHoneypot === false) hpVerdict = "not a honeypot";
        else if (result?.isHoneypot === true) hpVerdict = "HONEYPOT 🚫";
        else hpVerdict = "inconclusive";
      }
    } catch (e) {
      log.warn({ e }, "honeypot check failed");
    }

    // Compose a compact report (TTF-like, but ours)
    const lines = [
      `🔎 *Scan* ${addr}`,
      `• Token: *${baseSymbol}*`,
      `• Chain/Dex: *${chain}* / *${dex}*`,
      `• Price: *${priceUsd ? `$${priceUsd}` : "—"}*`,
      `• Liquidity: *${fmtUSD(liqUsd)}*`,
      `• 24h Vol: *${fmtUSD(v24)}*`,
      `• FDV: *${fmtUSD(fdv)}*`,
      `• Honeypot: *${hpVerdict}*`,
      pair.url ? `• Chart: ${pair.url}` : null
    ].filter(Boolean);

    return { ok: true, text: lines.join("\n"), parse_mode: "Markdown" };

  } catch (e) {
    log.error({ e }, "scanAddress error");
    return { ok: false, text: "Scan failed (network/API). Try again shortly." };
  }
}
