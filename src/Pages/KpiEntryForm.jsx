import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { TEMPLATE_ITEMS, MODE_TABS, MONTH_ABBR } from "@/components/kpi/kpiData";
import { Button } from "@/components/ui/button";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

function calcPct(total, missed) {
  if (total == null || total === "" || Number(total) === 0) return null;
  const t = Number(total);
  const m = Number(missed ?? 0);
  return Math.round(((t - m) / t) * 10000) / 100;
}

export default function KpiEntryForm() {
  const authFetch = useAuthFetch();
  const navigate = useNavigate();

  const now = new Date();
  const [service, setService] = useState("SEA_AIR");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [values, setValues] = useState({}); // { [criterionId]: { total, missed } }
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const template = useMemo(() => TEMPLATE_ITEMS[service] ?? [], [service]);

  // Only rows with a criterionId are data-entry rows
  const entryRows = useMemo(
    () => template.filter((r) => r.criterionId != null),
    [template]
  );

  function handleChange(criterionId, field, raw) {
    const num = raw === "" ? "" : Math.max(0, parseInt(raw, 10) || 0);
    setValues((prev) => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        [field]: num,
      },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    const items = entryRows
      .map((row) => {
        const v = values[row.criterionId] ?? {};
        const total = v.total === "" || v.total == null ? null : Number(v.total);
        const missed = v.missed === "" || v.missed == null ? null : Number(v.missed);
        const pct = calcPct(total, missed);
        return { criterionId: row.criterionId, total, missed, pct };
      })
      .filter((item) => item.total != null || item.missed != null);

    try {
      const res = await authFetch("/api/kpi", {
        method: "POST",
        body: JSON.stringify({ service, month: Number(month), year: Number(year), items }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      setSuccess(true);
      setValues({});
    } catch (err) {
      setError(err.message ?? "Failed to save.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">KPI Data Entry</h1>
          <p className="mt-0.5 text-xs text-slate-400">Submit monthly KPI figures</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/reports-kpi")}>
          ← Back to Reports
        </Button>
      </div>

      {/* Period selectors */}
      <div className="mb-5 flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Service</label>
          <div className="flex gap-2">
            {MODE_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setService(tab.key); setValues({}); }}
                className={
                  service === tab.key
                    ? "rounded-lg px-3 py-1.5 text-sm font-semibold bg-wice-red text-white shadow-sm"
                    : "rounded-lg px-3 py-1.5 text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide" htmlFor="month-select">Month</label>
          <select
            id="month-select"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-wice-red/40"
          >
            {MONTH_ABBR.map((abbr, i) => (
              <option key={i + 1} value={i + 1}>{abbr}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide" htmlFor="year-select">Year</label>
          <select
            id="year-select"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-wice-red/40"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Entry table */}
      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-12">#</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">KPI Criterion</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">KPI Days</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Target</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide w-32">Total</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide w-32">Missed</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">% Auto</th>
              </tr>
            </thead>
            <tbody>
              {template.map((row, idx) => {
                if (row.type === "section") {
                  return (
                    <tr key={idx}>
                      <td
                        colSpan={7}
                        className="border-b border-t border-slate-200 bg-sky-50 px-3 py-1.5 text-xs font-bold italic underline text-sky-800"
                      >
                        {row.label}
                      </td>
                    </tr>
                  );
                }

                if (row.type === "category") {
                  const v = values[row.criterionId] ?? {};
                  const pct = calcPct(v.total, v.missed);
                  return (
                    <tr key={idx} className="border-b border-slate-100 bg-slate-50/60">
                      <td className="px-3 py-2 text-xs text-slate-400">{row.criterionId}</td>
                      <td className="px-3 py-2 text-xs font-semibold text-slate-800">{row.label}</td>
                      <td className="px-3 py-2 text-center text-xs text-slate-500">{row.kpiDays ?? ""}</td>
                      <td className="px-3 py-2 text-center text-xs font-semibold text-slate-700">{row.targetKpi ?? ""}</td>
                      <td className="px-2 py-1.5 text-center">
                        <input
                          type="number"
                          min="0"
                          value={v.total ?? ""}
                          onChange={(e) => handleChange(row.criterionId, "total", e.target.value)}
                          className="w-24 rounded border border-slate-200 px-2 py-1 text-center text-xs focus:outline-none focus:ring-2 focus:ring-wice-red/40"
                          placeholder="—"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <input
                          type="number"
                          min="0"
                          value={v.missed ?? ""}
                          onChange={(e) => handleChange(row.criterionId, "missed", e.target.value)}
                          className="w-24 rounded border border-slate-200 px-2 py-1 text-center text-xs focus:outline-none focus:ring-2 focus:ring-wice-red/40"
                          placeholder="—"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        {pct !== null ? (
                          <span
                            className="inline-block rounded px-1.5 py-0.5 text-[11px] font-bold text-white"
                            style={{ backgroundColor: pct >= (parseFloat(row.targetKpi) ?? 98) ? "#16a34a" : "#dc2626" }}
                          >
                            {pct.toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                }

                // sub row
                const v = values[row.criterionId] ?? {};
                const pct = calcPct(v.total, v.missed);
                return (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-3 py-2 text-xs text-slate-400">{row.criterionId}</td>
                    <td className="px-3 py-2 pl-6 text-xs text-slate-600">{row.label}</td>
                    <td className="px-3 py-2 text-center text-xs text-slate-400">{row.kpiDays ?? ""}</td>
                    <td className="px-3 py-2 text-center text-xs text-slate-400"></td>
                    <td className="px-2 py-1.5 text-center">
                      <input
                        type="number"
                        min="0"
                        value={v.total ?? ""}
                        onChange={(e) => handleChange(row.criterionId, "total", e.target.value)}
                        className="w-24 rounded border border-slate-200 px-2 py-1 text-center text-xs focus:outline-none focus:ring-2 focus:ring-wice-red/40"
                        placeholder="—"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <input
                        type="number"
                        min="0"
                        value={v.missed ?? ""}
                        onChange={(e) => handleChange(row.criterionId, "missed", e.target.value)}
                        className="w-24 rounded border border-slate-200 px-2 py-1 text-center text-xs focus:outline-none focus:ring-2 focus:ring-wice-red/40"
                        placeholder="—"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      {pct !== null ? (
                        <span className="text-xs text-slate-500">{pct.toFixed(0)}%</span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Feedback */}
        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
            KPI entry saved successfully.
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/reports-kpi")}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save Entry"}
          </Button>
        </div>
      </form>
    </div>
  );
}
