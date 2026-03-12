"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function CheckoutButton({ label = "Upgrade to Pro" }: { label?: string }) {
  const { user, loading } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const handleCheckout = async () => {
    if (loading) return;
    if (!user) {
      window.location.href = "/login?next=/pricing";
      return;
    }
    setIsPending(true);
    const response = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await response.json();
    if (data?.url) {
      window.location.href = data.url;
      return;
    }
    setIsPending(false);
  };

  return (
    <Button className="w-full" onClick={handleCheckout} disabled={isPending}>
      {isPending ? "Redirecting..." : label}
    </Button>
  );
}
