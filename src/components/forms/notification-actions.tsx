"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/app/actions/notifications";
import { Button } from "@/components/ui/button";

export function MarkAllNotificationsButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await markAllNotificationsReadAction();
          if (result.error) {
            toast.error(result.error);
            return;
          }
          toast.success("All notifications marked as read");
        });
      }}
    >
      {isPending ? "Updating..." : "Mark all as read"}
    </Button>
  );
}

export function MarkNotificationReadButton({ notificationId, isRead }: { notificationId: string; isRead: boolean }) {
  const [isPending, startTransition] = useTransition();
  if (isRead) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await markNotificationReadAction(notificationId);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          toast.success("Notification marked as read");
        });
      }}
    >
      {isPending ? "..." : "Mark read"}
    </Button>
  );
}
