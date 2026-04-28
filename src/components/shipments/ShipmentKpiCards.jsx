import React, { useMemo } from "react";
import { fmtNum } from "@/lib/fmt.js";

function Kpi({ label, value, tone = "primary" }) {
  let toneClass;
  if (tone === "accent")       toneClass = "border-t-[#c35b2e]";
  else if (tone === "success") toneClass = "border-t-[#69a82f]";
  else if (tone === "warning") toneClass = "border-t-[#f59e0b]";
  else if (tone === "muted")   toneClass = "border-t-[#64748b]";
  else                          toneClass = "border-t-[#0b78bd]";

  return (
    <div className={`rounded-xl border border-slate-200 border-t-4 bg-white p-4 shadow-sm ${toneClass}`}>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value}</div>
    </div>
  );
}

function airTotals(rows) {
  let booked = 0, pickup = 0, departed = 0, arrival = 0, releasedDo = 0, delivery = 0;
  for (const s of rows) {
    if (s.deliveredDate)      delivery   += 1;
    else if (s.releaseDoDate) releasedDo += 1;
    else if (s.ata)           arrival    += 1;
    else if (s.atd)           departed   += 1;
    else if (s.pickupDate)    pickup     += 1;
    else                      booked     += 1;
  }
  return { booked, pickup, departed, arrival, releasedDo, delivery };
}

function seaTotals(rows) {
  const now = new Date();
  let empty = 0, depart = 0, inTransit = 0, arrival = 0, delivery = 0;
  for (const s of rows) {
    const atd = s.atd ? new Date(s.atd) : null;
    const ata = s.ata ? new Date(s.ata) : null;
    if (ata) {
      const days = (now - ata) / 86400000;
      if (days > 5) delivery += 1; else arrival += 1;
    } else if (atd) {
      const days = (now - atd) / 86400000;
      if (days > 3) inTransit += 1; else depart += 1;
    } else {
      empty += 1;
    }
  }
  return { empty, depart, inTransit, arrival, delivery };
}

function directionTotals(rows) {
  let imp = 0, exp = 0;
  for (const s of rows) {
    if (s.importOrExport === "Import") imp += 1;
    else if (s.importOrExport === "Export") exp += 1;
  }
  return { total: rows.length, importCount: imp, exportCount: exp };
}

export default function ShipmentKpiCards({ tab, rows }) {
  const data = rows || [];

  const cards = useMemo(() => {
    if (tab === "AIR") {
      const t = airTotals(data);
      return [
        { label: "Booked",      value: t.booked,     tone: "muted" },
        { label: "Pickup",      value: t.pickup,     tone: "primary" },
        { label: "Departed",    value: t.departed,   tone: "warning" },
        { label: "Arrival",     value: t.arrival,    tone: "accent" },
        { label: "Released DO", value: t.releasedDo, tone: "primary" },
        { label: "Delivery",    value: t.delivery,   tone: "success" },
      ];
    }
    if (tab === "SEA") {
      const t = seaTotals(data);
      return [
        { label: "Empty",      value: t.empty,     tone: "muted" },
        { label: "Depart",     value: t.depart,    tone: "primary" },
        { label: "In-Transit", value: t.inTransit, tone: "warning" },
        { label: "Arrival",    value: t.arrival,   tone: "accent" },
        { label: "Delivery",   value: t.delivery,  tone: "success" },
      ];
    }
    if (tab === "CROSS_BORDER" || tab === "INLAND" || tab === "CUSTOMS") {
      const t = directionTotals(data);
      return [
        { label: "Total Shipments", value: t.total,       tone: "primary" },
        { label: "Import",          value: t.importCount, tone: "accent" },
        { label: "Export",          value: t.exportCount, tone: "success" },
      ];
    }
    return [];
  }, [tab, data]);

  if (!cards.length) return null;

  let cols;
  if (cards.length >= 6)      cols = "md:grid-cols-6";
  else if (cards.length === 5) cols = "md:grid-cols-5";
  else if (cards.length === 4) cols = "md:grid-cols-4";
  else                          cols = "md:grid-cols-3";

  return (
    <div className={`grid grid-cols-2 gap-3 ${cols}`}>
      {cards.map((c) => (
        <Kpi key={c.label} label={c.label} value={fmtNum(c.value)} tone={c.tone} />
      ))}
    </div>
  );
}
