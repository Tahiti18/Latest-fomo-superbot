import pg from "pg";
import fs from "node:fs/promises";
import path from "node:path";
const { Pool } = pg;

let pool = null;
export function initDb() {
  if (!process.env.DATABASE_URL) return null;
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  return pool;
}
export function getPool() { return pool; }

export async function migrate() {
  if (!pool) return;
  const res = await pool.query("select to_regclass('public.users') as t");
  if (!res.rows[0].t) {
    const sql = await fs.readFile(path.resolve("migrations/001_init.sql"), "utf8");
    await pool.query(sql);
  }
}

export async function saveUser(tg) {
  if (!pool) return;
  await pool.query(
    `INSERT INTO users (tg_user_id, username, first_name)
     VALUES ($1,$2,$3)
     ON CONFLICT (tg_user_id) DO UPDATE SET username=EXCLUDED.username, first_name=EXCLUDED.first_name`,
    [tg.id, tg.username || null, tg.first_name || null]
  );
}

export async function getSubscription(tgUserId) {
  if (!pool) return null;
  const r = await pool.query(
    "SELECT plan, expires_at, status FROM subscriptions WHERE tg_user_id=$1 ORDER BY id DESC LIMIT 1",
    [tgUserId]
  );
  return r.rows[0] || null;
}

export async function setSubscription(tgUserId, plan, expiresAt) {
  if (!pool) return;
  await pool.query(
    "INSERT INTO subscriptions (tg_user_id, plan, expires_at, status) VALUES ($1,$2,$3,'active')",
    [tgUserId, plan, expiresAt]
  );
}
