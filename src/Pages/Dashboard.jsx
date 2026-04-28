import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/spinner";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { apiErrorMessage } from "@/lib/utils";
import { asDate } from "@/lib/fmt.js";
import DashboardKpiCards from "../components/dashboard/DashboardKpiCards";
import DashboardExceptions from "../components/dashboard/DashboardExceptions";
import AirDashboardTab from "../components/dashboard/AirDashboardTab";
import SeaDashboardTab from "../components/dashboard/SeaDashboardTab";
import CrossborderDashboardTab from "../components/dashboard/CrossborderDashboardTab";
import TransportDashboardTab from "../components/dashboard/TransportDashboardTab";
import CustomsDashboardTab from "../components/dashboard/CustomsDashboardTab";

const PERIODS = [
  { key: "wtd", label: "WTD" },
  { key: "mtd", label: "MTD" },
  { key: "ytd", label: "YTD" },
  { key: "all", label: "All" },
];

const DIRECTIONS = [
  { key: "all",    label: "All" },
  { key: "import", label: "Import" },
  { key: "export", label: "Export" },
];

// ── Shipment Insight helpers ──────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function sumByKey(list, keyFn, valueFn) {
  const m = new Map();
  for (const x of list) {
    const k = (keyFn(x) ?? "").toString().trim();
    if (!k) continue;
    const v = Number(valueFn(x)) || 0;
    m.set(k, (m.get(k) || 0) + v);
  }
  return m;
}

function topNWithOther(map, n = 6) {
  const rows = Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
  if (rows.length <= n) return rows;
  const head = rows.slice(0, n);
  const other = rows.slice(n).reduce((s, r) => s + r.value, 0);
  return other > 0 ? [...head, { name: "Other", value: other }] : head;
}

function emptyMonthly() {
  return MONTHS.map((m) => ({
    month: m,
    importTrips: 0, exportTrips: 0,
    importPcs: 0,   exportPcs: 0,
  }));
}

function buildMonthly(list, isImportFn, isExportFn, pcsKey = null) {
  const base = emptyMonthly();
  for (const s of list) {
    const d = asDate(s.etd ?? s.eta ?? s.createdDateTime);
    if (!d) continue;
    const idx = d.getMonth();
    const pcs = pcsKey ? (s[pcsKey] ?? 0) : 0;
    if (isImportFn(s)) {
      base[idx].importTrips += 1;
      base[idx].importPcs  += pcs;
    }
    if (isExportFn(s)) {
      base[idx].exportTrips += 1;
      base[idx].exportPcs  += pcs;
    }
  }
  return base;
}

export default function Dashboard() {
  const authFetch = useAuthFetch();
  const [period, setPeriod] = useState("mtd");
  const [direction, setDirection] = useState("all");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Shipment Insight state ─────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("sea");
  const [allShipments, setAllShipments] = useState([]);
  const [insightLoading, setInsightLoading] = useState(true);
  const [insightError, setInsightError] = useState(null);

  const loadInsightShipments = useCallback(async () => {
    try {
      setInsightLoading(true);
      setInsightError(null);
      const params = new URLSearchParams({
        pageSize: "5000",
        period,
        direction,
      });
      const res = await authFetch(`/api/shipments?${params}`);
      if (!res.ok) throw Object.assign(new Error("fetch"), { status: res.status });
      const json = await res.json();
      setAllShipments(Array.isArray(json) ? json : (json?.items ?? []));
    } catch (e) {
      setInsightError(apiErrorMessage(e));
    } finally {
      setInsightLoading(false);
    }
  }, [authFetch, period, direction]);

  useEffect(() => { loadInsightShipments(); }, [loadInsightShipments]);

  // ── Insight: derive per-service data from the same server-side criteria ──
  const insightShipments = allShipments;

  // Air
  const airShipments = useMemo(() =>
    insightShipments.filter((s) => s.service === "AIR"), [insightShipments]);

  const airTotals = useMemo(() => {
    let booked = 0, pickup = 0, departed = 0, arrival = 0, releasedDo = 0, delivery = 0;
    for (const s of airShipments) {
      if (s.deliveredDate)   delivery   += 1;
      else if (s.releaseDoDate) releasedDo += 1;
      else if (s.ata)        arrival    += 1;
      else if (s.atd)        departed   += 1;
      else if (s.pickupDate) pickup     += 1;
      else                   booked     += 1;
    }
    return { booked, pickup, departed, arrival, releasedDo, delivery };
  }, [airShipments]);

  const airMonthly = useMemo(() =>
    buildMonthly(
      airShipments,
      (s) => s.importOrExport === "Import",
      (s) => s.importOrExport === "Export",
    ), [airShipments]);

  const airImport = useMemo(() => airShipments.filter((s) => s.importOrExport === "Import"), [airShipments]);
  const airExport = useMemo(() => airShipments.filter((s) => s.importOrExport === "Export"), [airShipments]);

  const airDonutCards = useMemo(() => [
    { title: "Import Shipments by Origin",      data: topNWithOther(sumByKey(airImport, (s) => s.origin, () => 1)), valueDp: 0 },
    { title: "Import Shipments by Destination", data: topNWithOther(sumByKey(airImport, (s) => s.destination, () => 1)), valueDp: 0 },
    { title: "Export Shipments by Origin",      data: topNWithOther(sumByKey(airExport, (s) => s.origin, () => 1)), valueDp: 0 },
    { title: "Export Shipments by Destination", data: topNWithOther(sumByKey(airExport, (s) => s.destination, () => 1)), valueDp: 0 },
  ], [airImport, airExport]);

  // Sea
  const seaShipments = useMemo(() =>
    insightShipments.filter((s) => s.service === "SEA"), [insightShipments]);

  const seaTotals = useMemo(() => {
    const now = new Date();
    let empty = 0, depart = 0, inTransit = 0, arrival = 0, delivery = 0;
    for (const s of seaShipments) {
      const atd = asDate(s.atd);
      const ata = asDate(s.ata);
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
    const totalContainers = seaShipments.reduce((sum, s) => sum + (s.totalContainers ?? 0), 0);
    return { empty, depart, inTransit, arrival, delivery, totalContainers, totalShipments: seaShipments.length };
  }, [seaShipments]);

  const seaMonthly = useMemo(() =>
    buildMonthly(
      seaShipments,
      (s) => s.importOrExport === "Import",
      (s) => s.importOrExport === "Export",
      "totalContainers",
    ), [seaShipments]);

  const seaImport = useMemo(() => seaShipments.filter((s) => s.importOrExport === "Import"), [seaShipments]);
  const seaExport = useMemo(() => seaShipments.filter((s) => s.importOrExport === "Export"), [seaShipments]);

  const seaDonutCards = useMemo(() => [
    { title: "Import Containers by Origin",      data: topNWithOther(sumByKey(seaImport, (s) => s.origin, (s) => s.totalContainers ?? 1)), valueDp: 0 },
    { title: "Import Containers by Destination", data: topNWithOther(sumByKey(seaImport, (s) => s.destination, (s) => s.totalContainers ?? 1)), valueDp: 0 },
    { title: "Export Containers by Destination", data: topNWithOther(sumByKey(seaExport, (s) => s.destination, (s) => s.totalContainers ?? 1)), valueDp: 0 },
    { title: "Export Containers by Origin",      data: topNWithOther(sumByKey(seaExport, (s) => s.origin, (s) => s.totalContainers ?? 1)), valueDp: 0 },
  ], [seaImport, seaExport]);

  // Crossborder
  const crossShipments = useMemo(() =>
    insightShipments.filter((s) => s.service === "CROSS_BORDER"), [insightShipments]);

  const crossTotals = useMemo(() => {
    const imp = crossShipments.filter((s) => s.importOrExport === "Import").length;
    const exp = crossShipments.filter((s) => s.importOrExport === "Export").length;
    return { totalShipments: crossShipments.length, importCount: imp, exportCount: exp };
  }, [crossShipments]);

  const crossMonthly = useMemo(() =>
    buildMonthly(
      crossShipments,
      (s) => s.importOrExport === "Import",
      (s) => s.importOrExport === "Export",
    ), [crossShipments]);

  const crossImport = useMemo(() => crossShipments.filter((s) => s.importOrExport === "Import"), [crossShipments]);
  const crossExport = useMemo(() => crossShipments.filter((s) => s.importOrExport === "Export"), [crossShipments]);

  const crossDonutCards = useMemo(() => [
    { title: "Import Shipments by Origin",      data: topNWithOther(sumByKey(crossImport, (s) => s.origin, () => 1)), valueDp: 0 },
    { title: "Import Shipments by Destination", data: topNWithOther(sumByKey(crossImport, (s) => s.destination, () => 1)), valueDp: 0 },
    { title: "Export Shipments by Origin",      data: topNWithOther(sumByKey(crossExport, (s) => s.origin, () => 1)), valueDp: 0 },
    { title: "Export Shipments by Destination", data: topNWithOther(sumByKey(crossExport, (s) => s.destination, () => 1)), valueDp: 0 },
  ], [crossImport, crossExport]);

  // Transport (INLAND)
  const transportShipments = useMemo(() =>
    insightShipments.filter((s) => s.service === "INLAND"), [insightShipments]);

  const transportTotals = useMemo(() => {
    const imp = transportShipments.filter((s) => s.importOrExport === "Import").length;
    const exp = transportShipments.filter((s) => s.importOrExport === "Export").length;
    return { totalShipments: transportShipments.length, importCount: imp, exportCount: exp };
  }, [transportShipments]);

  const transportMonthly = useMemo(() =>
    buildMonthly(
      transportShipments,
      (s) => s.importOrExport === "Import",
      (s) => s.importOrExport === "Export",
    ), [transportShipments]);

  const transportImport = useMemo(() => transportShipments.filter((s) => s.importOrExport === "Import"), [transportShipments]);
  const transportExport = useMemo(() => transportShipments.filter((s) => s.importOrExport === "Export"), [transportShipments]);

  const transportDonutCards = useMemo(() => [
    { title: "Import Shipments by Origin",      data: topNWithOther(sumByKey(transportImport, (s) => s.origin, () => 1)), valueDp: 0 },
    { title: "Import Shipments by Destination", data: topNWithOther(sumByKey(transportImport, (s) => s.destination, () => 1)), valueDp: 0 },
    { title: "Export Shipments by Origin",      data: topNWithOther(sumByKey(transportExport, (s) => s.origin, () => 1)), valueDp: 0 },
    { title: "Export Shipments by Destination", data: topNWithOther(sumByKey(transportExport, (s) => s.destination, () => 1)), valueDp: 0 },
  ], [transportImport, transportExport]);

  // Customs
  const customsShipments = useMemo(() =>
    insightShipments.filter((s) => s.service === "CUSTOMS"), [insightShipments]);

  const customsTotals = useMemo(() => {
    const imp = customsShipments.filter((s) => s.importOrExport === "Import").length;
    const exp = customsShipments.filter((s) => s.importOrExport === "Export").length;
    return { totalShipments: customsShipments.length, importCount: imp, exportCount: exp };
  }, [customsShipments]);

  const customsMonthly = useMemo(() =>
    buildMonthly(
      customsShipments,
      (s) => s.importOrExport === "Import",
      (s) => s.importOrExport === "Export",
    ), [customsShipments]);

  const customsImport = useMemo(() => customsShipments.filter((s) => s.importOrExport === "Import"), [customsShipments]);
  const customsExport = useMemo(() => customsShipments.filter((s) => s.importOrExport === "Export"), [customsShipments]);

  const customsDonutCards = useMemo(() => [
    { title: "Import Shipments by Origin",      data: topNWithOther(sumByKey(customsImport, (s) => s.origin, () => 1)), valueDp: 0 },
    { title: "Import Shipments by Destination", data: topNWithOther(sumByKey(customsImport, (s) => s.destination, () => 1)), valueDp: 0 },
    { title: "Export Shipments by Origin",      data: topNWithOther(sumByKey(customsExport, (s) => s.origin, () => 1)), valueDp: 0 },
    { title: "Export Shipments by Destination", data: topNWithOther(sumByKey(customsExport, (s) => s.destination, () => 1)), valueDp: 0 },
  ], [customsImport, customsExport]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    authFetch(`/api/dashboard?period=${period}&direction=${direction}`)
      .then((r) => {
        if (!r.ok) throw Object.assign(new Error("fetch"), { status: r.status });
        return r.json();
      })
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(apiErrorMessage(e)); setLoading(false); } });
    return () => { cancelled = true; };
  }, [authFetch, period, direction]);

  const kpis = data?.kpis ?? { booked: 0, arriving: 0, clearanceDays: null, inTransit: 0, total: 0, delivered: 0, air: 0, sea: 0, customs: 0, inland: 0, crossBorder: 0 };
  const exceptions = data?.exceptions ?? [];

  const periodLabel = PERIODS.find((p) => p.key === period)?.label ?? "";

  if (loading) return <PageLoader message="Loading dashboard�" />;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-black bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #2A388F 0%, #ED1C24 100%)" }}
          >
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of shipment performance, current workload, and exceptions.
          </p>
          {error && (
            <p className="mt-1 text-sm text-destructive">{error}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Direction toggle */}
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
            {DIRECTIONS.map((d) => (
              <button
                key={d.key}
                onClick={() => setDirection(d.key)}
                className={
                  direction === d.key
                    ? "rounded-md px-3 py-1.5 text-xs font-bold bg-wice-red text-white shadow-sm transition-colors"
                    : "rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                }
              >
                {d.label}
              </button>
            ))}
          </div>
          {/* Period toggle */}
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={
                  period === p.key
                    ? "rounded-md px-3 py-1.5 text-xs font-bold bg-wice-blue text-white shadow-sm transition-colors"
                    : "rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                }
              >
                {p.label}
              </button>
            ))}
          </div>
          <Button asChild>
            <Link to="/shipments">View Shipments</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/reports-kpi">View KPIs</Link>
          </Button>
        </div>
      </div>

      <DashboardKpiCards kpis={kpis} periodLabel={periodLabel} />

      {/* ── Shipment Insight ─────────────────────────────────────────────── */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 h-1.5 w-full rounded-full bg-gradient-to-r from-[#0b78bd] via-[#c35b2e] to-[#69a82f]" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xl font-semibold text-slate-900">Shipment Insight</div>
            <div className="mt-1 text-sm text-slate-500">Using live API data</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "sea",         label: "Sea",         color: "#c35b2e" },
              { key: "air",         label: "Air",         color: "#0b78bd" },
              { key: "crossborder", label: "Crossborder", color: "#16a34a" },
              { key: "transport",   label: "Transport",   color: "#8b5cf6" },
              { key: "customs",     label: "Customs",     color: "#14b8a6" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={activeTab === tab.key ? { backgroundColor: tab.color, borderColor: tab.color } : {}}
                className={[
                  "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                  activeTab === tab.key
                    ? "text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 space-y-4">
        {activeTab === "air" && (
          <AirDashboardTab
            loading={insightLoading}
            error={insightError}
            onRetry={loadInsightShipments}
            totals={airTotals}
            monthly={airMonthly}
            donutCards={airDonutCards}
          />
        )}
        {activeTab === "sea" && (
          <SeaDashboardTab
            loading={insightLoading}
            error={insightError}
            onRetry={loadInsightShipments}
            totals={seaTotals}
            monthly={seaMonthly}
            donutCards={seaDonutCards}
          />
        )}
        {activeTab === "crossborder" && (
          <CrossborderDashboardTab
            loading={insightLoading}
            error={insightError}
            onRetry={loadInsightShipments}
            totals={crossTotals}
            monthly={crossMonthly}
            donutCards={crossDonutCards}
          />
        )}
        {activeTab === "transport" && (
          <TransportDashboardTab
            loading={insightLoading}
            error={insightError}
            onRetry={loadInsightShipments}
            totals={transportTotals}
            monthly={transportMonthly}
            donutCards={transportDonutCards}
          />
        )}
        {activeTab === "customs" && (
          <CustomsDashboardTab
            loading={insightLoading}
            error={insightError}
            onRetry={loadInsightShipments}
            totals={customsTotals}
            monthly={customsMonthly}
            donutCards={customsDonutCards}
          />
        )}
      </div>

      <div className="mt-4">
        <DashboardExceptions exceptions={exceptions} />
      </div>

    </div>
  );
}

