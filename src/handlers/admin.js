import { setSubscription } from "../db.js";

export async function grant(ctx) {
  const args = (ctx.message?.text || "").split(/\s+/);
  const plan = (args[1] || "pro").toLowerCase();
  if (!["starter","pro","lifetime"].includes(plan)) return ctx.reply("Usage: /grant <starter|pro|lifetime>");
  const id = ctx.from?.id;
  if (!id) return ctx.reply("No user id");
  const expires = plan === "lifetime" ? null : new Date(Date.now() + 30*24*3600*1000).toISOString();
  await setSubscription(id, plan, expires);
  await ctx.reply(`Admin: granted ${plan} ✔️`);
}
