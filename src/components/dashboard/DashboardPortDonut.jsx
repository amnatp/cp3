import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Panel from "../ui/Panel";

const PALETTE = [
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#f97316", // orange
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#22c55e", // green
  "#0ea5e9", // sky
  "#eab308", // yellow
];

function getColor(index) {
  return PALETTE[index % PALETTE.length];
}

export default function DashboardPortDonut({ title, data }) {
  if (!data || data.length === 0) {
    return (
      <Panel title={title}>
        <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
          No data
        </div>
      </Panel>
    );
  }

  return (
    <Panel title={title}>
      <div className="h-44 w-full">
        <ResponsiveContainer width="99%" height={176}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
            >
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={getColor(i)} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 space-y-1 text-xs text-slate-600 max-h-32 overflow-y-auto">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: getColor(i) }}
            />
            <span className="flex-1 truncate font-medium text-slate-700">{d.name}</span>
            <span className="font-bold text-slate-800">{d.value}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
