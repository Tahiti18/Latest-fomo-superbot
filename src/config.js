export const CFG = {
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  BOT_SECRET: process.env.BOT_SECRET || "",
  BOT_PUBLIC_URL: process.env.BOT_PUBLIC_URL || "",
  API_BASE_URL: process.env.API_BASE_URL || "https://api.coingecko.com/api/v3",
  CRYPTO_PAY_API_KEY: process.env.CRYPTO_PAY_API_KEY || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  PORT: Number(process.env.PORT || 8080)
};
