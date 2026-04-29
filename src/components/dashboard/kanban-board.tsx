"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { toast } from "sonner";
import { Trash2, Edit3 } from "lucide-react";
import { TaskEditDialog } from "@/components/forms/task-edit-dialog";
import { deleteTaskAction, updateTaskStatusAction } from "@/app/actions/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatStatusLabel, getPriorityColor } from "@/lib/utils";
import type { Task, TaskStatus, Goal } from "@/types";

const columns: TaskStatus[] = ["todo", "in_progress", "completed"];

interface KanbanBoardProps {
  initialTasks: Task[];
  circles?: Array<{ id: string; name: string }>;
  goalOptions?: Goal[];
}

export function KanbanBoard({ initialTasks, circles = [], goalOptions = [] }: KanbanBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isPending, startTransition] = useTransition();
  const deleteTimeouts = useRef<Map<string, number>>(new Map());
  const grouped = useMemo(
    () => Object.fromEntries(columns.map((column) => [column, tasks.filter((task) => task.status === column)])),
    [tasks],
  ) as Record<TaskStatus, Task[]>;

  function handleDragEnd(event: DragEndEvent) {
    const taskId = String(event.active.id);
    const nextStatus = event.over?.id as TaskStatus | undefined;
    if (!nextStatus || !columns.includes(nextStatus)) {
      return;
    }

    const current = tasks.find((task) => task.id === taskId);
    if (!current || current.status === nextStatus) {
      return;
    }

    const previous = tasks;
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: nextStatus } : task)));
    startTransition(async () => {
      const result = await updateTaskStatusAction(taskId, nextStatus);
      if (result.error) {
        toast.error(result.error);
        setTasks(previous);
      }
    });
  }

  useEffect(() => {
    const timeouts = deleteTimeouts.current;
    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
      timeouts.clear();
    };
  }, []);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <KanbanColumn
            key={column}
            id={column}
            title={formatStatusLabel(column)}
            tasks={grouped[column]}
            circles={circles}
            goalOptions={goalOptions}
            onDelete={(taskId) => {
              const task = tasks.find((entry) => entry.id === taskId);
              if (!task) {
                return;
              }

              setTasks((prev) => prev.filter((entry) => entry.id !== taskId));

              const timeout = window.setTimeout(() => {
                deleteTimeouts.current.delete(taskId);
                startTransition(async () => {
                  const result = await deleteTaskAction(taskId);
                  if (result.error) {
                    toast.error(result.error);
                    setTasks((prev) => [task, ...prev]);
                  }
                });
              }, 4000);

              deleteTimeouts.current.set(taskId, timeout);

              toast.message(`Deleted "${task.title}"`, {
                action: {
                  label: "Undo",
                  onClick: () => {
                    const pendingTimeout = deleteTimeouts.current.get(taskId);
                    if (pendingTimeout) {
                      window.clearTimeout(pendingTimeout);
                      deleteTimeouts.current.delete(taskId);
                    }
                    setTasks((prev) => {
                      if (prev.some((entry) => entry.id === task.id)) {
                        return prev;
                      }
                      return [...prev, task].sort((left, right) => columns.indexOf(left.status) - columns.indexOf(right.status));
                    });
                  },
                },
              });
            }}
            isPending={isPending}
          />
        ))}
      </div>
    </DndContext>
  );
}

function KanbanColumn({
  id,
  title,
  tasks,
  circles,
  goalOptions,
  onDelete,
  isPending,
}: {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  circles: Array<{ id: string; name: string }>;
  goalOptions: Goal[];
  onDelete: (taskId: string) => void;
  isPending: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <Card ref={setNodeRef} className={isOver ? "border-primary shadow-md shadow-primary/10" : undefined}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <Badge variant="secondary">{tasks.length}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={onDelete}
            disabled={isPending}
            circles={circles}
            goalOptions={goalOptions}
          />
        ))}
        {!tasks.length && <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Drop tasks here</div>}
      </CardContent>
    </Card>
  );
}

function TaskCard({ 
  task, 
  onDelete, 
  disabled, 
  circles = [], 
  goalOptions = [],
}: { 
  task: Task; 
  onDelete: (taskId: string) => void; 
  disabled: boolean;
  circles?: Array<{ id: string; name: string }>;
  goalOptions?: Array<{ id: string; title: string }>;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-2xl border bg-card p-4 shadow-sm transition ${isDragging ? "opacity-70 shadow-lg" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="font-medium">{task.title}</div>
          {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
        </div>
        <div className="flex gap-1">
          <TaskEditDialog 
            task={task} 
            circles={circles}
            goalOptions={goalOptions}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              className="h-8 w-8 p-0"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <Edit3 className="h-4 w-4" />
              <span className="sr-only">Edit task</span>
            </Button>
          </TaskEditDialog>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete task</span>
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
        {task.due_date && <Badge variant="outline">Due {formatDate(task.due_date)}</Badge>}
        {task.circle_id && <Badge variant="secondary">Circle task</Badge>}
      </div>
    </div>
  );
}
