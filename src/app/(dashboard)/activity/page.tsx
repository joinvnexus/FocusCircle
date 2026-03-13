import { getActivityPageData } from '@/lib/data';
import { requireUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RealtimeRefresh } from '@/components/shared/realtime-refresh';
import { formatStatusLabel } from '@/lib/utils';

export default async function ActivityPage() {
  const user = await requireUser();
  const activities = await getActivityPageData(user.id);

  return (
    <div className="space-y-8">
      <RealtimeRefresh 
        subscriptions={[          { channel: `activity-user-${user.id}`, table: "activity_logs", filter: `actor_id.eq.${user.id}` }
        ]} 
      />
      <div>
        <h1 className="text-3xl font-semibold">Activity</h1>
        <p className="text-muted-foreground">Recent circle actions and updates across your workspaces.</p>
      </div>

      {activities.length ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    {formatStatusLabel(activity.action_type)}
                    <div className="text-sm text-muted-foreground">
                      {activity.entity_type}  -  {activity.entity_id}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activity.circles?.name || 'Personal'}  -  {new Date(activity.created_at).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="outline">{activity.circles?.name || 'Personal'}</Badge>
                </div>
                {activity.metadata && (
                  <pre className="mt-3 rounded-lg bg-muted p-3 text-xs">
                    {JSON.stringify(activity.metadata, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="text-center p-12">
            <h3 className="font-semibold mb-2">No activity yet</h3>
            <p className="text-muted-foreground">Activity appears when you create circles and collaborate.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}



