import { getGoalsPageData, getTaskBoardData } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { TaskForm } from "@/components/forms/task-form";

export default async function TasksPage() {
  const user = await requireUser();
  const [{ tasks, circles }, { goals }] = await Promise.all([
    getTaskBoardData(user.id),
    getGoalsPageData(user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">My Tasks</h1>
        <p className="text-muted-foreground">Create personal or circle tasks, then move them through the workflow.</p>
      </div>
      <TaskForm circles={circles as unknown as Array<{ id: string; name: string }>} goalOptions={goals.map((goal) => ({ id: goal.id, title: goal.title }))} />
      <KanbanBoard initialTasks={tasks} />
    </div>
  );
}
