import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActivityPageData } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { formatStatusLabel } from "@/lib/utils";

export default async function ActivityPage() {
  const user = await requireUser();
  const activities = await getActivityPageData(user.id);

  return (
    <div className="space-y-6">
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
