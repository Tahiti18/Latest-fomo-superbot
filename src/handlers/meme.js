export async function meme(ctx) {
  const text = ctx.message?.text ?? "";
  const prompt = text.replace(/^\/meme\s*/i, "");
  if (!prompt) return ctx.reply("Usage: /meme <prompt>");
  await ctx.reply(`🎭 Meme generator (stub): “${prompt}”`);
}
