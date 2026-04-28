import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a fetch error (or an error with a `.status` property) into a
 * human-readable message suitable for display in the UI.
 */
export function apiErrorMessage(error) {
  const status = error?.status ?? (() => {
    const match = (error?.message ?? "").match(/\d{3}/);
    return match ? parseInt(match[0], 10) : null;
  })();

  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You don't have permission to view this data.";
  if (status >= 500)  return "A server error occurred. Please try again later.";
  if (status >= 400)  return "The request could not be completed. Please try again.";

  const msg = error?.message ?? "";
  if (msg.includes("Redirecting")) return "Signing you in, please wait…";
  if (msg.includes("Not authenticated")) return "Please sign in to continue.";
  return "Failed to load data. Please check your connection and try again.";
}
