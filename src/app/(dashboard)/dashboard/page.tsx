import { Bell, CalendarClock, CheckCircle2, TrendingUp, Users } from "lucide-react";
import { getDashboardSnapshot } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { formatDate, formatRelativeTime, formatStatusLabel, getPriorityColor, getStatusColor } from "@/lib/utils";
import { GoalProgressChart, WeeklyTasksChart } from "@/components/dashboard/productivity-charts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RealtimeRefresh } from "@/components/shared/realtime-refresh";

export default async function DashboardPage() {
  const user = await requireUser();
  const snapshot = await getDashboardSnapshot(user.id);
  const completedThisWeek = snapshot.weeklyCompleted.reduce((sum, item) => sum + item.completed, 0);

  return (
    <div className="space-y-6">
      <RealtimeRefresh
        subscriptions={[
          { channel: `tasks-assigned-${user.id}`, table: "tasks", filter: `assigned_to=eq.${user.id}` },
          { channel: `tasks-created-${user.id}`, table: "tasks", filter: `created_by=eq.${user.id}` },
          { channel: `notifications-${user.id}`, table: "notifications", filter: `user_id=eq.${user.id}` },
        ]}
      />
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Today&apos;s workload, circle momentum, and your recent productivity signal.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Completed this week" value={String(completedThisWeek)} icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} />
        <MetricCard title="Today&apos;s tasks" value={String(snapshot.todaysTasks.length)} icon={<CalendarClock className="h-5 w-5 text-primary" />} />
        <MetricCard title="Circle activity" value={String(snapshot.circleActivity.length)} icon={<Users className="h-5 w-5 text-chart-2" />} />
        <MetricCard title="Unread notifications" value={String(snapshot.recentNotifications.filter((item) => !item.is_read).length)} icon={<Bell className="h-5 w-5 text-chart-4" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Weekly productivity</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyTasksChart data={snapshot.weeklyCompleted} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Goal completion rate</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalProgressChart data={snapshot.goalProgress} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.todaysTasks.length ? snapshot.todaysTasks.map((task) => (
              <div key={task.id} className="rounded-2xl border p-4">
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

        <Card>
          <CardHeader>
            <CardTitle>Upcoming deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.upcomingDeadlines.length ? snapshot.upcomingDeadlines.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-2xl border p-4">
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
        <Card>
          <CardHeader>
            <CardTitle>Recent circle activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.circleActivity.length ? snapshot.circleActivity.map((activity) => (
              <div key={activity.id} className="rounded-2xl border p-4">
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

        <Card>
          <CardHeader>
            <CardTitle>Recent notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.recentNotifications.length ? snapshot.recentNotifications.map((notification) => (
              <div key={notification.id} className="rounded-2xl border p-4">
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
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="mt-1 text-3xl font-semibold">{value}</div>
        </div>
        <div className="rounded-2xl bg-secondary p-3">{icon}</div>
      </CardContent>
    </Card>
  );
}

function EmptyCard({ message }: { message: string }) {
  return <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">{message}</div>;
}
