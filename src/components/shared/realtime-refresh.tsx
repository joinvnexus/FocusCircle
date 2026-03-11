"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeSubscription } from "@/hooks/use-realtime";

type RealtimeSubscriptionConfig = {
  channel: string;
  table: string;
  filter?: string;
};

function RealtimeSubscription({
  channel,
  table,
  filter,
  onChange,
}: RealtimeSubscriptionConfig & { onChange: () => void }) {
  useRealtimeSubscription(channel, table, onChange, filter);
  return null;
}

export function RealtimeRefresh({ subscriptions }: { subscriptions: RealtimeSubscriptionConfig[] }) {
  const router = useRouter();
  const handleChange = useCallback(() => {
    router.refresh();
  }, [router]);

  if (!subscriptions.length) {
    return null;
  }

  return (
    <>
      {subscriptions.map((subscription) => (
        <RealtimeSubscription
          key={subscription.channel}
          channel={subscription.channel}
          table={subscription.table}
          filter={subscription.filter}
          onChange={handleChange}
        />
      ))}
    </>
  );
}
