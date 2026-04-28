import React from "react";
import { useMsal } from "@azure/msal-react";
import { tokenRequest } from "@/lib/msal";
import { Button } from "@/components/ui/button";

export default function Login() {
  const { instance } = useMsal();

  function handleLogin() {
    instance.loginRedirect(tokenRequest).catch(console.error);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-wice-blue">
      <div className="w-full max-w-sm rounded-2xl bg-white p-10 shadow-xl">
        <div className="mb-8 flex flex-col items-center gap-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-wice-red text-2xl font-black text-white">
            W
          </span>
          <h1 className="text-xl font-bold text-slate-900">Customer Portal</h1>
          <p className="text-center text-sm text-muted-foreground">
            Sign in with your WICE Microsoft account
          </p>
        </div>

        <Button className="w-full" onClick={handleLogin}>
          Sign in with Microsoft
        </Button>
      </div>
    </div>
  );
}
