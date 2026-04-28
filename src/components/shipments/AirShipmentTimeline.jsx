import {
  Truck,
  ClipboardList,
  PlaneTakeoff,
  PlaneLanding,
  FileText,
  Gavel,
  Package,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

const STEP_ICONS = {
  "Pickup":          Truck,
  "Export Customs":  ClipboardList,
  "Departure":       PlaneTakeoff,
  "Arrival":         PlaneLanding,
  "Release DO":      FileText,
  "Import Customs":  Gavel,
  "Delivery":        Package,
};

// ── Step ──────────────────────────────────────────────────────────────────────

function Step({ label, actualDate, estimatedDate, done, isCurrent, hasLeft, leftDone, hasRight, rightDone }) {
  const Icon = STEP_ICONS[label] ?? CheckCircle;
  const circleHalf = isCurrent ? "1.375rem" : "1.25rem"; // 11/10 * 0.5 * 4 = 22px / 20px
  return (
    <div className="relative flex flex-col items-center flex-1" style={{ minWidth: 100 }}>
      {/* Left arm */}
      {hasLeft && (
        <div
          className={cn("absolute top-5 -translate-y-1/2 left-0 h-0.5 transition-colors duration-500",
            leftDone ? "bg-wice-red" : "bg-gray-200")}
          style={{ right: `calc(50% + ${circleHalf})` }}
        />
      )}
      {/* Right arm */}
      {hasRight && (
        <div
          className={cn("absolute top-5 -translate-y-1/2 right-0 h-0.5 transition-colors duration-500",
            rightDone ? "bg-wice-red" : "bg-gray-200")}
          style={{ left: `calc(50% + ${circleHalf})` }}
        />
      )}
      {/* Circle */}
      <div
        className={cn(
          "relative z-10 rounded-full border-2 flex items-center justify-center shadow-sm shrink-0 transition-colors",
          isCurrent ? "h-11 w-11" : "h-10 w-10",
          done
            ? "bg-wice-red/10 border-wice-red text-wice-red"
            : "bg-gray-50 border-gray-300 text-gray-400"
        )}
      >
        <Icon className={cn(isCurrent ? "h-5 w-5" : "h-4 w-4")} />
      </div>

      {/* Labels */}
      <div className="mt-2 text-center px-1">
        <p
          className={cn(
            "text-[11px] font-semibold leading-tight",
            done ? "text-wice-red" : "text-muted-foreground"
          )}
        >
          {label}
        </p>

        {/* "Completed" text — for done steps that have no actual date */}
        {done && !actualDate && (
          <p className="mt-0.5 text-[10px] font-medium text-wice-red">Completed</p>
        )}

        {/* Date — actual or estimated */}
        {actualDate ? (
          <p className="mt-0.5 text-[10px] text-muted-foreground">{fmtDate(actualDate)}</p>
        ) : estimatedDate ? (
          <p className="mt-0.5 text-[10px] text-muted-foreground/60">Est. {fmtDate(estimatedDate)}</p>
        ) : null}
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AirShipmentTimeline({
  pickupDate,
  customsClearDate,
  etd,
  atd,
  eta,
  ata,
  releaseDoDate,
  importCustomsDate,
  deliveredDate,
  importOrExport,
}) {
  const isImport = importOrExport?.toLowerCase().includes("import");

  const steps = [
    { label: "Pickup",         actualDate: pickupDate,        estimatedDate: null },
    { label: "Export Customs", actualDate: customsClearDate,  estimatedDate: null },
    { label: "Departure",      actualDate: atd,               estimatedDate: etd  },
    { label: "Arrival",        actualDate: ata,               estimatedDate: eta  },
    ...(isImport ? [{ label: "Release DO", actualDate: releaseDoDate, estimatedDate: null }] : []),
    { label: "Import Customs", actualDate: importCustomsDate, estimatedDate: null },
    { label: "Delivery",       actualDate: deliveredDate,     estimatedDate: null },
  ];

  // Index of the last step that has an actual date (-1 = none set yet)
  const currentIndex = steps.reduce((max, s, i) => (s.actualDate != null ? i : max), -1);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max items-start">
        {steps.map((step, i) => {
          const done = i <= currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <Step
              key={step.label}
              label={step.label}
              actualDate={step.actualDate}
              estimatedDate={step.estimatedDate}
              done={done}
              isCurrent={isCurrent}
              hasLeft={i > 0}
              leftDone={i <= currentIndex}
              hasRight={i < steps.length - 1}
              rightDone={i < currentIndex}
            />
          );
        })}
      </div>
    </div>
  );
}


