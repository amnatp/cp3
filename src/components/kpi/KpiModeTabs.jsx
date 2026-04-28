import React from "react";
import { MODE_TABS } from "./kpiData";
import { Button } from "@/components/ui/button";

export default function KpiModeTabs({ mode, setMode }) {
  return (
    <div className="inline-flex gap-1 rounded-xl border bg-muted p-1">
      {MODE_TABS.map((t) => (
        <Button
          key={t.key}
          type="button"
          size="sm"
          variant={mode === t.key ? "default" : "ghost"}
          className={mode === t.key ? "shadow-sm" : "text-muted-foreground hover:text-foreground"}
          onClick={() => setMode(t.key)}
        >
          {t.label}
        </Button>
      ))}
    </div>
  );
}
