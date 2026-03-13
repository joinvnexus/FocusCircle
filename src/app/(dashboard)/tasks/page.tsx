import { getTaskBoardData } from '@/lib/data';
import { requireUser } from '@/lib/auth';
import { KanbanBoard } from '@/components/dashboard/kanban-board';
import { TaskForm } from '@/components/forms/task-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { RealtimeRefresh } from '@/components/shared/realtime-refresh';
import { Plus } from 'lucide-react';

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
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl p-0">
              <TaskForm circles={circles} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {tasks.length ? (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Task board
              <div className="text-sm text-muted-foreground">
                {tasks.length} tasks
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KanbanBoard initialTasks={tasks} />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="text-center p-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-2xl flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">No tasks yet</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first task.</p>
            <Dialog>
              <DialogTrigger asChild>  
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl p-0">
                <TaskForm circles={circles} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

