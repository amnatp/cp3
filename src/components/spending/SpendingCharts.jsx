import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { CATEGORY_COLORS } from "./spendingData";
import { money } from "./spendingData";
import Panel from "../ui/Panel";

/** Compact axis label: 2,600,000 → 2.6M, 650,000 → 650K */
function compact(v) {
  if (v == null || Number.isNaN(Number(v))) return "";
  const n = Number(v);
  if (Math.abs(n) >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000)     return `${+(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function SpendingCharts({
  monthlyTotalsTrend,
  byCategoryForMonth,
  monthlyCategoryData,
  categories,
  selectedMonthLabel,
  groupLabel = "transport mode",
}) {
  const [barPeriod, setBarPeriod] = useState("month");
  const spendKey  = barPeriod === "ytd" ? "ytd"       : "amount";
  const outlayKey = barPeriod === "ytd" ? "ytdOutlay" : "outlay";
  const barLabel  = barPeriod === "ytd" ? "YTD"       : selectedMonthLabel;

  const periodToggle = (
    <div className="flex items-center rounded-md border bg-muted/40 p-0.5 gap-0.5">
      {["month", "ytd"].map((mode) => (
        <button
          key={mode}
          onClick={() => setBarPeriod(mode)}
          className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${
            barPeriod === mode
              ? "bg-white shadow text-slate-900"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {mode === "month" ? selectedMonthLabel : "YTD"}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        {/* Monthly trend */}
        <div className="lg:col-span-6">
          <Panel title="Monthly total trend">
            <div className="h-72 w-full">
              <ResponsiveContainer width="99%" height={288}>
                <LineChart data={monthlyTotalsTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={compact} tick={{ fontSize: 11 }} width={52} />
                  <Tooltip formatter={(v) => money(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="total" name="Spending" stroke="#1e293b" />
                  <Line type="monotone" dataKey="outlay" name="Outlay" stroke="#f59e0b" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        {/* Category bar */}
        <div className="lg:col-span-6">
          <Panel title={`Spending by ${groupLabel} (${barLabel})`} right={periodToggle}>
            <div className="h-72 w-full">
              <ResponsiveContainer width="99%" height={288}>
                <BarChart data={byCategoryForMonth} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={compact} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="category" width={190} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => money(v)} />
                  <Legend />
                  <Bar dataKey={spendKey} name="Spending" fill="#1e293b" />
                  <Bar dataKey={outlayKey} name="Outlay" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>

      {/* Stacked bar — monthly spending by category */}
      <div className="mt-4">
        <Panel title={`Monthly spending by ${groupLabel}`}>
          <div className="h-72 w-full">
            <ResponsiveContainer width="99%" height={288}>
              <BarChart data={monthlyCategoryData} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={compact} tick={{ fontSize: 11 }} width={52} />
                <Tooltip formatter={(v) => money(v)} />
                <Legend />
                {categories.map((cat, i) => (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    stackId="rev"
                    fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </>
  );
}
