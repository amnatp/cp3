import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { fmtNum } from "@/lib/fmt.js";

export default function DashboardCo2EmissionChart({ data = [] }) {
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">CO2 Emissions in the Last 12 Months</div>
          <div className="text-xs text-slate-500">Rolling 12-month trend · Source: Co2_emission_by_job</div>
        </div>
        <div className="text-xs text-slate-500">kg CO2e</div>
      </div>

      <div className="h-64 min-h-[240px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={1}>
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="#d7dee8" strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => fmtNum(value, 3)}
              labelStyle={{ fontSize: 12 }}
              contentStyle={{ fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="emission"
              name="CO2 Emission"
              stroke="#0b78bd"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
