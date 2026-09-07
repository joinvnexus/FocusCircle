"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CheckoutButton({ label = "Upgrade to Pro" }: { label?: string }) {
  const { user, appUser, loading } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const handleCheckout = async () => {
    if (loading) return;
    if (!user) {
      window.location.href = "/login?next=/pricing";
      return;
    }
    setIsPending(true);
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data?.error ?? "Could not start checkout");
        setIsPending(false);
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      toast.error("Could not start checkout");
      setIsPending(false);
    } catch (error) {
      toast.error((error as Error).message ?? "Could not start checkout");
      setIsPending(false);
    }
  };

  const isPro = appUser?.plan === "pro";
  const buttonLabel = isPro ? "Manage billing" : label;

  return (
    <Button className="w-full" onClick={handleCheckout} disabled={isPending || loading}>
      {isPending ? "Redirecting..." : buttonLabel}
    </Button>
  );
}
