import { getNotificationsPageData } from '@/lib/data';
import { requireUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox'; // TBD
import Link from 'next/link';
import { RealtimeRefresh } from '@/components/shared/realtime-refresh';

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await getNotificationsPageData(user.id);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const grouped = notifications.reduce((acc, notif) => {
    const dateKey = new Date(notif.created_at).toLocaleDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(notif);
    return acc;
  }, {} as Record<string, typeof notifications>);

  return (
    <div className="space-y-8">
      <RealtimeRefresh 
        subscriptions={[
          { channel: `notifications-${user.id}`, table: "notifications", filter: `user_id.eq.${user.id}` }
        ]} 
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 
              ? `${unreadCount} unread` 
              : "You are all caught up"
            }
          </p>
        </div>
        <Button variant="outline" disabled={!notifications.some(n => !n.is_read)}>
          Mark all read
        </Button>
      </div>

      {Object.entries(grouped).length ? (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="text-lg">{date}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(items as any[]).map((notif: any) => (
                  <div key={notif.id} className="flex gap-3 p-4 rounded-xl hover:bg-accent">
                    <div className="w-4 h-4 rounded border flex items-center justify-center" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium truncate">{notif.title}</div>
                        {!notif.is_read && <Badge variant="secondary">New</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(notif.created_at).toLocaleTimeString()}  -  {notif.type}
                      </div>
                      {notif.data && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                          {typeof notif.data === 'object' ? JSON.stringify(notif.data) : notif.data}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="text-center p-12">
            <h3 className="font-semibold mb-2">No notifications</h3>
            <p className="text-muted-foreground">Notifications appear when you're assigned tasks or @mentioned.</p>
            <div className="mt-6">
              <Link href="/dashboard">
                <Button>Go to dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}




