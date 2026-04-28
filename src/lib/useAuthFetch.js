import { useCallback } from "react";
import { useMsal } from "@azure/msal-react";
import { tokenRequest } from "@/lib/msal";

/**
 * Returns a fetch wrapper that silently acquires an Entra access token and
 * attaches it as a Bearer header. Any SPA or script can use the same pattern.
 */
export function useAuthFetch() {
  const { instance, accounts } = useMsal();

  return useCallback(async (url, options = {}) => {
    const account = accounts[0];
    if (!account) throw new Error("Not authenticated");

    const { accessToken } = await instance.acquireTokenSilent({
      ...tokenRequest,
      account,
    }).catch(() => {
      // Silent renewal failed (e.g. no session cookie) — fall back to redirect
      instance.acquireTokenRedirect({ ...tokenRequest, account });
      throw new Error("Redirecting for token renewal");
    });

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
  }, [instance, accounts]);
}
