import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActivityPageData, getCirclesForUser } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { formatStatusLabel } from "@/lib/utils";
import { RealtimeRefresh } from "@/components/shared/realtime-refresh";

export default async function ActivityPage() {
  const user = await requireUser();
  const [activities, circles] = await Promise.all([
    getActivityPageData(user.id),
    getCirclesForUser(user.id),
  ]);
  const circleIds = circles
    .map((entry) => (entry.circles as { id: string } | null)?.id)
    .filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <RealtimeRefresh
        subscriptions={
          circleIds.length
            ? [{ channel: `activity-${user.id}`, table: "activity_logs", filter: `circle_id=in.(${circleIds.join(",")})` }]
            : []
        }
      />
      <div>
        <h1 className="text-3xl font-semibold">Activity</h1>
        <p className="text-muted-foreground">An audit-friendly view of what changed across your circles.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Circle timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activities.length ? activities.map((activity) => (
            <div key={activity.id} className="rounded-2xl border p-4">
              <div className="font-medium">{formatStatusLabel(activity.action_type)}</div>
              <div className="text-sm text-muted-foreground">Circle: {activity.circles?.name ?? 'Circle'}</div>
              <div className="text-xs text-muted-foreground">{new Date(activity.created_at).toLocaleString()}</div>
            </div>
          )) : <div className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">No activity recorded yet.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
