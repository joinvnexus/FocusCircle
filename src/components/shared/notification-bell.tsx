"use client";

import { useMemo } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationCenter, type NotificationType } from "@/components/dashboard/notification-center";

const KNOWN_TYPES = new Set<NotificationType>([
  "task_assigned",
  "task_completed",
  "task_overdue",
  "mention",
  "comment",
  "deadline_alert",
  "goal_update",
  "circle_invite",
  "system",
]);

function toKnownType(type: string): NotificationType | null {
  return KNOWN_TYPES.has(type as NotificationType) ? (type as NotificationType) : null;
}

/**
 * Wires the fully built NotificationCenter (categories, read/unread filters,
 * bulk actions) to live Supabase data via the realtime notifications hook.
 */
export function NotificationBell() {
  const { notifications } = useNotifications();

  const mapped = useMemo(
    () =>
      notifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        is_read: notification.is_read,
        created_at: notification.created_at,
        type: toKnownType(notification.type),
        data: notification.data,
      })),
    [notifications],
  );

  return <NotificationCenter initialNotifications={mapped} />;
}
