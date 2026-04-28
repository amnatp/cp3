import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { fmtNum } from "@/lib/fmt.js";

const THEME = {
  primary: "#0b78bd",
  accent:  "#c35b2e",
  mutedGrid: "#d7dee8",
};

const PIE_COLORS = [
  "#0b78bd", "#c35b2e", "#69a82f", "#ef4444",
  "#8b5cf6", "#14b8a6", "#64748b", "#0ea5e9",
];

function SimpleCard({ title, right, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {right ? <div>{right}</div> : null}
      </div>
      {children}
    </div>
  );
}

function Kpi({ label, value, tone = "primary" }) {
  const toneClass =
    tone === "accent"  ? "border-t-[#c35b2e]" :
    tone === "success" ? "border-t-[#69a82f]"  :
    tone === "warning" ? "border-t-[#f59e0b]"  :
    tone === "muted"   ? "border-t-[#64748b]"  :
                         "border-t-[#0b78bd]";

  return (
    <div className={`rounded-xl border border-slate-200 border-t-4 bg-white p-4 shadow-sm ${toneClass}`}>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value}</div>
    </div>
  );
}

function BarCard({ title, data, importKey, exportKey, yLabel, valueDp = 0 }) {
  return (
    <SimpleCard title={title} right={<div className="text-xs text-slate-500">{yLabel}</div>}>
      <div className="h-56 min-h-[224px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={1}>
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(v) => fmtNum(v, valueDp)}
              labelStyle={{ fontSize: 12 }}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <CartesianGrid stroke={THEME.mutedGrid} strokeDasharray="3 3" />
            <Bar dataKey={importKey} name="Import" stackId="s" fill={THEME.primary} />
            <Bar dataKey={exportKey} name="Export" stackId="s" fill={THEME.accent} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SimpleCard>
  );
}

function DonutCard({ title, data, valueDp = 0 }) {
  const safeData = (data || []).filter((d) => Number(d?.value) > 0);
  const total = safeData.reduce((sum, item) => sum + (Number(item?.value) || 0), 0);

  return (
    <SimpleCard title={title}>
      <div className="h-56 min-h-[224px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={1}>
          <PieChart>
            <Tooltip
              formatter={(v) => fmtNum(v, valueDp)}
              labelStyle={{ fontSize: 12 }}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Pie
              data={safeData}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
            >
              {safeData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-900 text-base font-semibold"
            >
              {fmtNum(total, valueDp)}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </SimpleCard>
  );
}

export default function DashboardInsightsGrid({ kind, loading, error, onRetry, totals, monthly, donutCards }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Loading {kind} dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-5">
        <span className="text-sm text-rose-700">{error}</span>
        <button
          onClick={onRetry}
          className="rounded-md border border-rose-300 bg-white px-3 py-1 text-sm font-medium text-rose-700 hover:bg-rose-100"
        >
          Retry
        </button>
      </div>
    );
  }

  const importDonutCards = (donutCards || []).filter((item) =>
    (item?.title || "").toLowerCase().includes("import")
  );
  const exportDonutCards = (donutCards || []).filter((item) =>
    (item?.title || "").toLowerCase().includes("export")
  );

  const isAir = kind === "air";
  const isSea = kind === "sea";
  const middleKpiLabel = isSea || kind === "crossborder" ? "Total Containers" : "Total Shipments";
  const middleKpiValue =
    isSea || kind === "crossborder"
      ? fmtNum(totals?.totalContainers ?? 0)
      : fmtNum(totals?.totalShipments ?? 0);

  return (
    <>
      {importDonutCards.length > 0 || exportDonutCards.length > 0 ? (
        <>
          {exportDonutCards.length > 0 && (
            <>
              <div className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-700">Export</div>
              <div className="grid gap-3 lg:grid-cols-2 min-w-0">
                {exportDonutCards.map((item) => (
                  <DonutCard key={item.title} title={item.title} data={item.data} valueDp={item.valueDp} />
                ))}
              </div>
            </>
          )}
          {importDonutCards.length > 0 && (
            <>
              <div className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-700">Import</div>
              <div className="grid gap-3 lg:grid-cols-2 min-w-0">
                {importDonutCards.map((item) => (
                  <DonutCard key={item.title} title={item.title} data={item.data} valueDp={item.valueDp} />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2 min-w-0">
          {(donutCards || []).map((item) => (
            <DonutCard key={item.title} title={item.title} data={item.data} valueDp={item.valueDp} />
          ))}
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2 min-w-0">
        <BarCard
          title="Shipments by Month"
          data={monthly}
          importKey="importTrips"
          exportKey="exportTrips"
          yLabel="Shipments"
        />
        <BarCard
          title="Containers / Pieces by Month"
          data={monthly}
          importKey="importPcs"
          exportKey="exportPcs"
          yLabel={isSea || kind === "crossborder" ? "Containers" : "Pieces"}
        />
      </div>
    </>
  );
}
