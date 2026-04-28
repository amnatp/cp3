import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Panel from "../ui/Panel";

const STATUS_COLORS = {
  "Booked":     "#22c55e",  // green
  "In Transit": "#3b82f6",  // blue
  "Arriving":   "#f59e0b",  // amber
  "Delivered":  "#6366f1",  // indigo
};

const DEFAULT_COLORS = ["#6366f1", "#ec4899", "#14b8a6", "#f97316"];

function getColor(name, index) {
  return STATUS_COLORS[name] ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

export default function DashboardStatusDonut({ donutData }) {
  const total = donutData.reduce((sum, d) => sum + d.value, 0);

  return (
      <Panel title="Shipments by stage">  
      <div className="relative h-56 w-full">
        <ResponsiveContainer width="99%" height={224}>
          <PieChart>
            <Pie
              data={donutData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={2}
            >
              {donutData.map((entry, i) => (
                <Cell key={entry.name} fill={getColor(entry.name, i)} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800">{total}</span>
          <span className="text-xs text-slate-500">Total</span>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
        {donutData.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: getColor(d.name, i) }}
            />
            <div>
              <div className="font-semibold text-slate-800">{d.value}</div>
              <div>{d.name}</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
