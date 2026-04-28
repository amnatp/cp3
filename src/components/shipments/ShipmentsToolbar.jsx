import React from "react";
import { STATUS_OPTIONS } from "./shipmentsData";

export default function ShipmentsToolbar({ query, setQuery, status, setStatus }) {
  return (
    <div className="mt-4 rounded-2xl border bg-white p-4">
      <div className="grid gap-3 lg:grid-cols-12">
        <div className="lg:col-span-9">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400">🔎</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search: HAWB/MAWB, B/L, Booking, PO, Container, Reference..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>Status: {s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Delivered</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-500" /> In Transit</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Customs</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Delayed</span>
        </div>
        <button
          onClick={() => { setQuery(""); setStatus("All"); }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
