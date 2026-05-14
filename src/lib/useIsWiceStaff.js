import { useMsal } from "@azure/msal-react";

/**
 * Returns true if the signed-in user has the "Staff" Azure AD app role.
 */
export function useIsWiceStaff() {
  const { accounts } = useMsal();
  const roles = accounts[0]?.idTokenClaims?.roles ?? [];
  return roles.includes("Staff");
}
