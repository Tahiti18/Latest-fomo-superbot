CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  tg_user_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  tg_user_id BIGINT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  expires_at TIMESTAMPTZ NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sub_user ON subscriptions(tg_user_id);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  tg_user_id BIGINT NOT NULL,
  symbol TEXT NOT NULL,
  target_usd NUMERIC NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('above','below')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS raids (
  id SERIAL PRIMARY KEY,
  tg_chat_id BIGINT NOT NULL,
  message TEXT NOT NULL,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tips (
  id SERIAL PRIMARY KEY,
  tg_chat_id BIGINT NOT NULL,
  from_user BIGINT NOT NULL,
  to_user BIGINT NULL,
  amount NUMERIC NOT NULL,
  asset TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
