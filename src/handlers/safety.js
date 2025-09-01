// src/handlers/safety.js
import { InlineKeyboard } from "grammy";
import { fetchDexscreener } from "../services/providers/dexscreener.js";
import { checkHoneypot } from "../services/providers/honeypot.js";
import { fmtNum, fmtPct, ago } from "../lib/format.js";

function isAddressLike(s) {
  return typeof s === "string" && /^0x[a-fA-F0-9]{38,64}$/.test(s.trim());
}

export async function scan(ctx) {
  const arg = (ctx.match || "").toString().trim();
  if (!isAddressLike(arg)) {
    return ctx.reply("Usage: /scan <token_contract_address>");
  }

  await ctx.reply("⏳ Scanning token…");

  // Fetch in parallel
  let ds, hp;
  try {
    [ds, hp] = await Promise.all([
      fetchDexscreener(arg).catch(e => ({ ok:false, reason: String(e?.message||e) })),
      checkHoneypot(arg).catch(_ => ({ supported:false, ok:false })),
    ]);
  } catch (_) {
    ds = { ok:false, reason:"scan failed" };
    hp = { supported:false };
  }

  // Build response
  const lines = [];
  if (ds?.ok) {
    lines.push(
      `🧾 *${ds.symbol || "Token"}* (${ds.chain})`,
      `Price: *$${fmtNum(ds.priceUsd, 6)}*  |  24h: *${fmtPct(ds.priceChange.h24)}*`,
      `Liquidity: *$${fmtNum(ds.liquidityUsd)}*  |  FDV: *$${fmtNum(ds.fdv)}*`,
      `Volume(24h): *$${fmtNum(ds.volume24h)}*`,
      ds.info?.website ? `Website: ${ds.info.website}` : "",
      ds.info?.twitter ? `X/Twitter: ${ds.info.twitter}` : "",
      ds.info?.telegram ? `TG: ${ds.info.telegram}` : ""
    );
  } else {
    lines.push(`⚠️ Dexscreener: ${ds?.reason || "no data"}`);
  }

  if (hp?.supported) {
    const tag = hp.isHoneypot === true ? "🚫 *Honeypot detected*" :
                hp.isHoneypot === false ? "✅ Not a honeypot (simulation)" :
                "❔ Honeypot unknown";
    lines.push(tag);
    if (hp.buyTax != null || hp.sellTax != null) {
      lines.push(`Taxes: Buy *${fmtNum(hp.buyTax,2)}%*, Sell *${fmtNum(hp.sellTax,2)}%*`);
    }
  } else {
    lines.push("🟨 Honeypot check unavailable right now.");
  }

  const text = lines.filter(Boolean).join("\n");

  const kb = new InlineKeyboard();
  if (ds?.ok && ds.raw?.url) {
    kb.url("Dexscreener", ds.raw.url);
  } else if (ds?.ok && ds.pair && ds.chain && ds.dex) {
    kb.url("Dexscreener", `https://dexscreener.com/${ds.chain}/${ds.pair}`);
  }

  return ctx.reply(text, { parse_mode: "Markdown", reply_markup: kb });
}

export async function honeypot(ctx) {
  const arg = (ctx.match || "").toString().trim();
  if (!isAddressLike(arg)) {
    return ctx.reply("Usage: /honeypot <token_contract_address>");
  }
  const res = await checkHoneypot(arg).catch(_ => null);
  if (!res) return ctx.reply("Honeypot check failed.");
  const tag = res.isHoneypot === true ? "🚫 *Honeypot detected*" :
              res.isHoneypot === false ? "✅ Not a honeypot (simulation)" :
              "❔ Honeypot unknown";
  const txt = [
    tag,
    (res.buyTax!=null || res.sellTax!=null) ? `Taxes: Buy *${fmtNum(res.buyTax,2)}%*, Sell *${fmtNum(res.sellTax,2)}%*` : ""
  ].filter(Boolean).join("\n");
  return ctx.reply(txt, { parse_mode: "Markdown" });
}
