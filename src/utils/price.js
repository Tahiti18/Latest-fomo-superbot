import fetch from "node-fetch";
const MAP = {
  btc: "bitcoin",
  eth: "ethereum",
  ton: "the-open-network",
  bnb: "binancecoin",
  sol: "solana",
  doge: "dogecoin",
  pepe: "pepe",
  shib: "shiba-inu"
};
export async function priceUsd(symbolLike, apiBase = process.env.API_BASE_URL || "https://api.coingecko.com/api/v3") {
  const key = (symbolLike||"").toLowerCase();
  const id = MAP[key] || key;
  const url = `${apiBase}/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Price fetch failed: ${r.status}`);
  const j = await r.json();
  const v = j?.[id]?.usd;
  if (typeof v !== "number") throw new Error("Price not found");
  return v;
}
