import React from "react";
import Panel from "../ui/Panel";

const STATUS_DOT = {
  "In Transit": "bg-blue-500",
  "In Customs": "bg-amber-500",
  "Delayed":    "bg-red-500",
  "Delivered":  "bg-emerald-500",
};

export default function DashboardRecent({ recent }) {
  return (
    <Panel title="Recent shipments">
      <div className="divide-y">
        {recent.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">{r.id}</div>
              <div className="text-xs text-slate-500">{r.route}</div>
            </div>
            <div className="text-right text-xs text-slate-600">
              <div className="flex items-center justify-end gap-1.5">
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[r.status] ?? "bg-slate-400"}`} />
                <span className="font-semibold text-slate-900">{r.status}</span>
              </div>
              <div className="mt-0.5">ETA: {r.eta}</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
