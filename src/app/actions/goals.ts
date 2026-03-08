"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { goalSchema } from "@/lib/validators";

export async function createGoalAction(payload: unknown) {
  const parsed = goalSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid goal" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("goals").insert({
    circle_id: parsed.data.circleId,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    deadline: parsed.data.deadline ?? null,
    progress: parsed.data.progress,
    completion_status: parsed.data.completionStatus,
    created_by: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/goals");
  revalidatePath("/circles");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateGoalProgressAction(goalId: string, progress: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("goals")
    .update({ progress, completion_status: progress >= 100 })
    .eq("id", goalId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { error: null };
}
