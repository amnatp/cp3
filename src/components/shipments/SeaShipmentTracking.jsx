import React, { useEffect, useState } from "react";
import {
  Anchor,
  Ship,
  MapPin,
  Package,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthFetch } from "@/lib/useAuthFetch";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

// Derive milestones directly from the API route dates
function buildMilestones(data) {
  if (!data) return [];

  return [
    { key: "ATD",      label: "Departed",  icon: Ship,    date: data.atd ?? null },
    { key: "ATA",      label: "Arrived",   icon: Anchor,  date: data.ata ?? null },
    { key: "GATE_OUT", label: "Gate Out",  icon: MapPin,  date: data.gateOutDate ?? null },
    { key: "DELIVERY", label: "Delivered", icon: Package, date: data.deliveredDate ?? null },
  ];
}

// ── Milestone dot ─────────────────────────────────────────────────────────────

function Milestone({ label, date, done, icon: Icon, hasLeft, leftDone, hasRight, rightDone }) {
  return (
    <div className="relative flex flex-col items-center flex-1" style={{ minWidth: 90 }}>
      {/* Left arm */}
      {hasLeft && (
        <div
          className={cn("absolute top-5 -translate-y-1/2 left-0 h-0.5 transition-colors duration-500",
            leftDone ? "bg-wice-red" : "bg-gray-200")}
          style={{ right: "calc(50% + 1.25rem)" }}
        />
      )}
      {/* Right arm */}
      {hasRight && (
        <div
          className={cn("absolute top-5 -translate-y-1/2 right-0 h-0.5 transition-colors duration-500",
            rightDone ? "bg-wice-red" : "bg-gray-200")}
          style={{ left: "calc(50% + 1.25rem)" }}
        />
      )}
      <div
        className={cn(
          "relative z-10 rounded-full border-2 flex items-center justify-center h-10 w-10 shadow-sm shrink-0 transition-colors",
          done
            ? "bg-wice-red/10 border-wice-red text-wice-red"
            : "bg-gray-50 border-gray-300 text-gray-400"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 text-center px-1">
        <p className={cn("text-[11px] font-semibold leading-tight", done ? "text-wice-red" : "text-muted-foreground")}>
          {label}
        </p>
        {date && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">{fmtDate(date)}</p>
        )}
      </div>
    </div>
  );
}

// ── Events table ──────────────────────────────────────────────────────────────

function EventsTable({ events }) {
  if (!events || events.length === 0) return null;
  const sorted = [...events].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });
  return (
    <div className="mt-3 overflow-x-auto rounded-md border border-border/50">
      <table className="min-w-full text-xs">
        <thead className="bg-muted/40">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Date</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Event</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Location</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Vessel / Voyage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {sorted.map((ev, i) => (
            <tr key={i} className="hover:bg-muted/20">
              <td className="px-3 py-1.5 whitespace-nowrap">{fmtDate(ev.date) ?? "-"}</td>
              <td className="px-3 py-1.5">{ev.description ?? ev.eventType ?? "-"}</td>
              <td className="px-3 py-1.5">{ev.location ?? "-"}</td>
              <td className="px-3 py-1.5">
                {[ev.vessel, ev.voyage].filter(Boolean).join(" / ") || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SeaShipmentTracking({ blNo, bookingNo, sealine }) {
  const authFetch = useAuthFetch();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [expanded, setExpanded] = useState(false);

  const trackingNumber = blNo || bookingNo;
  const shipmentType   = blNo ? "BL" : "BK";

  useEffect(() => {
    if (!trackingNumber) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ shipmentNumber: trackingNumber, shipmentType });
    if (sealine) params.append("sealine", sealine);

    authFetch(`/api/shipments/sea-track?${params}`)
      .then((r) => {
        if (!r.ok) throw Object.assign(new Error("fetch"), { status: r.status });
        return r.json();
      })
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message ?? "Failed to load tracking data"); setLoading(false); } });

    return () => { cancelled = true; };
  }, [trackingNumber, shipmentType, sealine, authFetch]);

  if (!trackingNumber) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading realtime tracking…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>Tracking unavailable: {error}</span>
      </div>
    );
  }

  if (!data) return null;

  const milestones = buildMilestones(data);
  const currentIdx = milestones.reduce((max, m, i) => (m.date != null ? i : max), -1);

  // Collect all events from containers
  const allEvents = (data.containers ?? []).flatMap((c) => c.events ?? []);

  return (
    <div>
      {/* Status badge + vessel info */}
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {data.status && (
          <span className="inline-flex items-center gap-1 rounded-full bg-wice-blue/10 px-2.5 py-0.5 font-semibold text-wice-blue ring-1 ring-wice-blue/30">
            {data.status}
          </span>
        )}
        {data.vessel?.name && (
          <span className="flex items-center gap-1">
            <Ship className="h-3.5 w-3.5" />
            {data.vessel.name}
            {data.vessel.voyage ? ` / ${data.vessel.voyage}` : ""}
          </span>
        )}
        {data.eta && (
          <span>ETA: {fmtDate(data.eta)}</span>
        )}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="ml-auto flex items-center gap-1 rounded text-[11px] text-muted-foreground/70 hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          {expanded ? "Hide events" : "Show events"}
        </button>
      </div>

      {/* Milestone timeline */}
      <div className="flex items-start overflow-x-auto pb-2">
        {milestones.map((m, i) => (
          <Milestone
            key={m.key}
            label={m.label}
            date={m.date}
            done={i <= currentIdx}
            icon={m.icon}
            hasLeft={i > 0}
            leftDone={i <= currentIdx}
            hasRight={i < milestones.length - 1}
            rightDone={i < currentIdx}
          />
        ))}
      </div>

      {/* Container list */}
      {(data.containers ?? []).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {data.containers.map((c) => (
            <span
              key={c.containerNumber}
              className="inline-flex items-center rounded-full border border-border/70 bg-white px-2 py-0.5 text-xs font-medium text-foreground"
            >
              {c.containerNumber}
              {c.isoCode ? <span className="ml-1 text-muted-foreground">({c.isoCode})</span> : null}
            </span>
          ))}
        </div>
      )}

      {/* Events table */}
      {expanded && <EventsTable events={allEvents} />}
    </div>
  );
}
