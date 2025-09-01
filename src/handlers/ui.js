// src/handlers/ui.js
import { InlineKeyboard } from "grammy";

export function open_member_menu(ctx) {
  const kb = new InlineKeyboard()
    .text("🛡 Safety", "menu:safety").text("📈 Price & Alpha", "menu:price").row()
    .text("🎭 Memes & Stickers", "menu:memes").text("🎁 Tips & Airdrops", "menu:rewards").row()
    .text("📣 Marketing & Raids", "menu:mktg").text("👤 Account", "menu:account").row()
    .text("💎 Upgrade", "menu:upgrade");

  return ctx.reply("Main menu:", { reply_markup: kb });
}

// Minimal handler so taps don’t error; your feature modules can handle deeper flows.
export async function on_callback(ctx) {
  const data = ctx.callbackQuery?.data || "";
  await ctx.answerCallbackQuery();

  switch (data) {
    case "menu:safety":     return ctx.reply("Safety tools: /scan, /honeypot (stubs)");
    case "menu:price":      return ctx.reply("Market & Alpha: try /price btc, /price eth");
    case "menu:memes":      return ctx.reply("Memes & Stickers: use /meme <prompt>");
    case "menu:rewards":    return ctx.reply("Tips & Airdrops: use /tip, /rain");
    case "menu:mktg":       return ctx.reply("Marketing & Raids: use /raid <message>");
    case "menu:account":    return ctx.reply("Account → /status, /buy");
    case "menu:upgrade":    return ctx.reply("Upgrade → /buy pro USDT");
    default:                return ctx.reply("Menu updated.");
  }
}
