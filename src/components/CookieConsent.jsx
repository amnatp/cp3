import React, { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function handleDecline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className={cn(
        "fixed bottom-0 inset-x-0 z-50 flex flex-col gap-4 border-t border-border bg-background p-4 shadow-lg",
        "sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4"
      )}
    >
      <div className="flex items-start gap-3">
        <Cookie className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-foreground">
          We use cookies to improve your experience and analyse site usage. By continuing, you agree to our use of cookies.{" "}
        </p>
      </div>

      <div className="flex shrink-0 gap-2 self-end sm:self-auto">
        <Button variant="outline" size="sm" onClick={handleDecline}>
          Decline
        </Button>
        <Button variant="navy" size="sm" onClick={handleAccept}>
          Accept
        </Button>
      </div>
    </div>
  );
}
