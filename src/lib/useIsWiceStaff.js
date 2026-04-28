import { useMsal } from "@azure/msal-react";

/**
 * Returns true if the signed-in user is a WICE staff member.
 *
 * TODO: Replace the email-domain check with whatever identity signal is
 * agreed upon (e.g. an Azure AD group claim, a role returned by /api/me, etc.)
 */
export function useIsWiceStaff() {
  const { accounts } = useMsal();
  const email = accounts[0]?.username ?? "";
  return email.toLowerCase().endsWith("@wice.co.th");
}
