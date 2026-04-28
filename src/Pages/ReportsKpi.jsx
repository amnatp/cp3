import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLoader } from "@/components/ui/spinner";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { apiErrorMessage } from "@/lib/utils";
import { buildRows, parsePct, toMonthLabel } from "../components/kpi/kpiUtils";
import KpiModeTabs from "../components/kpi/KpiModeTabs";
// import KpiCharts from "../components/kpi/KpiCharts"; // TODO: re-enable once chart presentation is finalized
import KpiTable from "../components/kpi/KpiTable";

const _now = new Date();
const CURRENT_YEAR  = _now.getFullYear();
const CURRENT_MONTH = _now.getMonth() + 1;
const YEAR_OPTIONS  = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];
const QUARTERS = [
  { key: 1, label: "Q1", months: [1, 2, 3] },
  { key: 2, label: "Q2", months: [4, 5, 6] },
  { key: 3, label: "Q3", months: [7, 8, 9] },
  { key: 4, label: "Q4", months: [10, 11, 12] },
];
const MONTHS_LIST = [
  { num: 1, label: "Jan" }, { num: 2, label: "Feb" }, { num: 3, label: "Mar" },
  { num: 4, label: "Apr" }, { num: 5, label: "May" }, { num: 6, label: "Jun" },
  { num: 7, label: "Jul" }, { num: 8, label: "Aug" }, { num: 9, label: "Sep" },
  { num: 10, label: "Oct" }, { num: 11, label: "Nov" }, { num: 12, label: "Dec" },
];

export default function ReportsKpi() {
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [mode, setMode] = useState("SEA_AIR");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("quarter");
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil(CURRENT_MONTH / 3));
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);

  useEffect(() => {
    let cancelled = false;
    authFetch(`/api/kpi`)
      .then((r) => {
        if (!r.ok) throw Object.assign(new Error("fetch"), { status: r.status });
        return r.json();
      })
      .then((data) => {
        if (!cancelled) {
          setEntries(Array.isArray(data) ? data : []);
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
  }, [authFetch]);

  const filteredEntries = useMemo(
    () => entries.filter((e) => e.service === mode),
    [entries, mode]
  );

  const viewConfig = useMemo(() => {
    if (viewMode === "year") {
      const maxMonth = selectedYear === CURRENT_YEAR ? CURRENT_MONTH : 12;
      return { year: selectedYear, monthNums: Array.from({ length: maxMonth }, (_, i) => i + 1) };
    }
    if (viewMode === "quarter") {
      const months = QUARTERS.find((q) => q.key === selectedQuarter)?.months ?? [1, 2, 3];
      return { year: selectedYear, monthNums: months };
    }
    return { year: selectedYear, monthNums: [selectedMonth] };
  }, [viewMode, selectedYear, selectedQuarter, selectedMonth]);

  const { rows, monthCols, year } = useMemo(
    () => buildRows(mode, filteredEntries, viewConfig),
    [mode, filteredEntries, viewConfig]
  );

  const periodLabel = useMemo(() => {
    if (viewMode === "year")    return String(selectedYear);
    if (viewMode === "quarter") return `Q${selectedQuarter} ${selectedYear}`;
    return `${toMonthLabel(selectedMonth)} ${selectedYear}`;
  }, [viewMode, selectedYear, selectedQuarter, selectedMonth]);

  const ytdLabel = viewMode === "year" ? `YTD ${selectedYear}` : periodLabel;

  const totalColCount = 3 + monthCols.length * 3 + 3;

  const avgRow = useMemo(() => {
    const catRows = rows.filter((r) => r.type === "category");
    return monthCols.map((_col, ci) => {
      const vals = catRows.map((r) => parsePct(r.monthData[ci]?.pct)).filter((v) => v !== null);
      return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
    });
  }, [rows, monthCols]);

  const avgYtd = useMemo(() => {
    const catRows = rows.filter((r) => r.type === "category");
    const vals = catRows.map((r) => parsePct(r.ytdPct)).filter((v) => v !== null);
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  }, [rows]);

  const trendData = useMemo(() =>
    monthCols.map((col, ci) => ({
      month: col.label,
      avg: avgRow[ci] === null ? null : Math.round(avgRow[ci] * 10) / 10,
    })),
  [monthCols, avgRow]);

  const categoryYtdData = useMemo(() =>
    rows
      .filter((r) => r.type === "category")
      .map((r) => ({
        name: r.label.length > 30 ? r.label.slice(0, 28) + "..." : r.label,
        ytd: r.ytdPct === null ? 0 : Math.round(r.ytdPct * 10) / 10,
        target: parsePct(r.targetKpi) ?? 98,
      })),
  [rows]);

  if (loading) return <PageLoader message="Loading KPI data�" />;

  if (error) return (
    <div className="py-24 text-center text-sm text-destructive">
      {error}
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports &amp; KPIs</h1>
          <p className="mt-0.5 text-xs text-slate-400">KPI Customs brokerage � {periodLabel} performance</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <KpiModeTabs mode={mode} setMode={setMode} />
          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {/* View mode toggle */}
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
            {["year", "quarter", "month"].map((vm) => (
              <button
                key={vm}
                onClick={() => setViewMode(vm)}
                className={
                  viewMode === vm
                    ? "rounded-md px-3 py-1.5 text-xs font-bold bg-wice-blue text-white shadow-sm transition-colors"
                    : "rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                }
              >
                {vm.charAt(0).toUpperCase() + vm.slice(1)}
              </button>
            ))}
          </div>
          {/* Quarter sub-selector */}
          {viewMode === "quarter" && (
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
              {QUARTERS.map((q) => (
                <button
                  key={q.key}
                  onClick={() => setSelectedQuarter(q.key)}
                  className={
                    selectedQuarter === q.key
                      ? "rounded-md px-3 py-1.5 text-xs font-bold bg-wice-red text-white shadow-sm transition-colors"
                      : "rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                  }
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}
          {/* Month sub-selector */}
          {viewMode === "month" && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
            >
              {MONTHS_LIST
                .filter((m) => selectedYear < CURRENT_YEAR || m.num <= CURRENT_MONTH)
                .map((m) => (
                  <option key={m.num} value={m.num}>{m.label}</option>
                ))}
            </select>
          )}
          <button
            onClick={() => navigate("/reports-kpi/entry")}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold bg-wice-red text-white shadow-sm hover:bg-wice-red-dark transition-colors"
          >
            + New Entry
          </button>
        </div>
      </div>

      {/* TODO: re-enable once chart presentation is finalized
      <KpiCharts trendData={trendData} categoryYtdData={categoryYtdData} periodLabel={periodLabel} />
      */}

      <KpiTable
        rows={rows}
        monthCols={monthCols}
        year={year}
        avgRow={avgRow}
        avgYtd={avgYtd}
        loading={loading}
        error={error}
        totalColCount={totalColCount}
        ytdLabel={ytdLabel}
      />
    </div>
  );
}
