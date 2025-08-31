import fetch from "node-fetch";

export async function createInvoice({ amount, asset = "USDT", description = "FOMO Superbot Premium", payload = "", expires_in = 900 }) {
  const token = process.env.CRYPTO_PAY_API_KEY;
  if (!token) throw new Error("CRYPTO_PAY_API_KEY missing");
  const body = { asset, amount, description, payload, expires_in, allow_comments: false, allow_anonymous: false };
  const r = await fetch("https://pay.crypt.bot/api/createInvoice", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Crypto-Pay-API-Token": token },
    body: JSON.stringify(body)
  });
  const j = await r.json();
  if (!j.ok) throw new Error(`CryptoPay error: ${JSON.stringify(j)}`);
  return j.result;
}
