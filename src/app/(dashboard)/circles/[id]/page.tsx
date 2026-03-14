import { Copy, Goal, Users } from "lucide-react";
import { CommentThread } from "@/components/forms/comment-thread";
import { MemberRoleSelect } from "@/components/dashboard/member-role-select";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCircleWorkspace } from "@/lib/data";
import { formatStatusLabel, getStatusColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { RealtimeRefresh } from "@/components/shared/realtime-refresh";

export default async function CircleWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getCircleWorkspace(id);

  if (!workspace.circle) {
    return <div className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">Circle not found or not accessible.</div>;
  }

  const commentTargetIds = [
    ...workspace.tasks.map((task) => task.id),
    ...workspace.goals.map((goal) => goal.id),
  ];
  const subscriptions = [
    { channel: `circle-tasks-${id}`, table: "tasks", filter: `circle_id=eq.${id}` },
    { channel: `circle-goals-${id}`, table: "goals", filter: `circle_id=eq.${id}` },
    { channel: `circle-activity-${id}`, table: "activity_logs", filter: `circle_id=eq.${id}` },
    { channel: `circle-members-${id}`, table: "circle_members", filter: `circle_id=eq.${id}` },
  ];
  if (commentTargetIds.length) {
    subscriptions.push({
      channel: `circle-comments-${id}`,
      table: "comments",
      filter: `target_id=in.(${commentTargetIds.join(",")})`,
    });
  }

  return (
    <div className="space-y-8">
      <RealtimeRefresh subscriptions={subscriptions} />
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/95 via-white/75 to-cyan-50/70 p-10 shadow-sm dark:from-slate-950/80 dark:via-slate-900/60 dark:to-cyan-950/30">
        <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-10 top-6 h-28 w-28 rounded-full bg-cyan-400/25 blur-3xl dark:bg-cyan-300/10" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.3em] text-primary shadow-sm dark:bg-slate-900/70">
              Circle workspace
            </div>
            <div>
              <h1 className="text-4xl font-semibold">{workspace.circle.name}</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">{workspace.circle.description ?? "No description provided."}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-3 text-sm shadow-sm dark:bg-slate-900/70">
            <Copy className="h-4 w-4 text-muted-foreground" />
            Invite code: <span className="font-mono">{workspace.circle.invite_code}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Members" value={String(workspace.members.length)} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Tasks" value={String(workspace.tasks.length)} icon={<Badge className="bg-primary text-primary-foreground">T</Badge>} />
        <StatCard title="Goals" value={String(workspace.goals.length)} icon={<Goal className="h-5 w-5" />} />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <Card className="border-0 bg-white/85 shadow-sm dark:bg-slate-900/70">
            <CardHeader>
              <CardTitle>Tasks board</CardTitle>
            </CardHeader>
            <CardContent>
            <KanbanBoard initialTasks={workspace.tasks} circles={workspace.members.map(m => ({id: m.circle_id, name: workspace.circle!.name}))} goalOptions={workspace.goals} />
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/85 shadow-sm dark:bg-slate-900/70">
            <CardHeader>
              <CardTitle>Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workspace.goals.length ? workspace.goals.map((goal) => (
                <div key={goal.id} className="rounded-2xl bg-white/90 p-4 shadow-sm dark:bg-slate-900/70">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{goal.title}</div>
                      <div className="text-sm text-muted-foreground">{goal.description ?? "No description"}</div>
                    </div>
                    <Badge className={getStatusColor(goal.completion_status ? "completed" : "in_progress")}>
                      {goal.completion_status ? "Complete" : `${goal.progress}%`}
                    </Badge>
                  </div>
                  <Progress value={goal.progress} className="mt-4" />
                  <div className="mt-4">
                    <CommentThread comments={workspace.comments.filter((comment) => comment.target_type === "goal" && comment.target_id === goal.id)} targetId={goal.id} targetType="goal" />
                  </div>
                </div>
              )) : <div className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">No goals in this circle yet.</div>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-0 bg-white/85 shadow-sm dark:bg-slate-900/70">
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {workspace.members.map((member) => (
                <div key={member.user_id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/90 p-4 shadow-sm dark:bg-slate-900/70">
                  <div>
                    <div className="font-medium">{member.users?.full_name ?? member.user_id}</div>
                    <div className="text-sm text-muted-foreground">{member.users?.email}</div>
                  </div>
                  <MemberRoleSelect circleId={workspace.circle!.id} memberUserId={member.user_id} currentRole={member.role} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/85 shadow-sm dark:bg-slate-900/70">
            <CardHeader>
              <CardTitle>Activity feed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {workspace.activities.length ? workspace.activities.map((activity) => (
                <div key={activity.id} className="rounded-2xl bg-white/90 p-4 shadow-sm dark:bg-slate-900/70">
                  <div className="font-medium">{formatStatusLabel(activity.action_type)}</div>
                  <div className="text-xs text-muted-foreground">{new Date(activity.created_at).toLocaleString()}</div>
                </div>
              )) : <div className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">No activity yet.</div>}
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/85 shadow-sm dark:bg-slate-900/70">
            <CardHeader>
              <CardTitle>Task discussions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workspace.tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="rounded-2xl bg-white/90 p-4 shadow-sm dark:bg-slate-900/70">
                  <div className="font-medium">{task.title}</div>
                  <div className="mt-3">
                    <CommentThread comments={workspace.comments.filter((comment) => comment.target_type === "task" && comment.target_id === task.id)} targetId={task.id} targetType="task" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="border-0 bg-white/85 shadow-sm dark:bg-slate-900/70">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="mt-1 text-3xl font-semibold">{value}</div>
        </div>
        <div className="rounded-2xl bg-secondary/60 p-3 dark:bg-slate-800">{icon}</div>
      </CardContent>
    </Card>
  );
}
