import React from "react";
import { SERVICE_TABS } from "./shipmentsData";
import { Button } from "@/components/ui/button";

const DIRECTIONS = [
  { key: "All",    label: "All" },
  { key: "Import", label: "Import" },
  { key: "Export", label: "Export" },
];

export default function ShipmentsTabs({ value, onChange, direction, onDirectionChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap gap-2">
        {SERVICE_TABS.map((t) => (
          <Button
            key={t.key}
            size="sm"
            variant={value === t.key ? "default" : "outline"}
            className={value !== t.key ? "text-wice-blue border-border hover:bg-accent" : ""}
            onClick={() => onChange(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </div>
      <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
        {DIRECTIONS.map((d) => (
          <button
            key={d.key}
            onClick={() => onDirectionChange(d.key)}
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
    </div>
  );
}
