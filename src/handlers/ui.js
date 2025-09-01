// src/handlers/ui.js
import { InlineKeyboard } from "grammy";

/**
 * Two-column main menu. Written defensively to avoid runtime crashes.
 */
export async function open_member_menu(ctx) {
  try {
    const kb = new InlineKeyboard()
      .add(
        { text: "🛡 Safety",            callback_data: "menu:safety" },
        { text: "📈 Price & Alpha",     callback_data: "menu:price"  },
      ).row()
      .add(
        { text: "🎭 Memes & Stickers",  callback_data: "menu:memes"  },
        { text: "🎁 Tips & Airdrops",   callback_data: "menu:rewards"},
      ).row()
      .add(
        { text: "📣 Marketing & Raids", callback_data: "menu:mktg"   },
        { text: "👤 Account",           callback_data: "menu:account"},
      ).row()
      .add(
        { text: "💎 Upgrade",           callback_data: "menu:upgrade"},
      );

    await ctx.reply("Main menu:", { reply_markup: kb });
  } catch (err) {
    console.error("open_member_menu error:", err);
    await ctx.reply("Menu error. Try /menu again.");
  }
}

/**
 * Handles taps on the menu buttons so nothing throws.
 */
export async function on_callback(ctx) {
  try {
    const data = ctx.callbackQuery?.data || "";
    await ctx.answerCallbackQuery();

    switch (data) {
      case "menu:safety":
        return ctx.reply("Safety tools: /scan, /honeypot");
      case "menu:price":
        return ctx.reply("Market & Alpha: try /price btc | /price eth | /price ton");
      case "menu:memes":
        return ctx.reply("Memes & Stickers: use /meme <prompt>");
      case "menu:rewards":
        return ctx.reply("Tips & Airdrops: use /tip, /rain");
      case "menu:mktg":
        return ctx.reply("Marketing & Raids: use /raid <message>");
      case "menu:account":
        return ctx.reply("Account: /status, /buy");
      case "menu:upgrade":
        return ctx.reply("Upgrade: /buy pro USDT");
      default:
        return ctx.reply("Menu updated.");
    }
  } catch (err) {
    console.error("on_callback error:", err);
    return ctx.reply("Menu action error.");
  }
}
