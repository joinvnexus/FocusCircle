import { getGoalsPageData, getTaskBoardData } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { TaskForm } from "@/components/forms/task-form";
import { RealtimeRefresh } from "@/components/shared/realtime-refresh";

export default async function TasksPage() {
  const user = await requireUser();
  const [{ tasks, circles }, { goals }] = await Promise.all([
    getTaskBoardData(user.id),
    getGoalsPageData(user.id),
  ]);
  const circleIds = (circles as Array<{ id: string }>).map((circle) => circle.id);
  const subscriptions = [
    { channel: `tasks-assigned-${user.id}`, table: "tasks", filter: `assigned_to=eq.${user.id}` },
    { channel: `tasks-created-${user.id}`, table: "tasks", filter: `created_by=eq.${user.id}` },
  ];
  if (circleIds.length) {
    subscriptions.push({
      channel: `goals-${user.id}`,
      table: "goals",
      filter: `circle_id=in.(${circleIds.join(",")})`,
    });
  }

  return (
    <div className="space-y-10">
      <RealtimeRefresh subscriptions={subscriptions} />
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/90 via-white/70 to-emerald-50/80 p-10 shadow-sm dark:from-slate-950/80 dark:via-slate-900/60 dark:to-emerald-950/30">
        <div className="absolute -left-20 top-10 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-300/10" />
        <div className="absolute right-6 top-6 h-32 w-32 rounded-full bg-cyan-400/25 blur-3xl dark:bg-cyan-300/10" />
        <div className="relative space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.3em] text-primary shadow-sm dark:bg-slate-900/70">
              Focus pipeline
            </div>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">My Tasks</h1>
            <p className="max-w-2xl text-muted-foreground">Create personal or circle tasks, then move them through the workflow.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/80 p-4 shadow-sm dark:bg-slate-900/70">
              <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Total tasks</div>
              <div className="mt-2 text-3xl font-semibold">{tasks.length}</div>
              <p className="mt-1 text-sm text-muted-foreground">Across personal and circle work</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow-sm dark:bg-slate-900/70">
              <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Active goals</div>
              <div className="mt-2 text-3xl font-semibold">{goals.length}</div>
              <p className="mt-1 text-sm text-muted-foreground">Goals connected to tasks</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="rounded-[2rem] bg-white/85 p-7 shadow-sm dark:bg-slate-900/70">
          <div className="mb-5 space-y-1">
            <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Create</div>
            <h2 className="text-2xl font-semibold">Add a new task</h2>
            <p className="text-sm text-muted-foreground">Capture personal tasks or assign them to a circle.</p>
          </div>
          <TaskForm circles={circles as unknown as Array<{ id: string; name: string }>} goalOptions={goals.map((goal) => ({ id: goal.id, title: goal.title }))} />
        </div>
        <div className="rounded-[2rem] bg-white/85 p-7 shadow-sm dark:bg-slate-900/70">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Workflow</div>
              <h2 className="text-2xl font-semibold">Kanban board</h2>
            </div>
            <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              Drag &amp; drop tasks
            </div>
          </div>
          <KanbanBoard initialTasks={tasks} />
        </div>
      </div>
    </div>
  );
}
