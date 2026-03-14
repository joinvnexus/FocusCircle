import { getGoalsPageData } from '@/lib/data';
import { requireUser } from '@/lib/auth';
import { GoalForm } from '@/components/forms/goal-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
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
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl p-0">
              <DialogHeader className="sr-only">
                <DialogTitle>Create Goal</DialogTitle>
                <DialogDescription>Add a new goal and link it to a circle.</DialogDescription>
              </DialogHeader>
              <GoalForm circles={circles} />
            </DialogContent>
          </Dialog>
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
            <CardContent className="text-center p-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-2xl flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">No goals yet</h3>
              <p className="text-muted-foreground mb-4">Create shared goals in your circles to track progress.</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl p-0">
                  <DialogHeader className="sr-only">
                <DialogTitle>Create Goal</DialogTitle>
                <DialogDescription>Add a new goal and link it to a circle.</DialogDescription>
                  </DialogHeader>
                  <GoalForm circles={[]} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}




