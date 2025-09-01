// src/handlers/safety.js
import { InlineKeyboard } from "grammy";
import { scanToken } from "../services/scan.js";
import { formatScan } from "../services/scanFormatter.js";

const ADDR_RE = /^(0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,}|EQ[a-zA-Z0-9_-]{44,})$/; // EVM / SOL-ish / TON-ish

export async function scan(ctx) {
  try {
    const text = ctx.message?.text?.trim() || "";
    const parts = text.split(/\s+/);
    const addr = parts[1];

    if (!addr || !ADDR_RE.test(addr)) {
      return ctx.reply(
        "Send like:\n`/scan 0x...` (EVM)\n`/scan <TON or SOL address>`",
        { parse_mode: "Markdown" }
      );
    }

    const result = await scanToken(addr);
    const { lines, links } = formatScan(result);

    const kb = new InlineKeyboard();
    if (links.chart) kb.url("📊 Chart", links.chart);
    if (links.dexscreener) kb.url("DexScreener", links.dexscreener);
    if (links.geckoterminal) kb.url("GeckoTerminal", links.geckoterminal);
    if (kb.inline_keyboard.length === 0) kb.text("ℹ️ No links available", "noop");

    await ctx.reply(lines.join("\n"), { parse_mode: "Markdown", reply_markup: kb });
  } catch (e) {
    console.error("scan error", e);
    await ctx.reply("Scan failed. Try again in a moment.");
  }
}

export async function honeypot(ctx) {
  try {
    return ctx.reply("Basic honeypot checks now run inside /scan. Use `/scan 0x...`", {
      parse_mode: "Markdown",
    });
  } catch (e) {
    console.error("honeypot error", e);
  }
}
