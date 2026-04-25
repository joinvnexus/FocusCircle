"use client";

import { useEffect, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { createTaskAction, updateTaskAction } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { taskSchema } from "@/lib/validators";
import type { Task, TaskPriority, TaskStatus } from "@/types";

type TaskFormValues = z.input<typeof taskSchema>;

interface TaskFormProps {
  mode: "create" | "edit";
  taskId?: string;
  initialTask?: Task | null;
  circles: Array<{ id: string; name: string }>;
  goalOptions?: Array<{ id: string; title: string }>;
  onSuccess?: () => void;
}

export function TaskForm({
  mode,
  taskId,
  initialTask,
  circles,
  goalOptions = [],
  onSuccess,
}: TaskFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      dueDate: "",
      circleId: "personal",
      assignedTo: "unassigned",
      goalId: "none",
    },
  });

  // Prefill for edit mode
  useEffect(() => {
    if (mode === "edit" && initialTask) {
      form.reset({
        title: initialTask.title,
        description: initialTask.description || "",
        priority: initialTask.priority,
        status: initialTask.status,
        dueDate: initialTask.due_date || "",
        circleId: initialTask.circle_id || "personal",
        assignedTo: initialTask.assigned_to || "unassigned",
        goalId: initialTask.goal_id || "none",
      });
    }
  }, [mode, initialTask, form]);

  const circleValue = useWatch({ control: form.control, name: "circleId" }) || "personal";
  const goalValue = useWatch({ control: form.control, name: "goalId" }) || "none";
  const priorityValue = useWatch({ control: form.control, name: "priority" }) || "medium";
  const statusValue = useWatch({ control: form.control, name: "status" }) || "todo";
  const assignedToValue = useWatch({ control: form.control, name: "assignedTo" }) || "unassigned";

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = mode === "create"
        ? await createTaskAction(values)
        : await updateTaskAction(taskId!, values);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(mode === "create" ? "Task created" : "Task updated");
      onSuccess?.();
      if (mode === "create") {
        form.reset({
          title: "",
          description: "",
          priority: "medium",
          status: "todo",
          dueDate: "",
          circleId: "personal",
          goalId: "none",
          assignedTo: "unassigned",
        });
      }
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Add Task" : "Edit Task"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} placeholder="Plan launch review" />
            {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} placeholder="Outline the work, blockers, or owner context." />
          </div>
          <FieldSelect label="Priority" value={priorityValue} onChange={(value) => form.setValue("priority", value as TaskPriority)}>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </FieldSelect>
          <FieldSelect label="Status" value={statusValue} onChange={(value) => form.setValue("status", value as TaskStatus)}>
            <SelectItem value="todo">Todo</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </FieldSelect>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" type="datetime-local" {...form.register("dueDate")} />
          </div>
          <FieldSelect
            label="Circle"
            value={circleValue}
            onChange={(value) => form.setValue("circleId", value)}
          >
            <SelectItem value="personal">Personal</SelectItem>
            {circles.map((circle) => (
              <SelectItem key={circle.id} value={circle.id}>{circle.name}</SelectItem>
            ))}
          </FieldSelect>
          <FieldSelect
            label="Goal"
            value={goalValue}
            onChange={(value) => form.setValue("goalId", value)}
          >
            <SelectItem value="none">No goal</SelectItem>
            {goalOptions.map((goal) => (
              <SelectItem key={goal.id} value={goal.id}>{goal.title}</SelectItem>
            ))}
          </FieldSelect>
          <FieldSelect
            label="Assigned to"
            value={assignedToValue}
            onChange={(value) => form.setValue("assignedTo", value)}
          >
            <SelectItem value="unassigned">Unassigned</SelectItem>
          </FieldSelect>
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : (mode === "create" ? "Create task" : "Update task")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}

