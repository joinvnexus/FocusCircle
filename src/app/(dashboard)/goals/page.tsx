import { getGoalsPageData } from '@/lib/data';
import { requireUser } from '@/lib/auth';
import { GoalForm } from '@/components/forms/goal-form';
import { EmptyState } from '@/components/shared/empty-state';
import { QuickActionDialog } from '@/components/shared/quick-action-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';
import { RealtimeRefresh } from '@/components/shared/realtime-refresh';
import Link from 'next/link';

export default async function GoalsPage() {
  const user = await requireUser();
  const { goals, circles } = await getGoalsPageData(user.id);

  return (
    <div className="space-y-8">
      <RealtimeRefresh 
        subscriptions={[          { channel: `goals-user-${user.id}`, table: "goals", filter: `created_by.eq.${user.id}` }
        ]} 
      />
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Goals</h1>
            <p className="text-muted-foreground">Shared circle goals with automatic progress from task completion.</p>
          </div>
          <QuickActionDialog
            action="new-goal"
            title="Create Goal"
            description="Add a new goal and link it to a circle."
            triggerLabel="New goal"
          >
            <GoalForm circles={circles} />
          </QuickActionDialog>
        </div>
      </div>

      <div className="grid gap-6">
        {goals.length ? goals.map((goal) => (
          <Card key={goal.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl leading-tight">{goal.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div>{goal.circle_name}</div>
                    {goal.deadline && <Badge variant="outline">Due {new Date(goal.deadline).toLocaleDateString()}</Badge>}
                  </div>
                </div>
                <Badge className={goal.completion_status ? 'bg-emerald-500' : 'bg-amber-500'}>
                  {goal.completion_status ? 'Complete' : `${goal.progress}%`}
                </Badge>
              </div>
              {goal.description && (
                <p className="text-sm text-muted-foreground mt-2">{goal.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Progress value={goal.progress} className="h-3" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{goal.task_count || 0} tasks</span>
                    <span>{goal.completed_tasks || 0} completed</span>
                  </div>
                </div>
                {goal.task_count > 0 && (
                  <Link href={`/circles/${goal.circle_id}`} className="inline-block text-sm underline">
                    {"View in circle ->"}
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card className="border-dashed border-2">
            <CardContent className="p-4">
              <EmptyState
                title="No goals yet"
                description="Create a shared goal for a circle and roll task progress up into a single target."
                icon={<Target className="h-7 w-7" />}
                className="border-0 bg-transparent"
              />
              <div className="-mt-16 flex justify-center">
                <QuickActionDialog
                  action="new-goal"
                  title="Create Goal"
                  description="Add a new goal and link it to a circle."
                  triggerLabel="Create goal"
                >
                  <GoalForm circles={circles} />
                </QuickActionDialog>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}




