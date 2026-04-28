import React, { useEffect, useState } from "react";
import {
  Truck,
  MapPin,
  Package,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthFetch } from "@/lib/useAuthFetch";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(val) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

const STAGE_ORDER = ["Pending", "Confirm Order", "In Transit", "Delivered", "POD", "Billed"];

// ── Milestone dot ─────────────────────────────────────────────────────────────

function Milestone({ label, date, done, icon: Icon, hasLeft, leftDone, hasRight, rightDone }) {
  return (
    <div className="relative flex flex-col items-center flex-1" style={{ minWidth: 90 }}>
      {/* Left arm: from left edge of column to left outer edge of circle */}
      {hasLeft && (
        <div
          className={cn("absolute top-5 -translate-y-1/2 left-0 h-0.5 transition-colors duration-500",
            leftDone ? "bg-wice-red" : "bg-gray-200")}
          style={{ right: "calc(50% + 1.25rem)" }}
        />
      )}
      {/* Right arm: from right outer edge of circle to right edge of column */}
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

// ── Trip detail rows ──────────────────────────────────────────────────────────

function TripRow({ trip }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0 text-xs">
      <Truck className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-x-4 gap-y-0.5">
          {trip.truckNumber && (
            <span className="font-medium">{trip.truckNumber}</span>
          )}
          {trip.country && (
            <span className="text-muted-foreground">{trip.country}</span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-muted-foreground">
          {trip.pickUpArrival && <span>Pick-up: {fmtDate(trip.pickUpArrival)}</span>}
          {trip.pickUpDepart  && <span>Depart: {fmtDate(trip.pickUpDepart)}</span>}
          {trip.sentToArrival && <span>Delivered: {fmtDate(trip.sentToArrival)}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Border / LOLO rows ────────────────────────────────────────────────────────

function BorderRow({ item }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0 text-xs">
      <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {item.type && (
            <span className="inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 ring-1 ring-sky-200">
              {item.type}
            </span>
          )}
          {item.description && <span className="font-medium">{item.description}</span>}
        </div>
        <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-muted-foreground">
          {item.arrive && <span>Arrive: {fmtDate(item.arrive)}</span>}
          {item.depart && <span>Depart: {fmtDate(item.depart)}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CrossBorderTracking({ bookingCode, onStageChange }) {
  const authFetch = useAuthFetch();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!bookingCode) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ bookingCode });
    authFetch(`/api/shipments/cross-track?${params}`)
      .then((r) => {
        if (!r.ok) throw Object.assign(new Error("fetch"), { status: r.status });
        return r.json();
      })
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
          if (d?.stage) onStageChange?.(bookingCode, d.stage);
        }
      })
      .catch((e) => { if (!cancelled) { setError(e.message ?? "Failed to load tracking"); setLoading(false); } });

    return () => { cancelled = true; };
  }, [bookingCode, authFetch]);

  if (!bookingCode) return null;

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

  // Build milestones from stage order + date fields
  const milestones = [
    { key: "Confirm Order", label: "Confirmed",  icon: CheckCircle2, date: data.confirmDate   },
    { key: "In Transit",    label: "In Transit", icon: Truck,        date: data.inTransitDate },
    { key: "Delivered",     label: "Delivered",  icon: Package,      date: data.deliveryDate  },
    { key: "POD",           label: "POD",        icon: MapPin,       date: data.podDate       },
  ];

  const currentStageIdx = STAGE_ORDER.indexOf(data.stage ?? "");
  const currentIdx = milestones.reduce((max, m, i) => {
    const milestoneStageIdx = STAGE_ORDER.indexOf(m.key);
    return milestoneStageIdx !== -1 && milestoneStageIdx <= currentStageIdx ? i : max;
  }, -1);

  const hasBorderLolos = (data.borderLolos ?? []).length > 0;
  const hasTripDetails = (data.tripDetails ?? []).length > 0;

  return (
    <div>
      {/* Status + route header */}
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {data.stage && (
          <span className="inline-flex items-center gap-1 rounded-full bg-wice-blue/10 px-2.5 py-0.5 font-semibold text-wice-blue ring-1 ring-wice-blue/30">
            {data.stage}
          </span>
        )}
        {data.container && (
          <span className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5" />
            {data.container}
          </span>
        )}
        {data.from && data.to && (
          <span>{data.from} → {data.to}</span>
        )}
        {(hasBorderLolos || hasTripDetails) && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="ml-auto flex items-center gap-1 rounded text-[11px] text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? "Hide details" : "Show details"}
          </button>
        )}
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

      {/* Expandable details */}
      {expanded && (
        <div className="mt-3 space-y-3">
          {hasBorderLolos && (
            <div className="rounded-md border border-border/50 px-3 py-2">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Borders / LOLO
              </p>
              {data.borderLolos.map((item, i) => (
                <BorderRow key={i} item={item} />
              ))}
            </div>
          )}
          {hasTripDetails && (
            <div className="rounded-md border border-border/50 px-3 py-2">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Trip Details
              </p>
              {data.tripDetails.map((trip, i) => (
                <TripRow key={i} trip={trip} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
