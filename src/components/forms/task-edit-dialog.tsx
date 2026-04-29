"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TaskForm } from "./task-form";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import type { Task } from "@/types";

interface TaskEditDialogProps {
  task: Task;
  circles: Array<{ id: string; name: string }>;
  goalOptions?: Array<{ id: string; title: string }>;
  children?: React.ReactNode;
}

export function TaskEditDialog({
  task,
  circles,
  goalOptions = [],
  children,
}: TaskEditDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
{children || (
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <Edit3 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Update the task details and save changes.</DialogDescription>
        </DialogHeader>
        <TaskForm
          mode="edit"
          taskId={task.id}
          initialTask={task}
          circles={circles}
          goalOptions={goalOptions}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
