export async function scan(ctx) {
  const text = ctx.message?.text ?? "";
  const parts = text.trim().split(/\s+/);
  const address = parts[1];
  if (!address) return ctx.reply("Usage: /scan <token_address>");
  if (!/^0x[a-fA-F0-9]{6,}$/.test(address)) return ctx.reply("That doesn’t look like an EVM address.");
  await ctx.reply(`🔎 Scan (stub): ${address}`);
}
export async function honeypot(ctx) {
  const text = ctx.message?.text ?? "";
  const parts = text.trim().split(/\s+/);
  const address = parts[1];
  if (!address) return ctx.reply("Usage: /honeypot <token_address>");
  await ctx.reply(`🍯 Honeypot test (stub): ${address}`);
}
