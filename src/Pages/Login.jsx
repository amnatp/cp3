import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { tokenRequest } from "@/lib/msal";
import { Button } from "@/components/ui/button";
import { Lock, Mail, ShieldCheck } from "lucide-react";

const inputCls =
  "flex h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-wice-blue focus:outline-none focus:ring-2 focus:ring-wice-blue/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

function MicrosoftLogo({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 23 23" className={className} aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

export default function Login() {
  const { instance } = useMsal();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e) {
    e?.preventDefault();
    setSubmitting(true);
    instance
      .loginRedirect({ ...tokenRequest, loginHint: email || undefined })
      .catch((err) => {
        console.error(err);
        setSubmitting(false);
      });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-wice-blue via-indigo-700 to-slate-900 px-4 py-10">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-wice-red/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-indigo-400/30 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur sm:p-10">
        <div className="mb-7 flex flex-col items-center gap-3">
          <img
            src="/images/wice-logo.png"
            alt="WICE Logistics"
            className="h-14 w-auto object-contain"
          />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Customer Portal
          </h1>
          <p className="text-center text-sm text-slate-500">
            Sign in with your <span className="font-medium text-slate-700">company email &amp; password</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-slate-700">
              Company email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={inputCls}
                disabled
                title="Your password is entered securely on the Microsoft sign-in page"
              />
            </div>
            <p className="text-[11px] leading-snug text-slate-500">
              For your security, your password is entered on the Microsoft sign-in page.
            </p>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={submitting}>
            <MicrosoftLogo />
            {submitting ? "Redirecting…" : "Continue with Microsoft"}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Secured by Microsoft Entra ID · Single Sign-On
        </div>
      </div>
    </div>
  );
}
