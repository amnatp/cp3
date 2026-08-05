import { useCallback } from "react";
import { useMsal } from "@azure/msal-react";
import { tokenRequest } from "@/lib/msal";

/**
 * Base URL for the BFF API. In dev this is empty so Vite's proxy handles
 * `/api/*`. In production set `VITE_API_BASE_URL`.
 *
 * If the variable is missing, keep relative URLs by default, except on
 * production hosts under wicelogistics.com where the API must go to the
 * public API host.
 */
function getFallbackApiBaseUrl() {
  if (!import.meta.env.PROD || typeof window === "undefined") return "";
  return window.location.hostname.toLowerCase().endsWith(".wicelogistics.com")
    ? "https://cp-bff.azurewebsites.net"
    : "";
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || getFallbackApiBaseUrl()).replace(/\/$/, "");

function buildUrl(url) {
  if (/^https?:\/\//i.test(url)) return url;
  if (!API_BASE_URL) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Returns a fetch wrapper that silently acquires an Entra access token and
 * attaches it as a Bearer header. Any SPA or script can use the same pattern.
 */
export function useAuthFetch() {
  const { instance, accounts } = useMsal();
  const activeAccountId =
    accounts[0]?.homeAccountId ??
    accounts[0]?.localAccountId ??
    accounts[0]?.username ??
    "";

  return useCallback(async (url, options = {}) => {
    const allAccounts = instance.getAllAccounts();
    const account = activeAccountId
      ? allAccounts.find(
          (a) =>
            a.homeAccountId === activeAccountId ||
            a.localAccountId === activeAccountId ||
            a.username === activeAccountId,
        ) ?? allAccounts[0]
      : allAccounts[0];

    if (!account) throw new Error("Not authenticated");

    const { accessToken } = await instance.acquireTokenSilent({
      ...tokenRequest,
      account,
    }).catch(() => {
      // Silent renewal failed (e.g. no session cookie) — fall back to redirect
      instance.acquireTokenRedirect({ ...tokenRequest, account });
      throw new Error("Redirecting for token renewal");
    });

    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    };

    if (!isFormData && !("Content-Type" in headers) && !("content-type" in headers)) {
      headers["Content-Type"] = "application/json";
    }

    return fetch(buildUrl(url), {
      ...options,
      headers,
    });
  }, [instance, activeAccountId]);
}
