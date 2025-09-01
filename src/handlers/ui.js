// src/handlers/ui.js
import { InlineKeyboard } from "grammy";

/**
 * Two-column main menu with clear categories.
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
        { text: "ℹ️ Help",              callback_data: "menu:help"   },
      );

    await ctx.reply("Choose an option:", { reply_markup: kb });
  } catch (err) {
    console.error("open_member_menu error:", err);
    await ctx.reply("Menu error. Try /menu again.");
  }
}

/**
 * Handles taps on the menu buttons.
 */
export async function on_callback(ctx) {
  try {
    const data = ctx.callbackQuery?.data || "";
    await ctx.answerCallbackQuery();

    switch (data) {
      case "menu:safety":
        return ctx.reply("Safety tools: /scan, /honeypot");
      case "menu:price":
        return ctx.reply("Market & Alpha: /price btc | /price eth | /price ton");
      case "menu:memes":
        return ctx.reply("Memes & Stickers: /meme <prompt>");
      case "menu:rewards":
        return ctx.reply("Tips & Airdrops: /tip, /rain");
      case "menu:mktg":
        return ctx.reply("Marketing & Raids: /raid <message>");
      case "menu:account":
        return ctx.reply("Account: /status, /buy");
      case "menu:upgrade":
        return ctx.reply("Upgrade: /buy pro USDT");
      case "menu:help":
        return ctx.reply("Help:\n\n/menu → main menu\n/status → account info\n/price btc → check price\n/meme <prompt> → make a meme\n/buy pro USDT → upgrade");
      default:
        return ctx.reply("Menu updated.");
    }
  } catch (err) {
    console.error("on_callback error:", err);
    return ctx.reply("Menu action error.");
  }
}
