import { Bell } from "lucide-react";
import { MarkAllNotificationsButton, MarkNotificationReadButton } from "@/components/forms/notification-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNotificationsPageData } from "@/lib/data";
import { requireUser } from "@/lib/auth";

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await getNotificationsPageData(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Notifications</h1>
          <p className="text-muted-foreground">Assignments, comments, invites, goal changes, and deadline pressure.</p>
        </div>
        <MarkAllNotificationsButton />
      </div>
      <div className="grid gap-4">
        {notifications.length ? notifications.map((notification) => (
          <Card key={notification.id}>
            <CardContent className="flex items-start justify-between gap-4 p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-secondary p-3">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{notification.title}</div>
                    {!notification.is_read && <Badge variant="secondary">Unread</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">{notification.message}</div>
                  <div className="text-xs text-muted-foreground">{new Date(notification.created_at).toLocaleString()}</div>
                </div>
              </div>
              <MarkNotificationReadButton notificationId={notification.id} isRead={notification.is_read} />
            </CardContent>
          </Card>
        )) : <div className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">No notifications yet.</div>}
      </div>
    </div>
  );
}
