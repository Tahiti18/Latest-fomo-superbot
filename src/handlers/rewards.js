export async function tip(ctx) {
  const t = ctx.message?.text ?? "";
  const parts = t.trim().split(/\s+/);
  const amount = parts[1];
  const asset = (parts[2] || "USDT").toUpperCase();
  if (!amount) return ctx.reply("Usage: /tip <amount> [asset]");
  await ctx.reply(`💸 Tip (stub): ${amount} ${asset}`);
}
export async function rain(ctx) {
  const t = ctx.message?.text ?? "";
  const parts = t.trim().split(/\s+/);
  const amount = parts[1];
  const asset = (parts[2] || "USDT").toUpperCase();
  if (!amount) return ctx.reply("Usage: /rain <amount> [asset]");
  await ctx.reply(`🌧️ Rain (stub): ${amount} ${asset}`);
}
