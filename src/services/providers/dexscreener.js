// src/services/providers/dexscreener.js
import { fetchJson } from "../../lib/http.js";

export async function fetchDexscreener(address) {
  if (!address) throw new Error("Missing token address");
  const url = `https://api.dexscreener.com/latest/dex/tokens/${address}`;
  const json = await fetchJson(url);

  const pairs = Array.isArray(json.pairs) ? json.pairs : [];
  if (!pairs.length) return { ok: false, reason: "No pairs on Dexscreener yet." };

  // Choose the most liquid pair
  const best = pairs.slice().sort((a,b) => (Number(b.liquidity?.usd||0) - Number(a.liquidity?.usd||0)))[0];

  return {
    ok: true,
    name: best.baseToken?.name || "",
    symbol: best.baseToken?.symbol || "",
    chain: best.chainId || best.chain || "",
    pair: best.pairAddress || "",
    dex: best.dexId || "",
    priceUsd: Number(best.priceUsd || best.price || 0),
    fdv: Number(best.fdv || 0),
    liquidityUsd: Number(best.liquidity?.usd || 0),
    volume24h: Number(best.volume?.h24 || 0),
    priceChange: {
      h1: Number(best.priceChange?.h1 || 0),
      h6: Number(best.priceChange?.h6 || 0),
      h24: Number(best.priceChange?.h24 || 0),
    },
    info: {
      website: best.info?.website || "",
      twitter: best.info?.twitter || "",
      telegram: best.info?.telegram || "",
    },
    raw: best,
  };
}
