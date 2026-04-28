export const CUSTOMER_CODE = "MEAJOH,MEAJOH03";

export const CATEGORY_COLORS = [
  "#10b981", "#ED1C24", "#6366f1", "#e11d48", "#8b5cf6", "#06b6d4", "#f97316", "#3b82f6",
];

export const CURRENT_YEAR = new Date().getFullYear();

export const MONTH_KEYS = [
  { key: "JAN", label: "Jan", num: 1 },
  { key: "FEB", label: "Feb", num: 2 },
  { key: "MAR", label: "Mar", num: 3 },
  { key: "APR", label: "Apr", num: 4 },
  { key: "MAY", label: "May", num: 5 },
  { key: "JUN", label: "Jun", num: 6 },
  { key: "JUL", label: "Jul", num: 7 },
  { key: "AUG", label: "Aug", num: 8 },
  { key: "SEP", label: "Sep", num: 9 },
  { key: "OCT", label: "Oct", num: 10 },
  { key: "NOV", label: "Nov", num: 11 },
  { key: "DEC", label: "Dec", num: 12 },
];

export function money(n) {
  if (n == null || Number.isNaN(Number(n))) return "-";
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}
