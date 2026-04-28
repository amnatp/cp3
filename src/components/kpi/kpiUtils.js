import { MONTH_ABBR, TEMPLATE_ITEMS } from "./kpiData";

export function parsePct(pct) {
  if (pct === null || pct === undefined || pct === "") return null;
  const s = String(pct).trim();
  const withSign = s.endsWith("%") ? s.slice(0, -1) : null;
  const n = Number.parseFloat(withSign ?? s);
  if (Number.isNaN(n)) return null;
  if (withSign !== null) return n;
  if (n >= 0 && n <= 1) return Math.round(n * 10000) / 100;
  return n;
}

export function effectivePct(pct) {
  return parsePct(pct) ?? 0;
}

export function fmtPct(n) {
  if (n === null) return "—";
  return `${n.toFixed(0)}%`;
}

export function fmtNum(v) {
  return v == null ? "0" : String(v);
}

export function toMonthLabel(monthNum) {
  return MONTH_ABBR[monthNum - 1] ?? String(monthNum);
}

/**
 * Returns pass/fail color based on whether `n` meets `target`.
 * target: the KPI target string e.g. "98%" or "100%", defaults to 98 if absent.
 */
export function getPctColor(n, target) {
  if (n === null || n === undefined) return "#94a3b8";
  const t = parsePct(target) ?? 98;
  return n >= t ? "#16a34a" : "#dc2626"; // green = pass, red = fail
}

export function buildRows(mode, entries, viewConfig) {
  const { year, monthNums } = viewConfig;

  const monthCols = monthNums.map((m) => ({
    key: `${year}-${m}`,
    monthNum: m,
    label: toMonthLabel(m),
  }));

  const entryByMonth = {};
  (entries ?? []).forEach((e) => {
    if (e.year !== year) return;
    const mNum = MONTH_ABBR.indexOf(e.month?.toUpperCase()) + 1;
    if (mNum > 0) entryByMonth[mNum] = e;
  });

  function findItem(col, criterionId) {
    const entry = entryByMonth[col.monthNum];
    return entry?.items?.find((it) => it.criterionId === criterionId) ?? null;
  }

  function makeDataRow(type, label, criterionId, kpiDays, targetKpi) {
    const monthData = monthCols.map((col) => findItem(col, criterionId));
    let ytdTotal = null, ytdMissed = null;
    const pctVals = [];
    monthData.forEach((d) => {
      if (d !== null) {
        ytdTotal = (ytdTotal ?? 0) + (d.total ?? 0);
        ytdMissed = (ytdMissed ?? 0) + (d.missed ?? 0);
        const p = parsePct(d.pct);
        if (p !== null) pctVals.push(p);
      }
    });
    const ytdPct = pctVals.length
      ? pctVals.reduce((s, v) => s + v, 0) / pctVals.length
      : null;
    return { type, label, kpiDays: kpiDays ?? "", targetKpi: targetKpi ?? "", monthData, ytdTotal, ytdMissed, ytdPct };
  }

  const rows = [];
  (TEMPLATE_ITEMS[mode] ?? []).forEach((item) => {
    if (item.type === "section") {
      rows.push({ type: "section", label: item.label });
    } else if (item.type === "category") {
      rows.push(makeDataRow("category", item.label, item.criterionId, item.kpiDays, item.targetKpi));
    } else {
      rows.push(makeDataRow("sub", item.label, item.criterionId, item.kpiDays ?? "", ""));
    }
  });

  return { rows, monthCols, year };
}
