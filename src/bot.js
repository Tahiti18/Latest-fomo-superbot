// src/bot.js
import { Bot, webhookCallback } from "grammy";
import * as ui from "./handlers/ui.js";
import * as account from "./handlers/account.js";
import * as billing from "./handlers/billing.js";
import * as safety from "./handlers/safety.js";
import * as market from "./handlers/market.js";
import * as meme from "./handlers/meme.js";
import * as rewards from "./handlers/rewards.js";
import * as mktg from "./handlers/mktg.js";
import * as admin from "./handlers/admin.js";
import { saveUser } from "./db.js";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is missing — set it in .env");

export const bot = new Bot(token);

// Save user in DB (if DB configured) on any incoming message
bot.on("message", async (ctx, next) => {
  try {
    if (ctx.from) await saveUser(ctx.from);
  } catch (e) {
    console.error("saveUser failed", e);
  }
  return next();
});

// Core commands
bot.command("start", async (ctx) => {
  await ctx.reply(
    "Welcome to FOMO Superbot 🚀\n\n" +
    "• /menu → open menu\n" +
    "• /status → check account\n" +
    "• /price btc → get token price\n" +
    "• /scan <addr> → scan a token\n" +
    "• /buy pro USDT → upgrade\n" +
    "• /meme <prompt> → AI meme\n" +
    "• /tip /rain /raid → community fun"
  );
  return ui.open_member_menu(ctx);
});

bot.command("menu", ui.open_member_menu);
bot.command("help", (ctx) =>
  ctx.reply("Commands: /menu /status /price btc /scan <addr> /buy pro USDT /meme <prompt> /tip /rain /raid <msg>")
);

bot.command("status", account.status);
bot.command("buy", billing.upgrade);

// Safety + market
bot.command("scan", safety.scan);
bot.command("honeypot", safety.honeypot);
bot.command("price", market.price);

// Fun + rewards
bot.command("meme", meme.meme);
bot.command("tip", rewards.tip);
bot.command("rain", rewards.rain);

// Marketing
bot.command("raid", mktg.raid);

// Admin (local quick grant only)
bot.command("grant", admin.grant);

// Callbacks
bot.on("callback_query:data", ui.on_callback);

// Webhook export for server.js
export const webhook = webhookCallback(bot, "express", {
  secretToken: process.env.BOT_SECRET || undefined,
});
