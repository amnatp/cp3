import React from "react";
import { Link } from "react-router-dom";
import Panel from "../ui/Panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardExceptions({ exceptions }) {
  return (
    <Panel
      title="Alerts & Exceptions"
      right={
        <Button asChild variant="outline" size="sm">
          <Link to="/shipments">Open list</Link>
        </Button>
      }
    >
      <div className="space-y-2">
        {exceptions.map((e) => {
          const severityStyle =
            e.severity === "High"   ? "border-l-4 border-l-red-500 bg-red-50/60"
            : e.severity === "Medium" ? "border-l-4 border-l-amber-500 bg-amber-50/60"
            : "border-l-4 border-l-blue-400 bg-blue-50/40";
          return (
            <div
              key={e.id}
              className={`flex items-start justify-between gap-3 rounded-xl border p-3 ${severityStyle}`}
            >
              <div>
                <div className="text-sm font-semibold">{e.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Shipment: {e.id}</div>
              </div>
              <Badge
                variant={
                  e.severity === "High"   ? "danger"
                  : e.severity === "Medium" ? "warning"
                  : "info"
                }
              >
                {e.severity}
              </Badge>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
