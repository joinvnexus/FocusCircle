"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function CheckoutStatusToast() {
  useEffect(() => {
    const checkout = new URLSearchParams(window.location.search).get("checkout");
    if (!checkout) return;

    if (checkout === "cancel") {
      toast.message("Checkout canceled.");
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    window.history.replaceState(null, "", url.toString());
  }, []);

  return null;
}
