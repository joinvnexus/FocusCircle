import Link from "next/link";
import { GoalForm, GoalProgressInput } from "@/components/forms/goal-form";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGoalsPageData } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { RealtimeRefresh } from "@/components/shared/realtime-refresh";
import { Button } from "@/components/ui/button";

export default async function GoalsPage() {
  const user = await requireUser();
  const { circles, goals } = await getGoalsPageData(user.id);
  const circleIds = (circles as Array<{ id: string }>).map((circle) => circle.id);

  return (
    <div className="space-y-6">
      <RealtimeRefresh
        subscriptions={
          circleIds.length
            ? [{ channel: `goals-${user.id}`, table: "goals", filter: `circle_id=in.(${circleIds.join(",")})` }]
            : []
        }
      />
      <div>
        <h1 className="text-3xl font-semibold">Goals</h1>
        <p className="text-muted-foreground">Define shared outcomes for your circles and track how task completion moves them forward.</p>
      </div>
      {circles.length ? (
        <GoalForm circles={circles as unknown as Array<{ id: string; name: string }>} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create your first circle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Goals live inside circles. Create a circle first, then you can add goals for that group.</p>
            <Link href="/circles">
              <Button>Create circle</Button>
            </Link>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {goals.length ? goals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <CardTitle>{goal.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">{goal.description ?? "No description provided."}</div>
              <Progress value={goal.progress} />
              <div className="text-sm text-muted-foreground">{goal.completed_tasks}/{goal.task_count} tasks completed</div>
              <GoalProgressInput goalId={goal.id} progress={goal.progress} />
              <div className="text-sm text-muted-foreground">Circle: {goal.circle_name}</div>
              <Link href={`/circles/${goal.circle_id}`} className="text-sm text-primary">View circle workspace</Link>
            </CardContent>
          </Card>
        )) : <div className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">Create a goal to start tracking circle outcomes.</div>}
      </div>
    </div>
  );
}
