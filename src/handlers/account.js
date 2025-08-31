import { getSubscription } from "../db.js";

export async function status(ctx) {
  const id = ctx.from?.id;
  if (!id) return ctx.reply("No user id");
  const sub = await getSubscription(id);
  if (!sub) {
    return ctx.reply("📊 Subscription status\n\n• Tier: _None_\n• Expires: _—_\n\nYou’re not premium yet.", { parse_mode: "Markdown" });
  }
  const exp = sub.expires_at ? new Date(sub.expires_at).toUTCString() : "—";
  return ctx.reply(`📊 Subscription status\n\n• Tier: _${sub.plan}_\n• Expires: _${exp}_`, { parse_mode: "Markdown" });
}
