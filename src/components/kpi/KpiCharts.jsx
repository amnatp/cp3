import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { getPctColor } from "./kpiUtils";

function ColoredDot({ cx, cy, value }) {
  if (value === null || value === undefined) return null;
  const color = getPctColor(value, "98%");
  return <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={1.5} />;
}

export default function KpiCharts({ trendData, categoryYtdData, periodLabel }) {
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      {/* Monthly average KPI % trend */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
          Monthly average KPI %
        </div>
        <div className="p-4">
          <div className="h-64 w-full">
            <ResponsiveContainer width="99%" height={256}>
              <LineChart data={trendData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => (v === null ? "—" : `${v}%`)} />
                <ReferenceLine
                  y={98}
                  stroke="#16a34a"
                  strokeDasharray="4 4"
                  label={{ value: "Target 98%", position: "right", fontSize: 10, fill: "#16a34a" }}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  name="Avg KPI %"
                  stroke="#64748b"
                  strokeWidth={2}
                  dot={<ColoredDot />}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category YTD performance */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
          Category {periodLabel ?? "YTD"} performance
        </div>
        <div className="p-4">
          <div className="h-64 w-full">
            <ResponsiveContainer width="99%" height={256}>
              <BarChart
                data={categoryYtdData}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={180}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip formatter={(v, _name, props) => [`${v}%`, `YTD (target: ${props.payload?.target ?? 98}%)`]} />
                <ReferenceLine x={98} stroke="#16a34a" strokeDasharray="4 4" />
                <Bar dataKey="ytd" name="YTD %" radius={[0, 3, 3, 0]}>
                  {categoryYtdData.map((entry) => (
                    <Cell key={entry.name} fill={getPctColor(entry.ytd, `${entry.target}%`)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
