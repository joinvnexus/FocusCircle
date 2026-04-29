import { getTaskBoardData } from '@/lib/data';
import { requireUser } from '@/lib/auth';
import { KanbanBoard } from '@/components/dashboard/kanban-board';
import { TaskForm } from '@/components/forms/task-form';
import { EmptyState } from '@/components/shared/empty-state';
import { QuickActionDialog } from '@/components/shared/quick-action-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RealtimeRefresh } from '@/components/shared/realtime-refresh';
import { CheckSquare2 } from 'lucide-react';

export default async function TasksPage() {
  const user = await requireUser();
  const { tasks, circles } = await getTaskBoardData(user.id);

  return (
    <div className="space-y-8">
      <RealtimeRefresh 
        subscriptions={[
          { channel: `tasks-user-${user.id}`, table: "tasks", filter: `or(created_by.eq.${user.id},assigned_to.eq.${user.id})` }
        ]} 
      />
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Tasks</h1>
            <p className="text-muted-foreground">Personal tasks and circle assignments across all boards.</p>  
          </div>
          <QuickActionDialog
            action="new-task"
            title="Create Task"
            description="Add a new task and set its details."
            triggerLabel="New task"
          >
            <TaskForm mode="create" circles={circles} />
          </QuickActionDialog>
        </div>
      </div>

      {tasks.length ? (
        <Card variant="elevated" className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Task board
              <div className="text-sm text-muted-foreground">
                {tasks.length} tasks
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
<KanbanBoard initialTasks={tasks} circles={circles} />
          </CardContent>
        </Card>
      ) : (
        <Card variant="outline" className="border-dashed">
          <CardContent className="p-4">
            <EmptyState
              title="No tasks yet"
              description="Start with a personal task or create one for a circle so the board can track momentum."
              icon={<CheckSquare2 className="h-7 w-7" />}
              illustration={<div className="flex h-28 w-32 items-center justify-center rounded-[var(--radius-2xl)] border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)]"><CheckSquare2 className="h-10 w-10 text-[var(--color-brand-primary)]" /></div>}
              className="border-0 bg-transparent"
            />
            <div className="-mt-16 flex justify-center">
              <QuickActionDialog
                action="new-task"
                title="Create Task"
                description="Add a new task and set its details."
                triggerLabel="Create task"
              >
                <TaskForm mode="create" circles={circles} />
              </QuickActionDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

