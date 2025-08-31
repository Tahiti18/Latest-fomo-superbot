// src/db.js
import pino from "pino";
import fs from "node:fs/promises";
import path from "node:path";
import pkg from "pg";

const log = pino({ level: process.env.LOG_LEVEL || "info" });
const { Pool } = pkg;

let pool = null;

/**
 * Initialize (or return existing) PG pool.
 * Safe no-op if DATABASE_URL is missing.
 */
export function initDb() {
  if (pool) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) {
    log.warn("DATABASE_URL not set; DB features disabled");
    return null;
  }
  pool = new Pool({
    connectionString: url,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });
  pool.on("error", (e) => log.error({ e }, "PG pool error"));
  return pool;
}

export function getPool() {
  return pool;
}

/**
 * Run migrations.
 * Tries migrations/001_init.sql; if missing, falls back to inline schema.
 */
export async function migrate() {
  if (!initDb()) return;

  // If users table exists, assume schema is already created.
  const exists = await pool.query(
    "select to_regclass('public.users') as t"
  );
  if (exists.rows[0]?.t) {
    log.info("DB migrate: users table exists (skip)");
    return;
  }

  // Try file-based migration first
  const migPath = path.resolve("migrations/001_init.sql");
  try {
    const sql = await fs.readFile(migPath, "utf8");
    await pool.query(sql);
    log.info("DB migrate: applied migrations/001_init.sql");
    return;
  } catch {
    // Fall back to inline schema
    const inline = `
      create table if not exists users (
        id           bigint primary key,           -- Telegram user id
        username     text,
        first_name   text,
        last_name    text,
        lang         text,
        created_at   timestamptz not null default now(),
        updated_at   timestamptz not null default now()
      );

      -- Backward-compat: some older code used tg_user_id as FK; we keep that name in subscriptions.
      create table if not exists subscriptions (
        id           bigserial primary key,
        tg_user_id   bigint not null references users(id) on delete cascade,
        plan         text   not null,              -- starter | pro | lifetime
        expires_at   timestamptz,                  -- null for lifetime
        status       text   not null default 'active',  -- active | expired | canceled
        created_at   timestamptz not null default now(),
        updated_at   timestamptz not null default now()
      );

      create index if not exists subscriptions_user_active_idx
        on subscriptions(tg_user_id)
        where status = 'active';
    `;
    await pool.query(inline);
    log.info("DB migrate: applied inline schema");
  }
}

/**
 * Upsert a Telegram user.
 * Accepts full ctx.from (id, username, first_name, last_name, language_code).
 */
export async function saveUser(from) {
  if (!initDb() || !from) return;

  // Ensure the users table uses column "id" (not tg_user_id)
  const q = `
    insert into users (id, username, first_name, last_name, lang)
    values ($1, $2, $3, $4, $5)
    on conflict (id) do update
      set username   = excluded.username,
          first_name = excluded.first_name,
          last_name  = excluded.last_name,
          lang       = excluded.lang,
          updated_at = now()
  `;
  const vals = [
    from.id,
    from.username || null,
    from.first_name || null,
    from.last_name || null,
    from.language_code || null,
  ];
  try {
    await pool.query(q, vals);
  } catch (e) {
    log.error({ e }, "saveUser failed");
  }
}

/**
 * Activate a subscription for a user.
 * - Ensures user row exists
 * - Expires any existing active subs
 * - Inserts a new active subscription
 */
export async function setSubscription(tgUserId, plan, expiresAt /* ISO string or null */) {
  if (!initDb() || !tgUserId) return;

  const client = await pool.connect();
  try {
    await client.query("begin");

    // Ensure user exists
    await client.query(
      `insert into users (id) values ($1) on conflict (id) do nothing`,
      [tgUserId]
    );

    // Expire existing active subs
    await client.query(
      `update subscriptions
         set status='expired', updated_at=now()
       where tg_user_id=$1 and status='active'`,
      [tgUserId]
    );

    // Insert new active sub
    await client.query(
      `insert into subscriptions (tg_user_id, plan, expires_at, status)
       values ($1, $2, $3, 'active')`,
      [tgUserId, String(plan || "pro").toLowerCase(), expiresAt || null]
    );

    await client.query("commit");
    log.info({ tgUserId, plan, expiresAt }, "setSubscription: activated");
  } catch (e) {
    await client.query("rollback");
    log.error({ e }, "setSubscription failed");
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Preferred: fetch current active subscription.
 * Returns { plan, expires_at, status } or null.
 */
export async function getActiveSubscription(tgUserId) {
  if (!initDb() || !tgUserId) return null;
  const q = `
    select plan, expires_at, status
      from subscriptions
     where tg_user_id=$1 and status='active'
     order by created_at desc
     limit 1
  `;
  const { rows } = await pool.query(q, [tgUserId]);
  return rows[0] || null;
}

/**
 * Backward-compat alias (older code used getSubscription).
 */
export async function getSubscription(tgUserId) {
  return getActiveSubscription(tgUserId);
}

/**
 * Optional helper to run arbitrary queries.
 */
export async function query(text, params) {
  if (!initDb()) throw new Error("DB not initialized");
  return pool.query(text, params);
}
