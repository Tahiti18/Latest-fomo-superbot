import { InlineKeyboard } from "grammy";

export async function open_member_menu(ctx) {
  const kb = new InlineKeyboard()
    .text("🛡️ Safety", "ui:safety").row()
    .text("💹 Price & Alpha", "ui:market").row()
    .text("🎭 Memes & Stickers", "ui:meme").row()
    .text("🎁 Tips & Airdrops", "ui:rewards").row()
    .text("🚀 Marketing & Raids", "ui:mktg").row()
    .text("👤 Account", "ui:account").row()
    .text("💳 Upgrade", "ui:upgrade");
  await ctx.reply("Main menu:", { reply_markup: kb });
}

export async function on_callback(ctx) {
  const data = ctx.callbackQuery?.data || "";
  await ctx.answerCallbackQuery().catch(() => {});
  switch (data) {
    case "ui:safety":   return ctx.api.sendMessage(ctx.chat.id, "Safety tools: /scan, /honeypot (stubs)");

    case "ui:market": {
      const kb = new InlineKeyboard()
        .text("BTC", "mkt:btc").text("ETH", "mkt:eth").text("TON", "mkt:ton").row()
        .text("Price by symbol", "mkt:ask");
      return ctx.api.sendMessage(ctx.chat.id, "Market & Alpha:", { reply_markup: kb });
    }

    case "ui:meme":     return ctx.api.sendMessage(ctx.chat.id, "Memes & Stickers (stubs). Use /meme <prompt>.");
    case "ui:rewards":  return ctx.api.sendMessage(ctx.chat.id, "Tips & Airdrops (stubs). Use /tip, /rain.");
    case "ui:mktg":     return ctx.api.sendMessage(ctx.chat.id, "Marketing & Raids (stubs). Use /raid <message>.");
    case "ui:account":  return ctx.api.sendMessage(ctx.chat.id, "Account → /status, /buy");
    case "ui:upgrade":  return ctx.api.sendMessage(ctx.chat.id, "Upgrade → /buy pro USDT");

    default:            return ctx.api.sendMessage(ctx.chat.id, "Unknown action");
  }
}
