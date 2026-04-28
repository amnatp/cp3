import React from "react";
import { formatDate, statusBadge, serviceIcon } from "./shipmentsData";

export default function ShipmentsCards({ rows }) {
  return (
    <div className="lg:hidden mt-4 space-y-3">
      {rows.map((s) => (
        <div key={s.id} className="rounded-2xl border bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">{s.id}</div>
              <div className="mt-1 text-xs text-slate-500 line-clamp-1">
                {(s.refs || []).join(" • ")}
              </div>
            </div>
            <span className={statusBadge(s.status)}>{s.status}</span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {serviceIcon(s.service)}
              <div className="text-xs text-slate-600">
                <div className="font-semibold text-slate-800">
                  {s.service === "CROSS_BORDER" ? "Cross-border" : s.service}
                </div>
                {s.importOrExport && <div>{s.importOrExport}</div>}
                {s.customsStatus && s.customsStatus !== "N/A" && (
                  <div>Customs: {s.customsStatus}</div>
                )}
              </div>
            </div>
            <div className="text-right text-xs text-slate-600">
              <div className="font-semibold text-slate-800">ETA</div>
              <div>{formatDate(s.eta)}</div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700">
            <div className="rounded-xl bg-slate-50 p-2">
              <div className="text-[11px] text-slate-500">Origin</div>
              <div className="font-medium">{s.origin}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-2">
              <div className="text-[11px] text-slate-500">Destination</div>
              <div className="font-medium">{s.destination}</div>
            </div>
          </div>

          <button
            onClick={() => alert(`Open shipment detail: ${s.id}`)}
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            View details
          </button>
        </div>
      ))}

      {rows.length === 0 && (
        <div className="rounded-2xl border bg-white p-6 text-center text-sm text-slate-500">
          No shipments match your filters.
        </div>
      )}
    </div>
  );
}
