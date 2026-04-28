import * as React from "react";
import { cn } from "@/lib/utils";

// ── shadcn Card primitives ────────────────────────────────────────────────────

function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 px-6", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6", className)}
      {...props}
    />
  );
}

// ── StatCard — KPI / metric tiles ────────────────────────────────────────────

function StatCard({ title, value, sub, tone = "default" }) {
  const toneStyles = {
    good:    { card: "from-emerald-50 to-green-50/50 border-emerald-200",  bar: "bg-emerald-500", val: "text-emerald-700" },
    warn:    { card: "from-amber-50 to-yellow-50/50 border-amber-200",     bar: "bg-amber-500",   val: "text-amber-700" },
    bad:     { card: "from-red-50 to-rose-50/50 border-red-200",           bar: "bg-red-500",     val: "text-red-700" },
    default: { card: "from-blue-50/60 to-slate-50 border-slate-200",       bar: "bg-wice-blue",   val: "text-wice-blue" },
  };
  const s = toneStyles[tone] ?? toneStyles.default;

  return (
    <Card className={cn("gap-0 py-0 rounded-2xl overflow-hidden bg-gradient-to-br shadow-sm hover:shadow-md transition-shadow duration-200", s.card)}>
      <div className={cn("h-1 w-full", s.bar)} />
      <CardContent className="p-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</div>
        <div className={cn("mt-2 text-3xl font-black", s.val)}>{value}</div>
        {sub && <div className="mt-1.5 text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, StatCard };
export default StatCard;

