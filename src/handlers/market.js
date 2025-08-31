import { priceUsd } from "../utils/price.js";

export async function price(ctx) {
  const text = ctx.message?.text ?? "";
  const parts = text.trim().split(/\s+/);
  const symbol = parts[1];
  if (!symbol) return ctx.reply("Usage: /price <symbol> (e.g. /price btc)");
  try {
    const usd = await priceUsd(symbol);
    await ctx.reply(`${symbol.toUpperCase()} ≈ $${usd.toLocaleString()}`);
  } catch (e) {
    await ctx.reply(`Price error: ${e?.message || e}`);
  }
}
