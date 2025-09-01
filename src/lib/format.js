// src/lib/format.js

export function fmtNum(n, digits = 2) {
  if (n == null || isNaN(n)) return "—";
  const num = Number(n);
  if (!isFinite(num)) return "—";
  if (Math.abs(num) >= 1e9) return (num/1e9).toFixed(digits) + "B";
  if (Math.abs(num) >= 1e6) return (num/1e6).toFixed(digits) + "M";
  if (Math.abs(num) >= 1e3) return (num/1e3).toFixed(digits) + "k";
  return num.toFixed(digits);
}

export function fmtPct(n, digits = 2) {
  if (n == null || isNaN(n)) return "—";
  const sign = n > 0 ? "▲" : (n < 0 ? "▼" : "•");
  return `${sign} ${Math.abs(Number(n)).toFixed(digits)}%`;
}

export function ago(ts) {
  if (!ts) return "—";
  const t = typeof ts === "number" ? ts : Date.parse(ts);
  const s = Math.floor((Date.now() - t) / 1000);
  const d = Math.floor(s / 86400);
  if (d > 0) return `${d}d ago`;
  const h = Math.floor((s % 86400) / 3600);
  if (h > 0) return `${h}h ago`;
  const m = Math.floor((s % 3600) / 60);
  if (m > 0) return `${m}m ago`;
  return `${s}s ago`;
}
