import React, { useEffect, useMemo, useState } from "react";
import { PageLoader } from "@/components/ui/spinner";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { apiErrorMessage } from "@/lib/utils";
import { CURRENT_YEAR, MONTH_KEYS, money } from "../components/spending/spendingData";
import SpendingFilters from "../components/spending/SpendingFilters";
import SpendingCharts from "../components/spending/SpendingCharts";
import SpendingTable from "../components/spending/SpendingTable";
import Card from "../components/ui/Card";
import { Button } from "@/components/ui/button";

export default function ValueSpending() {
  const authFetch = useAuthFetch();
  const [year, setYear] = useState(CURRENT_YEAR);
  const [monthKey, setMonthKey] = useState(() => MONTH_KEYS[new Date().getMonth()].key);
  const [apiRows, setApiRows] = useState([]);
  const [demurrageMonthly, setDemurrageMonthly] = useState([]);
  const [detentionMonthly, setDetentionMonthly] = useState([]);
  const [laborTransportMonthly, setLaborTransportMonthly] = useState([]);
  const [laborCustomsMonthly, setLaborCustomsMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("chargeGroup");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    authFetch(`/api/value-spending?year=${year}`)
      .then((r) => {
        if (!r.ok) throw Object.assign(new Error("fetch"), { status: r.status });
        return r.json();
      })
      .then((data) => {
        if (!cancelled) {
          setApiRows(data.rows ?? []);
          setDemurrageMonthly(data.demurrage ?? []);
          setDetentionMonthly(data.detention ?? []);
          setLaborTransportMonthly(data.laborTransport ?? []);
          setLaborCustomsMonthly(data.laborCustoms ?? []);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(apiErrorMessage(e));
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [year, authFetch]);

  const { rows, totalRow } = useMemo(() => {
    const byCategory = {};
    apiRows.forEach((r) => {
      if (!byCategory[r.category]) byCategory[r.category] = { rev: {}, out: {}, items: {} };
      const b = byCategory[r.category];
      b.rev[r.month] = (b.rev[r.month] ?? 0) + Number(r.amount);
      b.out[r.month] = (b.out[r.month] ?? 0) + Number(r.outlay);
      const grp = r.chargeGroup || "(Unspecified)";
      if (!b.items[grp]) b.items[grp] = { rev: {}, out: {} };
      b.items[grp].rev[r.month] = (b.items[grp].rev[r.month] ?? 0) + Number(r.amount);
      b.items[grp].out[r.month] = (b.items[grp].out[r.month] ?? 0) + Number(r.outlay);
    });
    const nonTotal = Object.entries(byCategory).map(([cat, { rev, out, items }]) => {
      const row = { CATEGORIES: cat };
      let ytdRev = 0, ytdOut = 0;
      MONTH_KEYS.forEach((m) => {
        row[m.key] = rev[m.num] ?? 0;
        row[`${m.key}_OUT`] = out[m.num] ?? 0;
        ytdRev += rev[m.num] ?? 0;
        ytdOut += out[m.num] ?? 0;
      });
      row.AMOUNT = ytdRev;
      row.OUTLAY = ytdOut;
      row.subRows = Object.entries(items)
        .map(([desc, { rev: iRev, out: iOut }]) => {
          const sub = { CATEGORIES: desc };
          let sRev = 0, sOut = 0;
          MONTH_KEYS.forEach((m) => {
            sub[m.key] = iRev[m.num] ?? 0;
            sub[`${m.key}_OUT`] = iOut[m.num] ?? 0;
            sRev += iRev[m.num] ?? 0;
            sOut += iOut[m.num] ?? 0;
          });
          sub.AMOUNT = sRev;
          sub.OUTLAY = sOut;
          return sub;
        })
        .sort((a, b) => b.AMOUNT - a.AMOUNT);
      return row;
    });
    const total = { CATEGORIES: "TOTAL", AMOUNT: 0, OUTLAY: 0 };
    MONTH_KEYS.forEach((m) => {
      total[m.key] = nonTotal.reduce((s, r) => s + (r[m.key] ?? 0), 0);
      total[`${m.key}_OUT`] = nonTotal.reduce((s, r) => s + (r[`${m.key}_OUT`] ?? 0), 0);
      total.AMOUNT += total[m.key];
      total.OUTLAY += total[`${m.key}_OUT`];
    });
    return { rows: nonTotal, totalRow: nonTotal.length ? total : null };
  }, [apiRows]);

  const CHARGE_GROUP_ORDER = [
    "Customs Brokerage Import",
    "Customs Brokerage Export",
    "Cross Border Transportation Export",
    "Cross Border Transportation Import",
    "Inland Transportation Export+Import",
    "Demurrage Charge",
    "Detention Charge",
    "Storage Charge",
    "Others",
  ];

  function chargeGroupRank(name) {
    const idx = CHARGE_GROUP_ORDER.indexOf(name);
    return idx === -1 ? CHARGE_GROUP_ORDER.length : idx;
  }

  // Charge-group view: flatten all sample charge groups across categories
  const chargeGroupRows = useMemo(() => {
    const byGroup = {};
    apiRows.forEach((r) => {
      const grp = r.chargeGroup || "(Unspecified)";
      if (!byGroup[grp]) byGroup[grp] = { rev: {}, out: {} };
      byGroup[grp].rev[r.month] = (byGroup[grp].rev[r.month] ?? 0) + Number(r.amount);
      byGroup[grp].out[r.month] = (byGroup[grp].out[r.month] ?? 0) + Number(r.outlay);
    });
    // Merge demurrage/detention monthly amounts (delivered as separate arrays from API)
    const mergeMonthly = (grp, list) => {
      if (!list?.length) return;
      if (!byGroup[grp]) byGroup[grp] = { rev: {}, out: {} };
      list.forEach((d) => {
        byGroup[grp].rev[d.month] = (byGroup[grp].rev[d.month] ?? 0) + Number(d.amount);
      });
    };
    mergeMonthly("Demurrage Charge", demurrageMonthly);
    mergeMonthly("Detention Charge", detentionMonthly);
    return Object.entries(byGroup)
      .map(([grp, { rev, out }]) => {
        const row = { CATEGORIES: grp };
        let ytdRev = 0, ytdOut = 0;
        MONTH_KEYS.forEach((m) => {
          row[m.key] = rev[m.num] ?? 0;
          row[`${m.key}_OUT`] = out[m.num] ?? 0;
          ytdRev += rev[m.num] ?? 0;
          ytdOut += out[m.num] ?? 0;
        });
        row.AMOUNT = ytdRev;
        row.OUTLAY = ytdOut;
        return row;
      })
      .sort((a, b) => chargeGroupRank(a.CATEGORIES) - chargeGroupRank(b.CATEGORIES) || b.AMOUNT - a.AMOUNT);
  }, [apiRows, demurrageMonthly, detentionMonthly]);

  const selectedMonthLabel = useMemo(
    () => MONTH_KEYS.find((m) => m.key === monthKey)?.label ?? monthKey,
    [monthKey]
  );

  const monthTotal   = useMemo(() => (totalRow ? Number(totalRow[monthKey] || 0) : 0), [totalRow, monthKey]);
  const ytdTotal     = useMemo(() => (totalRow ? Number(totalRow.AMOUNT || 0) : 0), [totalRow]);
  const monthOutlay  = useMemo(() => (totalRow ? Number(totalRow[`${monthKey}_OUT`] || 0) : 0), [totalRow, monthKey]);
  const ytdOutlay    = useMemo(() => (totalRow ? Number(totalRow.OUTLAY || 0) : 0), [totalRow]);

  const monthNum = useMemo(() => MONTH_KEYS.find((m) => m.key === monthKey)?.num, [monthKey]);

  const demurrageSpending = useMemo(() => {
    let month = 0, ytd = 0;
    demurrageMonthly.forEach((d) => {
      ytd += Number(d.amount);
      if (d.month === monthNum) month += Number(d.amount);
    });
    return { month, ytd };
  }, [demurrageMonthly, monthNum]);

  const detentionSpending = useMemo(() => {
    let month = 0, ytd = 0;
    detentionMonthly.forEach((d) => {
      ytd += Number(d.amount);
      if (d.month === monthNum) month += Number(d.amount);
    });
    return { month, ytd };
  }, [detentionMonthly, monthNum]);

  const laborTransportSpending = useMemo(() => {
    let month = 0, ytd = 0;
    laborTransportMonthly.forEach((d) => {
      ytd += Number(d.amount);
      if (d.month === monthNum) month += Number(d.amount);
    });
    return { month, ytd };
  }, [laborTransportMonthly, monthNum]);

  const laborCustomsSpending = useMemo(() => {
    let month = 0, ytd = 0;
    laborCustomsMonthly.forEach((d) => {
      ytd += Number(d.amount);
      if (d.month === monthNum) month += Number(d.amount);
    });
    return { month, ytd };
  }, [laborCustomsMonthly, monthNum]);

  const byCategoryForMonth = useMemo(() =>
    rows
      .map((r) => ({
        category: r.CATEGORIES,
        amount:    Number(r[monthKey] || 0),
        outlay:    Number(r[`${monthKey}_OUT`] || 0),
        ytd:       Number(r.AMOUNT || 0),
        ytdOutlay: Number(r.OUTLAY || 0),
        subRows:  (r.subRows || []).map((s) => ({
          category: s.CATEGORIES,
          amount:    Number(s[monthKey] || 0),
          outlay:    Number(s[`${monthKey}_OUT`] || 0),
          ytd:       Number(s.AMOUNT || 0),
          ytdOutlay: Number(s.OUTLAY || 0),
        })),
      }))
      .sort((a, b) => b.amount - a.amount),
  [rows, monthKey]);

  const byChargeGroupForMonth = useMemo(() =>
    chargeGroupRows
      .map((r) => ({
        category: r.CATEGORIES,
        amount:    Number(r[monthKey] || 0),
        outlay:    Number(r[`${monthKey}_OUT`] || 0),
        ytd:       Number(r.AMOUNT || 0),
        ytdOutlay: Number(r.OUTLAY || 0),
      }))
      .sort((a, b) => b.amount - a.amount),
  [chargeGroupRows, monthKey]);

  const activeRows = viewMode === "chargeGroup" ? byChargeGroupForMonth : byCategoryForMonth;

  const monthlyTotalsTrend = useMemo(() => {
    if (!totalRow) return [];
    return MONTH_KEYS.map((m) => ({
      month:  m.label,
      total:  Number(totalRow[m.key] || 0),
      outlay: Number(totalRow[`${m.key}_OUT`] || 0),
    }));
  }, [totalRow]);

  const activeDetailRows = viewMode === "chargeGroup" ? chargeGroupRows : rows;
  const activeTotalRow = useMemo(() => {
    if (!activeDetailRows.length) return null;
    const total = { CATEGORIES: "TOTAL", AMOUNT: 0, OUTLAY: 0 };
    MONTH_KEYS.forEach((m) => {
      total[m.key] = activeDetailRows.reduce((sum, row) => sum + Number(row[m.key] || 0), 0);
      total[`${m.key}_OUT`] = activeDetailRows.reduce((sum, row) => sum + Number(row[`${m.key}_OUT`] || 0), 0);
      total.AMOUNT += total[m.key];
      total.OUTLAY += total[`${m.key}_OUT`];
    });
    return total;
  }, [activeDetailRows]);
  const categories        = useMemo(() => activeDetailRows.map((r) => r.CATEGORIES), [activeDetailRows]);
  const monthlyCategoryData = useMemo(() =>
    MONTH_KEYS.map((m) => {
      const entry = { month: m.label };
      activeDetailRows.forEach((r) => { entry[r.CATEGORIES] = Number(r[m.key] || 0); });
      return entry;
    }),
  [activeDetailRows]);

  if (loading) return <PageLoader message="Loading spending data…" />;
  if (error)   return (
    <div className="py-24 text-center text-sm text-destructive">
      Failed to load spending data: {error}
    </div>
  );

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Value Spending Report</h1>
          <p className="mt-1 text-sm text-slate-600">
            Monthly spending by transport mode (Customs / Transport / Storage / Others).
          </p>
        </div>
        <SpendingFilters year={year} setYear={setYear} monthKey={monthKey} setMonthKey={setMonthKey} />
      </div>

      <div className="mt-3 flex items-center gap-1 rounded-lg border bg-muted/40 p-1 w-fit">
        <Button
          size="sm"
          variant={viewMode === "chargeGroup" ? "default" : "ghost"}
          onClick={() => setViewMode("chargeGroup")}
          className="text-xs"
        >
          By Charge Group
        </Button>
        <Button
          size="sm"
          variant={viewMode === "category" ? "default" : "ghost"}
          onClick={() => setViewMode("category")}
          className="text-xs"
        >
          By Transport Mode
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card title={`Spending (${selectedMonthLabel})`} value={money(monthTotal)}  sub="LocalSellAmt" />
        <Card title="YTD Spending" value={money(ytdTotal)}  sub="Sum of all months" />
        <Card title={`Outlay (${selectedMonthLabel})`}  value={money(monthOutlay)} sub="LocalAdvanceSellAmt" />
        <Card title="YTD Outlay"  value={money(ytdOutlay)} sub="Sum of all months" />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card title={`Demurrage (${selectedMonthLabel})`} value={money(demurrageSpending.month)} sub="Monthly demurrage" tone="warn" />
        <Card title="Demurrage YTD" value={money(demurrageSpending.ytd)} sub="Sum of all months" tone="warn" />
        <Card title={`Detention (${selectedMonthLabel})`} value={money(detentionSpending.month)} sub="Monthly detention" tone="bad" />
        <Card title="Detention YTD" value={money(detentionSpending.ytd)} sub="Sum of all months" tone="bad" />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card title={`Labor Transport (${selectedMonthLabel})`} value={money(laborTransportSpending.month)} sub="LocalCostAmt" />
        <Card title="Labor Transport YTD" value={money(laborTransportSpending.ytd)} sub="Sum of all months" />
        <Card title={`Labor Customs (${selectedMonthLabel})`} value={money(laborCustomsSpending.month)} sub="LocalCostAmt" />
        <Card title="Labor Customs YTD" value={money(laborCustomsSpending.ytd)} sub="Sum of all months" />
      </div>

      <SpendingCharts
        monthlyTotalsTrend={monthlyTotalsTrend}
        byCategoryForMonth={activeRows}
        monthlyCategoryData={monthlyCategoryData}
        categories={categories}
        selectedMonthLabel={selectedMonthLabel}
        groupLabel={viewMode === "chargeGroup" ? "charge group" : "transport mode"}
      />

      <SpendingTable
        rows={activeDetailRows}
        totalRow={activeTotalRow}
        title={viewMode === "chargeGroup" ? "Spending by charge group" : "Spending by transport mode"}
        firstColumnLabel={viewMode === "chargeGroup" ? "Categories" : "Transport Mode"}
      />
    </div>
  );
}
