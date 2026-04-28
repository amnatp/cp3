const cx = (...xs) => xs.filter(Boolean).join(" ");

export const SERVICE_TABS = [
  { key: "ALL",          label: "All" },
  { key: "AIR",          label: "Air" },
  { key: "SEA",          label: "Sea" },
  { key: "CROSS_BORDER", label: "Cross-border" },
  { key: "INLAND",       label: "Inland" },
  { key: "CUSTOMS",      label: "Customs" },
];

export const STATUS_OPTIONS = ["All", "In Transit", "In Customs", "Delayed", "Delivered"];

export function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export function matchesQuery(s, q) {
  if (!q) return true;
  const hay = [s.id, s.customerRef, s.origin, s.destination, s.service, s.status, s.customsStatus, ...(s.refs || [])]
    .join(" ")
    .toLowerCase();
  return hay.includes(q.toLowerCase().trim());
}

const AIR_JOB_TYPES = new Set(["AE", "PAE", "JAE", "KAE", "AI", "PAI", "JAI", "KAI"]);
const SEA_JOB_TYPES = new Set(["SE", "PSE", "JSE", "KSE", "GP", "LC", "FC", "SI", "PSI", "JSI", "KSI", "GI", "IL", "IF"]);

export function byTabFilter(s, tabKey) {
  if (tabKey === "ALL") return true;
  return s.service === tabKey;
}

export function statusBadge(status) {
  const base = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border";
  switch (status) {
    case "Delayed":    return cx(base, "bg-red-50 text-red-700 border-red-200");
    case "In Customs": return cx(base, "bg-amber-50 text-amber-800 border-amber-200");
    case "Delivered":  return cx(base, "bg-emerald-50 text-emerald-700 border-emerald-200");
    default:           return cx(base, "bg-sky-50 text-sky-700 border-sky-200");
  }
}

export function serviceIcon(service) {
  const base = "inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-white text-slate-700";
  const glyph =
    service === "AIR"          ? "✈️" :
    service === "SEA"          ? "🚢" :
    service === "CROSS_BORDER" ? "🚚" :
    service === "INLAND"       ? "🛻" : "📦";
  return <span className={base} title={service}>{glyph}</span>;
}
