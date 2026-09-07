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
import { Input } from "@/components/ui/input";
import { formatDate, formatStatusLabel, getPriorityColor, getSubtaskProgress } from "@/lib/utils";
import type { Task, TaskStatus, TaskPriority, Goal } from "@/types";

const columns: TaskStatus[] = ["todo", "in_progress", "completed"];
const swimlanes: TaskPriority[] = ["high", "medium", "low"];
const WIP_LIMIT_STORAGE_KEY = "focuscircle:kanban-wip-limits";

// Only columns representing active work get a WIP limit by default; "todo" and
// "completed" are unbounded backlogs/archives.
const DEFAULT_WIP_LIMITS: Partial<Record<TaskStatus, number | null>> = {
  todo: null,
  in_progress: 5,
  completed: null,
};

function loadWipLimits(): Partial<Record<TaskStatus, number | null>> {
  if (typeof window === "undefined") {
    return DEFAULT_WIP_LIMITS;
  }
  try {
    const raw = window.localStorage.getItem(WIP_LIMIT_STORAGE_KEY);
    if (!raw) return DEFAULT_WIP_LIMITS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_WIP_LIMITS, ...parsed };
  } catch {
    return DEFAULT_WIP_LIMITS;
  }
}

interface KanbanBoardProps {
  initialTasks: Task[];
  circles?: Array<{ id: string; name: string }>;
  goalOptions?: Goal[];
}

export function KanbanBoard({ initialTasks, circles = [], goalOptions = [] }: KanbanBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isPending, startTransition] = useTransition();
  const [wipLimits, setWipLimits] = useState<Partial<Record<TaskStatus, number | null>>>(loadWipLimits);
  const [groupBySwimlane, setGroupBySwimlane] = useState(false);
  const deleteTimeouts = useRef<Map<string, number>>(new Map());
  const grouped = useMemo(
    () => Object.fromEntries(columns.map((column) => [column, tasks.filter((task) => task.status === column)])),
    [tasks],
  ) as Record<TaskStatus, Task[]>;

  function persistWipLimits(next: Partial<Record<TaskStatus, number | null>>) {
    setWipLimits(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(WIP_LIMIT_STORAGE_KEY, JSON.stringify(next));
    }
  }

  function updateWipLimit(column: TaskStatus, value: string) {
    const parsed = value.trim() === "" ? null : Math.max(0, Number(value));
    persistWipLimits({ ...wipLimits, [column]: Number.isNaN(parsed) ? null : parsed });
  }

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

    const limit = wipLimits[nextStatus];
    const destinationCount = grouped[nextStatus]?.length ?? 0;
    if (typeof limit === "number" && destinationCount >= limit) {
      toast.error(`${formatStatusLabel(nextStatus)} is at its WIP limit (${limit}). Finish or move a task out first.`);
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
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant={groupBySwimlane ? "default" : "outline"}
          size="sm"
          onClick={() => setGroupBySwimlane((value) => !value)}
          data-tour="kanban-views"
        >
          {groupBySwimlane ? "Hide priority swimlanes" : "Group by priority"}
        </Button>
      </div>
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
            wipLimit={wipLimits[column] ?? null}
            onWipLimitChange={(value) => updateWipLimit(column, value)}
            groupBySwimlane={groupBySwimlane}
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
    </div>
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
  wipLimit,
  onWipLimitChange,
  groupBySwimlane,
}: {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  circles: Array<{ id: string; name: string }>;
  goalOptions: Goal[];
  onDelete: (taskId: string) => void;
  isPending: boolean;
  wipLimit: number | null;
  onWipLimitChange: (value: string) => void;
  groupBySwimlane: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });
  const isOverLimit = typeof wipLimit === "number" && tasks.length > wipLimit;
  const isAtLimit = typeof wipLimit === "number" && tasks.length === wipLimit;

  const laneGroups = useMemo(() => {
    if (!groupBySwimlane) {
      return null;
    }
    return swimlanes.map((priority) => ({
      priority,
      tasks: tasks.filter((task) => task.priority === priority),
    }));
  }, [groupBySwimlane, tasks]);

  return (
    <Card
      ref={setNodeRef}
      data-tour="kanban-column"
      className={
        isOver
          ? "border-primary shadow-md shadow-primary/10"
          : isOverLimit
            ? "border-destructive/60"
            : undefined
      }
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="flex items-center gap-2" data-tour="wip-limits">
          <Badge variant={isOverLimit ? "destructive" : isAtLimit ? "outline" : "secondary"}>
            {tasks.length}
            {typeof wipLimit === "number" ? ` / ${wipLimit}` : ""}
          </Badge>
          <Input
            type="number"
            min={0}
            placeholder="WIP"
            value={wipLimit ?? ""}
            onChange={(event) => onWipLimitChange(event.target.value)}
            className="h-8 w-16 px-2 text-xs"
            aria-label={`WIP limit for ${title}`}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isOverLimit && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            Over WIP limit — move a task out before adding more.
          </div>
        )}
        {laneGroups
          ? laneGroups.map(({ priority, tasks: laneTasks }) => (
              <div key={priority} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
                  <Badge className={getPriorityColor(priority)}>{priority}</Badge>
                  <span>{laneTasks.length}</span>
                </div>
                {laneTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={onDelete}
                    disabled={isPending}
                    circles={circles}
                    goalOptions={goalOptions}
                  />
                ))}
                {!laneTasks.length && (
                  <div className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
                    No {priority} priority tasks
                  </div>
                )}
              </div>
            ))
          : tasks.map((task) => (
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
  const subtaskProgress = getSubtaskProgress(task.subtasks);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      data-tour="task-card"
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
        {subtaskProgress.total > 0 && (
          <Badge variant={subtaskProgress.completed === subtaskProgress.total ? "success" : "outline"}>
            {subtaskProgress.completed}/{subtaskProgress.total} subtasks
          </Badge>
        )}
      </div>
    </div>
  );
}
