import React, { useEffect, useMemo, useState } from "react";
import { matchesQuery } from "../components/shipments/shipmentsData";
import ShipmentsTabs from "../components/shipments/ShipmentsTabs";
import ShipmentsToolbar from "../components/shipments/ShipmentsToolbar";
import ShipmentsTable from "../components/shipments/ShipmentsTable";
import ShipmentsCards from "../components/shipments/ShipmentsCards";
import ShipmentKpiCards from "../components/shipments/ShipmentKpiCards";
import { Button } from "@/components/ui/button";
import { InlineLoader } from "@/components/ui/spinner";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { apiErrorMessage } from "@/lib/utils";

const PERIODS = [
  { key: "WTD", label: "WTD" },
  { key: "MTD", label: "MTD" },
  { key: "YTD", label: "YTD" },
  { key: "ALL", label: "All" },
];

export default function Shipments() {
  const authFetch = useAuthFetch();
  const [tab, setTab] = useState("ALL");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [direction, setDirection] = useState("All");
  const [period, setPeriod] = useState("MTD");

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      pageSize: "5000",
      period: period.toLowerCase(),
      direction: direction.toLowerCase(),
    });
    if (tab !== "ALL") params.set("service", tab);

    setLoading(true);
    setError(null);
    authFetch(`/api/shipments?${params}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw Object.assign(new Error("fetch"), { status: res.status });
        return res.json();
      })
      .then((data) => setShipments(data))
      .catch((err) => {
        if (err.name !== "AbortError") setError(apiErrorMessage(err));
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [authFetch, period, direction, tab]);

  const filtered = useMemo(() => {
    return shipments
      .filter((s) => matchesQuery(s, query))
      .filter((s) => (status === "All" ? true : s.status === status));
  }, [shipments, query, status]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Shipments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search and filter your shipments across Air, Sea, Cross-border, Inland and Customs views.
          </p>
        </div>
        <Button className="hidden sm:inline-flex">
          Export
        </Button>
      </div>

      <div className="mt-4">
        <ShipmentsTabs value={tab} onChange={setTab} direction={direction} onDirectionChange={setDirection} />
      </div>

      <div className="mt-3 flex justify-end">
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={
                period === p.key
                  ? "rounded-md bg-wice-blue px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors"
                  : "rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {!loading && tab !== "ALL" && (
        <div className="mt-4">
          <ShipmentKpiCards tab={tab} rows={filtered} />
        </div>
      )}

      <ShipmentsToolbar
        query={query}
        setQuery={setQuery}
        status={status}
        setStatus={setStatus}
      />

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <div>
          {error && <span className="text-red-600">{error}</span>}
          {!loading && !error && (
            <>Showing <span className="font-semibold text-wice-blue">{filtered.length}</span> shipments</>
          )}
        </div>
        <Button className="sm:hidden">
          Export
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <InlineLoader message="Loading shipments…" />
        </div>
      ) : (
        <>
          <ShipmentsTable rows={filtered} />
          <ShipmentsCards rows={filtered} />
        </>
      )}
    </div>
  );
}
