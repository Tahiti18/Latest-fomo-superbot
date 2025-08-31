import "dotenv/config";
import express from "express";
import pino from "pino";
import crypto from "node:crypto";
import { bot, webhook } from "./bot.js";
import { initDb, migrate, setSubscription } from "./db.js";

const log = pino({ level: process.env.LOG_LEVEL || "info" });
const app = express();

// Note: we need raw body for CryptoPay signature check; for telegram JSON we can use json().
app.use((req, res, next) => {
  // capture raw body as string
  let data = "";
  req.setEncoding("utf8");
  req.on("data", chunk => data += chunk);
  req.on("end", () => {
    req.rawBody = data;
    try {
      if (req.is("application/json") && data) req.body = JSON.parse(data);
    } catch { /* ignore parse */ }
    next();
  });
});

// Health
app.get("/health", (_req, res) => res.type("text/plain").send("OK"));

// Telegram webhook
const secret = process.env.BOT_SECRET || "";
const tgPath = secret ? `/tg/webhook/${secret}` : "/tg/webhook";
app.post(tgPath, (req, res, next) => webhook(req, res, next));

// CryptoBot webhook (optional)
app.post("/crypto/webhook", async (req, res) => {
  try {
    const token = process.env.CRYPTO_PAY_API_KEY || "";
    if (!token) return res.status(200).end(); // silently ignore if not configured

    const raw = req.rawBody || "";
    const got = String(req.header("Crypto-Pay-Api-Signature") || "").toLowerCase();
    const expected = crypto.createHmac("sha256", token).update(raw).digest("hex");
    if (!got || got !== expected) {
      log.warn("CryptoPay signature mismatch");
      return res.status(403).end();
    }
    const inv = (req.body?.invoice || req.body?.result || req.body);
    log.info({ status: inv?.status, id: inv?.invoice_id || inv?.id }, "CryptoPay webhook");
    if (inv?.status === "paid") {
      // Parse payload (we put plan / user in there)
      try {
        const p = JSON.parse(inv.payload || "{}");
        const plan = String(p.plan || "pro").toLowerCase();
        const userId = Number(p.tg_user);
        const expires = plan === "lifetime" ? null : new Date(Date.now() + 30*24*3600*1000).toISOString();
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
main().catch(e => { log.error(e); process.exit(1); });
