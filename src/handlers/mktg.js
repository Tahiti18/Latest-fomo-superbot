export async function raid(ctx) {
  const msg = (ctx.message?.text || "").replace(/^\/raid\s*/i, "").trim();
  if (!msg) return ctx.reply("Usage: /raid <message>");
  await ctx.reply(`🚀 Raid launched (stub): ${msg}`);
}
