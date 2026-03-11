"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { createTaskAction } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { taskSchema } from "@/lib/validators";
import type { TaskPriority, TaskStatus } from "@/types";

const formSchema = taskSchema.extend({
  title: taskSchema.shape.title,
});

type TaskFormValues = z.input<typeof formSchema>;

export function TaskForm({
  circles,
  goalOptions = [],
}: {
  circles: Array<{ id: string; name: string }>;
  goalOptions?: Array<{ id: string; title: string }>;
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      dueDate: "",
      circleId: "personal",
      goalId: "none",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await createTaskAction({
        ...values,
        circleId: values.circleId === "personal" ? undefined : values.circleId,
        goalId: values.goalId === "none" ? undefined : values.goalId,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Task created");
      form.reset({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        dueDate: "",
        circleId: "personal",
        goalId: "none",
      });
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} placeholder="Plan launch review" />
            <p className="text-xs text-destructive">{form.formState.errors.title?.message}</p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} placeholder="Outline the work, blockers, or owner context." />
          </div>
          <FieldSelect label="Priority" value={form.watch("priority")} onChange={(value) => form.setValue("priority", value as TaskPriority)}>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </FieldSelect>
          <FieldSelect label="Status" value={form.watch("status") ?? "todo"} onChange={(value) => form.setValue("status", value as TaskStatus)}>
            <SelectItem value="todo">Todo</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </FieldSelect>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" type="datetime-local" {...form.register("dueDate")} />
          </div>
          <FieldSelect label="Circle" value={form.watch("circleId") ?? "personal"} onChange={(value) => form.setValue("circleId", value)}>
            <SelectItem value="personal">Personal</SelectItem>
            {circles.map((circle) => (
              <SelectItem key={circle.id} value={circle.id}>{circle.name}</SelectItem>
            ))}
          </FieldSelect>
          <FieldSelect label="Goal" value={form.watch("goalId") ?? "none"} onChange={(value) => form.setValue("goalId", value)}>
            <SelectItem value="none">No goal</SelectItem>
            {goalOptions.map((goal) => (
              <SelectItem key={goal.id} value={goal.id}>{goal.title}</SelectItem>
            ))}
          </FieldSelect>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Create task"}</Button>
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
