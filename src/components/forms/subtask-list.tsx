"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { getSubtaskProgress } from "@/lib/utils";
import { createSubtaskAction, deleteSubtaskAction, toggleSubtaskAction } from "@/app/actions/subtasks";
import type { Subtask } from "@/types";

interface SubtaskListProps {
  taskId: string;
  initialSubtasks: Subtask[];
}

export function SubtaskList({ taskId, initialSubtasks }: SubtaskListProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks);
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const progress = getSubtaskProgress(subtasks);

  function handleAdd() {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }

    setTitle("");
    startTransition(async () => {
      const result = await createSubtaskAction(taskId, { title: trimmed });
      if (result.error || !result.subtask) {
        toast.error(result.error ?? "Unable to add subtask");
        return;
      }
      setSubtasks((prev) => [...prev, result.subtask as Subtask]);
    });
  }

  function handleToggle(subtaskId: string, nextDone: boolean) {
    const previous = subtasks;
    setSubtasks((prev) => prev.map((item) => (item.id === subtaskId ? { ...item, is_done: nextDone } : item)));
    startTransition(async () => {
      const result = await toggleSubtaskAction(subtaskId, nextDone);
      if (result.error) {
        toast.error(result.error);
        setSubtasks(previous);
      }
    });
  }

  function handleDelete(subtaskId: string) {
    const previous = subtasks;
    setSubtasks((prev) => prev.filter((item) => item.id !== subtaskId));
    startTransition(async () => {
      const result = await deleteSubtaskAction(subtaskId);
      if (result.error) {
        toast.error(result.error);
        setSubtasks(previous);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Subtasks</h4>
        {progress.total > 0 && (
          <span className="text-xs text-muted-foreground">
            {progress.completed}/{progress.total} done
          </span>
        )}
      </div>

      {progress.total > 0 && <Progress value={progress.percent} aria-label="Subtask completion" />}

      <ul className="space-y-2">
        {subtasks
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((subtask) => (
            <li key={subtask.id} className="flex items-center gap-2">
              <Checkbox
                checked={subtask.is_done}
                disabled={isPending}
                onCheckedChange={(checked) => handleToggle(subtask.id, checked)}
                aria-label={`Mark "${subtask.title}" as ${subtask.is_done ? "not done" : "done"}`}
              />
              <span className={`flex-1 text-sm ${subtask.is_done ? "text-muted-foreground line-through" : ""}`}>
                {subtask.title}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={isPending}
                onClick={() => handleDelete(subtask.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">Delete subtask</span>
              </Button>
            </li>
          ))}
        {!subtasks.length && <li className="text-xs text-muted-foreground">No subtasks yet.</li>}
      </ul>

      <div className="flex items-center gap-2">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a subtask"
          className="h-8 text-sm"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button type="button" size="sm" variant="outline" disabled={isPending || !title.trim()} onClick={handleAdd}>
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
    </div>
  );
}
