"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BillingPortalButton() {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);
    const response = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await response.json();
    if (data?.url) {
      window.location.href = data.url;
      return;
    }
    setIsPending(false);
  };

  return (
    <Button type="button" variant="outline" onClick={handleClick} disabled={isPending}>
      {isPending ? "Opening..." : "Manage billing"}
    </Button>
  );
}
