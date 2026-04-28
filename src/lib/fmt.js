// ---- number formatting ----

export function fmtNum(v, dp = 0) {
  const n = Number(v);
  if (!Number.isFinite(n)) return dp ? "0.00" : "0";
  return n.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

// ---- date helpers ----

/** Parse any value into a Date or null. */
export function asDate(v) {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}
