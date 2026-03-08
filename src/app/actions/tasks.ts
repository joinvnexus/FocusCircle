"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { taskSchema } from "@/lib/validators";

export async function createTaskAction(payload: unknown) {
  const parsed = taskSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid task" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase.from("tasks").insert({
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    status: parsed.data.status,
    priority: parsed.data.priority,
    due_date: parsed.data.dueDate ?? null,
    assigned_to: parsed.data.assignedTo ?? user.id,
    created_by: user.id,
    circle_id: parsed.data.circleId ?? null,
    goal_id: parsed.data.goalId ?? null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateTaskStatusAction(taskId: string, status: "todo" | "in_progress" | "completed") {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/circles");
  return { error: null };
}

export async function deleteTaskAction(taskId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { error: null };
}
