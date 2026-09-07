"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { subtaskSchema } from "@/lib/validators";

export async function createSubtaskAction(taskId: string, payload: unknown) {
  const parsed = subtaskSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid subtask", subtask: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", subtask: null };
  }

  const { count } = await supabase
    .from("subtasks")
    .select("id", { count: "exact", head: true })
    .eq("task_id", taskId);

  const { data: subtask, error } = await supabase
    .from("subtasks")
    .insert({
      task_id: taskId,
      title: parsed.data.title,
      created_by: user.id,
      position: count ?? 0,
    })
    .select("*")
    .single();

  if (error || !subtask) {
    return { error: error?.message ?? "Unable to create subtask", subtask: null };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/circles");
  return { error: null, subtask };
}

export async function toggleSubtaskAction(subtaskId: string, isDone: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("subtasks").update({ is_done: isDone }).eq("id", subtaskId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/circles");
  return { error: null };
}

export async function deleteSubtaskAction(subtaskId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("subtasks").delete().eq("id", subtaskId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/circles");
  return { error: null };
}
