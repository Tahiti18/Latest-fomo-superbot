import { InlineKeyboard } from "grammy";
import { createInvoice } from "../payments/cryptoPay.js";

function priceFor(plan) {
  switch (plan) {
    case "starter":  return { amount: "29",  desc: "FOMO Starter 30d" };
    case "pro":      return { amount: "99",  desc: "FOMO Pro 30d" };
    case "lifetime": return { amount: "499", desc: "FOMO Lifetime" };
    default:         return { amount: "99",  desc: "FOMO Pro 30d" };
  }
}

export async function upgrade(ctx) {
  const raw = (ctx.match || "").trim();
  const [p1, p2] = raw.split(/\s+/).filter(Boolean);
  const plan = ["starter","pro","lifetime"].includes((p1||"").toLowerCase()) ? p1.toLowerCase() : "pro";
  const asset = (p2 || "USDT").toUpperCase();
  const { amount, desc } = priceFor(plan);

  const payload = JSON.stringify({ plan, asset, amount, tg_user: ctx.from?.id, tg_chat: ctx.chat?.id, ts: Date.now() });

  try {
    const inv = await createInvoice({ amount, asset, description: desc, payload, expires_in: 900 });
    const url = (inv.pay_url || inv.invoice_url);
    const kb = new InlineKeyboard().url("🔒 Pay Securely (CryptoBot)", url);
    await ctx.reply(`✅ Invoice created\n\nPlan: *${plan.toUpperCase()}*\nAsset: *${asset}*\nAmount: *${amount}*\n\nClick to pay and unlock Premium.`, { parse_mode: "Markdown", reply_markup: kb });
  } catch (e) {
    await ctx.reply(`❌ Payment error: ${e?.message || e}`);
  }
}
