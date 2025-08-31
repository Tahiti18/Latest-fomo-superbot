# FOMO Superbot — Max Pack (Pure JS)

**Everything needed to run now, with wide feature coverage (many stubs so nothing crashes).**

## Features
- Express + grammY bot with inline menu
- Commands wired: `/start`, `/menu`, `/help`, `/status`, `/buy`, `/scan`, `/honeypot`, `/price`, `/meme`, `/tip`, `/rain`, `/raid`, `/grant`
- CryptoBot invoice creation (`/buy`) + webhook `/crypto/webhook` to auto-grant premium
- Optional Postgres + auto-migration for `users`, `subscriptions`, `alerts`, `raids`, `tips`
- CoinGecko price helper for `/price`
- Healthcheck `/health`
- Webhook path with optional secret: `/tg/webhook/<BOT_SECRET>`

## Env (Railway Variables)
```
BOT_TOKEN=8059851106:REPLACE_ME
BOT_SECRET=fomo-secret-123
BOT_PUBLIC_URL=https://your-app.up.railway.app
API_BASE_URL=https://api.coingecko.com/api/v3
CRYPTO_PAY_API_KEY=REPLACE_ME
DATABASE_URL=postgres://USER:PASS@HOST:5432/DBNAME
PORT=8080
```

## Deploy (Railway)
1. Push this repo to GitHub → Deploy on Railway.
2. Set variables (above). If you don't have DB/CRYPTO keys, leave them empty; bot still runs.
3. Set Telegram webhook (with secret in path if you set BOT_SECRET):
```
https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://<domain>/tg/webhook/fomo-secret-123
```
Or without secret:
```
https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://<domain>/tg/webhook
```

## Test
- `/start`, `/menu`, press buttons
- `/status` → shows subscription (DB-backed if DATABASE_URL set)
- `/price btc`
- `/scan 0xABC...`
- `/buy pro USDT` → opens invoice (if CRYPTO_PAY_API_KEY set)
- After payment, CryptoBot calls `/crypto/webhook` and grants premium automatically

## Next
Swap stub handlers (`safety`, `meme`, `rewards`, `mktg`) with your real logic — wiring is in place.
