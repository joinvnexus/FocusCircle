import { Bell, CalendarClock, CheckCircle2, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdvancedAnalytics, getDashboardSnapshot } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { formatDate, formatRelativeTime, formatStatusLabel, getPriorityColor, getStatusColor } from "@/lib/utils";
import { GoalProgressChart, TaskPriorityChart, WeeklyTasksChart } from "@/components/dashboard/productivity-charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RealtimeRefresh } from "@/components/shared/realtime-refresh";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("users").select("plan").eq("id", user.id).single();
  const plan = (profile?.plan ?? "free") as "free" | "pro";

  const snapshot = await getDashboardSnapshot(user.id);
  const advancedAnalytics = plan === "pro" ? await getAdvancedAnalytics(user.id) : null;
  const completedThisWeek = snapshot.weeklyCompleted.reduce((sum, item) => sum + item.completed, 0);

  return (
    <div className="space-y-8">
      <RealtimeRefresh
        subscriptions={[
          { channel: `tasks-assigned-${user.id}`, table: "tasks", filter: `assigned_to=eq.${user.id}` },
          { channel: `tasks-created-${user.id}`, table: "tasks", filter: `created_by=eq.${user.id}` },
          { channel: `notifications-${user.id}`, table: "notifications", filter: `user_id=eq.${user.id}` },
        ]}
      />
      <div className="relative overflow-hidden rounded-3xl bg-white/70 p-8 shadow-sm dark:bg-slate-900/60">
        <div className="absolute -left-16 top-8 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-8 top-6 h-24 w-24 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-300/10" />
        <div className="relative space-y-3">
          <div className="text-sm uppercase tracking-[0.28em] text-primary">Focus snapshot</div>
          <h1 className="text-4xl font-semibold">Dashboard</h1>
          <p className="max-w-2xl text-muted-foreground">Today&apos;s workload, circle momentum, and your recent productivity signal.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Completed this week" value={String(completedThisWeek)} icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />} />
        <MetricCard title="Today&apos;s tasks" value={String(snapshot.todaysTasks.length)} icon={<CalendarClock className="h-5 w-5 text-primary" />} />
        <MetricCard title="Circle activity" value={String(snapshot.circleActivity.length)} icon={<Users className="h-5 w-5 text-cyan-500" />} />
        <MetricCard title="Unread notifications" value={String(snapshot.recentNotifications.filter((item) => !item.is_read).length)} icon={<Bell className="h-5 w-5 text-rose-500" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden border-0 bg-white/80 shadow-sm dark:bg-slate-900/60">
          <div className="h-1 w-full bg-gradient-to-r from-primary via-cyan-400 to-emerald-400" />
          <CardHeader>
            <CardTitle>Weekly productivity</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyTasksChart data={snapshot.weeklyCompleted} />
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-0 bg-white/80 shadow-sm dark:bg-slate-900/60">
          <div className="h-1 w-full bg-gradient-to-r from-rose-400 via-orange-300 to-amber-400" />
          <CardHeader>
            <CardTitle>Goal completion rate</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalProgressChart data={snapshot.goalProgress} />
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-0 bg-white/80 shadow-sm dark:bg-slate-900/60">
        <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-primary" />
        <CardHeader>
          <CardTitle>Advanced analytics</CardTitle>
        </CardHeader>
        <CardContent>
          {plan === "pro" && advancedAnalytics ? (
            <div className="grid gap-6 lg:grid-cols-[0.35fr_0.65fr] lg:items-center">
              <div className="rounded-2xl border bg-white/70 p-5 shadow-sm dark:bg-slate-900/50">
                <div className="text-sm text-muted-foreground">Completion rate (last 30 days)</div>
                <div className="mt-2 text-4xl font-semibold">{advancedAnalytics.completionRate}%</div>
                <div className="mt-1 text-xs text-muted-foreground">Based on tasks updated recently.</div>
              </div>
              <div className="rounded-2xl border bg-white/70 p-5 shadow-sm dark:bg-slate-900/50">
                <div className="mb-3 text-sm font-medium">Priority mix</div>
                <TaskPriorityChart data={advancedAnalytics.byPriority} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium">Unlock Pro insights</div>
                <div className="text-sm text-muted-foreground">See priority mix, completion signals, and deeper trends.</div>
              </div>
              <Button asChild>
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 bg-white/80 shadow-sm dark:bg-slate-900/60">
          <CardHeader>
            <CardTitle>Today&apos;s tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.todaysTasks.length ? snapshot.todaysTasks.map((task) => (
              <div key={task.id} className="rounded-2xl bg-white/90 p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 dark:bg-slate-900/70">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground">{task.description ?? "No description"}</div>
                  </div>
                  <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge className={getStatusColor(task.status)}>{formatStatusLabel(task.status)}</Badge>
                  {task.due_date && <Badge variant="outline">Due {formatDate(task.due_date)}</Badge>}
                </div>
              </div>
            )) : <EmptyCard message="No tasks are due today." />}
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/80 shadow-sm dark:bg-slate-900/60">
          <CardHeader>
            <CardTitle>Upcoming deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.upcomingDeadlines.length ? snapshot.upcomingDeadlines.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-2xl bg-white/90 p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 dark:bg-slate-900/70">
                <div>
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-muted-foreground">{task.due_date ? formatRelativeTime(task.due_date) : 'No due date'}</div>
                </div>
                <Badge className={getStatusColor(task.status)}>{formatStatusLabel(task.status)}</Badge>
              </div>
            )) : <EmptyCard message="No deadlines are scheduled." />}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 bg-white/80 shadow-sm dark:bg-slate-900/60">
          <CardHeader>
            <CardTitle>Recent circle activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.circleActivity.length ? snapshot.circleActivity.map((activity) => (
              <div key={activity.id} className="rounded-2xl bg-white/90 p-4 shadow-sm dark:bg-slate-900/70">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  {formatStatusLabel(activity.action_type)}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {new Date(activity.created_at).toLocaleString()}
                </div>
              </div>
            )) : <EmptyCard message="Your circles have no recent activity." />}
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/80 shadow-sm dark:bg-slate-900/60">
          <CardHeader>
            <CardTitle>Recent notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.recentNotifications.length ? snapshot.recentNotifications.map((notification) => (
              <div key={notification.id} className="rounded-2xl bg-white/90 p-4 shadow-sm dark:bg-slate-900/70">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{notification.title}</div>
                  {!notification.is_read && <Badge variant="secondary">New</Badge>}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{notification.message}</div>
              </div>
            )) : <EmptyCard message="No notifications yet." />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="overflow-hidden border-0 bg-white/80 shadow-sm dark:bg-slate-900/60">
      <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-cyan-400/60 to-emerald-400/60" />
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

function EmptyCard({ message }: { message: string }) {
  return <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">{message}</div>;
}
