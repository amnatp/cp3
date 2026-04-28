import React from "react";
import Card from "../ui/Card";

export default function DashboardKpiCards({ kpis, periodLabel }) {
  return (
    <>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card title="Total shipments"  value={kpis.total       ?? 0} sub={periodLabel} />
        <Card title="Sea"              value={kpis.sea         ?? 0} sub={periodLabel} />
        <Card title="Cross-border"     value={kpis.crossBorder ?? 0} sub={periodLabel} />
        <Card title="Customs"          value={kpis.customs     ?? 0} sub={periodLabel} />
        <Card title="Inland"           value={kpis.inland      ?? 0} sub={periodLabel} />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card title="Air"            value={kpis.air        ?? 0} sub={periodLabel} />
        <Card title="Booked"         value={kpis.booked     ?? 0} sub="ETD ≥ 3 days" tone="good" />
        <Card title="In transit now" value={kpis.inTransit  ?? 0} sub="All services" />
        <Card title="Arriving"       value={kpis.arriving   ?? 0} sub="ETA ≤ 3 days" tone="warn" />
        <Card title="Delivered"      value={kpis.delivered ?? 0}  sub={periodLabel} />
      </div>
    </>
  );
}
