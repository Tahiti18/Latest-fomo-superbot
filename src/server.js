// src/server.js
import "dotenv/config";
import express from "express";
import pino from "pino";
import crypto from "node:crypto";
import { bot, webhook } from "./bot.js";
import { initDb, migrate, setSubscription } from "./db.js";
console.log("DB_ENV_PRESENT:", !!process.env.DATABASE_URL, (process.env.DATABASE_URL||"").replace(/:\/\/.*@/,"://****@"));
const log = pino({ level: process.env.LOG_LEVEL || "info" });
const app = express();

// Capture raw body (needed to verify CryptoPay HMAC). Parse JSON manually.
app.use((req, res, next) => {
  let data = "";
  req.setEncoding("utf8");
  req.on("data", (chunk) => (data += chunk));
  req.on("end", () => {
    // @ts-ignore
    req.rawBody = data;
    try {
      if (req.is && req.is("application/json") && data) {
        req.body = JSON.parse(data);
      }
    } catch {
      /* ignore parse */
    }
    next();
  });
});

// Health
app.get("/health", (_req, res) => res.type("text/plain").send("OK"));

// Telegram webhook
const secret = process.env.BOT_SECRET || "";
const tgPath = secret ? `/tg/webhook/${secret}` : "/tg/webhook";
log.info({ tgPath }, "Telegram webhook mounted");
app.post(tgPath, (req, res, next) => webhook(req, res, next));
// Optional GET to quickly confirm the route is live
app.get(tgPath, (_req, res) => res.status(200).send("Telegram webhook OK"));

// CryptoBot webhook (optional)
app.post("/crypto/webhook", async (req, res) => {
  try {
    const token = process.env.CRYPTO_PAY_API_KEY || "";
    if (!token) return res.status(200).end(); // ignore if not configured

    // @ts-ignore
    const raw = req.rawBody || "";
    const got = String(req.header("Crypto-Pay-Api-Signature") || "").toLowerCase();
    const expected = crypto.createHmac("sha256", token).update(raw).digest("hex");
    if (!got || got !== expected) {
      log.warn("CryptoPay signature mismatch");
      return res.status(403).end();
    }

    const inv = req.body?.invoice || req.body?.result || req.body;
    log.info({ status: inv?.status, id: inv?.invoice_id || inv?.id }, "CryptoPay webhook");

    if (inv?.status === "paid") {
      try {
        const p = JSON.parse(inv.payload || "{}");
        const plan = String(p.plan || "pro").toLowerCase();
        const userId = Number(p.tg_user);
        const expires =
          plan === "lifetime" ? null : new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
        if (userId) await setSubscription(userId, plan, expires);
        log.info({ userId, plan }, "Premium granted");
      } catch (e) {
        log.error({ e }, "Payload parse error");
      }
    }

    return res.status(200).end();
  } catch (e) {
    log.error({ e }, "CryptoPay webhook error");
    return res.status(500).end();
  }
});

// Root
app.get("/", (_req, res) => res.send("FOMO Superbot API (max pack JS)"));

// Startup
async function main() {
  try {
    const pool = initDb();
    if (pool) await migrate();
    log.info("DB ready");
  } catch (e) {
    log.warn({ e }, "DB init skipped");
  }
  const port = Number(process.env.PORT || 8080);
  app.listen(port, () => log.info(`Listening on ${port}`));
}
main().catch((e) => {
  log.error(e);
  process.exit(1);
});
