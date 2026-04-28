import React from "react";
import { CURRENT_YEAR, MONTH_KEYS } from "./spendingData";
import { Button } from "@/components/ui/button";

export default function SpendingFilters({ year, setYear, monthKey, setMonthKey }) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {[CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <select
        value={monthKey}
        onChange={(e) => setMonthKey(e.target.value)}
        className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {MONTH_KEYS.map((m) => (
          <option key={m.key} value={m.key}>{m.label}</option>
        ))}
      </select>

      <Button>Export</Button>
    </div>
  );
}
