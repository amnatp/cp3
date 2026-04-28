import { cn } from "@/lib/utils";

/**
 * Spinner – animated ring using WICE orange (--primary).
 * size: "sm" | "md" | "lg"
 */
export function Spinner({ size = "md", className }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full border-solid border-primary border-r-transparent align-middle",
        sizes[size],
        className
      )}
    />
  );
}

/**
 * PageLoader – centered spinner for full-page loading states.
 */
export function PageLoader({ message = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
      <Spinner size="lg" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

/**
 * InlineLoader – small spinner + text for inline use (e.g. inside a row).
 */
export function InlineLoader({ message = "Loading…" }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner size="sm" />
      {message}
    </span>
  );
}
