import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { Button } from "@/components/ui/button";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { useIsWiceStaff } from "@/lib/useIsWiceStaff";

function TopBar() {
  const { instance, accounts } = useMsal();
  const authFetch = useAuthFetch();
  const displayName = accounts[0]?.name ?? accounts[0]?.username ?? "Account";
  const initial = displayName.charAt(0).toUpperCase();

  const [me, setMe] = useState(null);

  useEffect(() => {
    authFetch("/api/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setMe(d); })
      .catch(() => {});
  }, [authFetch]);

  function handleSignOut() {
    instance.logoutRedirect().catch(console.error);
  }

  return (
    <div
      className="sticky top-0 z-20 shadow-lg shadow-wice-blue/20"
      style={{ background: "linear-gradient(135deg, #1A2067 0%, #2A388F 100%)" }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md">
            <img
              src="/images/wice-logo.png"
              alt="WICE Logistics"
              className="h-8 w-8 object-contain"
            />
          </div>
          <div>
            <div className="text-sm font-bold tracking-wider text-white">Customer Portal</div>
            <div className="text-[10px] font-medium tracking-widest text-white/50 uppercase">WICE Logistics</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="hidden sm:flex items-center gap-2">
            <div
              className="h-7 w-7 rounded-full grid place-items-center text-xs font-bold text-white shadow"
              style={{ background: "linear-gradient(135deg, #ED1C24, #c5161c)" }}
            >
              {initial}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white/90 text-sm">{displayName}</span>
              {me && (
                <span className="text-white/50 text-[10px] font-medium tracking-wide uppercase">
                  {me.customerCode}{me.companyName ? ` · ${me.companyName}` : ""}
                </span>
              )}
            </div>
          </div>
          <span className="h-5 w-px bg-white/20" />
          <button
            className="rounded-lg px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <Button
          variant="ghost"
          size="sm"
          className={
            isActive
              ? "bg-wice-red text-white shadow-sm hover:bg-wice-red-dark hover:text-white"
              : "text-slate-600 hover:text-wice-blue hover:bg-slate-100"
          }
        >
          {children}
        </Button>
      )}
    </NavLink>
  );
}

export default function Layout({ children }) {
  const isWiceStaff = useIsWiceStaff();
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #f8fafc 0%, #eff6ff 55%, #f0f9ff 100%)" }}
    >
      <TopBar />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-wrap gap-1 w-fit rounded-2xl bg-white p-1.5 shadow-sm border border-slate-200/80">
          <NavItem to="/dashboard">Dashboard</NavItem>
          <NavItem to="/shipments">Shipments</NavItem>
          <NavItem to="/reports-kpi">Reports &amp; KPIs</NavItem>
          <NavItem to="/spending">Value Spending</NavItem>
          {isWiceStaff && <NavItem to="/kpi-entry">KPI Entry</NavItem>}
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}