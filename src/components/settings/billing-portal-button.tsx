"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function BillingPortalButton() {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage = data?.error ?? "Could not open billing portal";
        toast.error(errorMessage);
        if (response.status === 404) {
          window.location.href = "/pricing";
          return;
        }
        setIsPending(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      toast.error("Could not open billing portal");
      setIsPending(false);
    } catch (error) {
      toast.error((error as Error).message ?? "Could not open billing portal");
      setIsPending(false);
    }
  };

  return (
    <Button type="button" variant="outline" onClick={handleClick} disabled={isPending}>
      {isPending ? "Opening..." : "Manage billing"}
    </Button>
  );
}
