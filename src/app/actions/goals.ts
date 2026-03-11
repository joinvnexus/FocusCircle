"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { goalSchema } from "@/lib/validators";
import { createNotificationWithEmail } from "@/lib/notifications";

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

  const { data: goal, error } = await supabase
    .from("goals")
    .insert({
      circle_id: parsed.data.circleId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      deadline: parsed.data.deadline ?? null,
      progress: parsed.data.progress,
      completion_status: parsed.data.completionStatus,
      created_by: user.id,
    })
    .select("id, title")
    .single();

  if (error || !goal) {
    return { error: error.message };
  }

  await supabase.from("activity_logs").insert({
    circle_id: parsed.data.circleId,
    actor_id: user.id,
    action_type: "goal_created",
    entity_type: "goal",
    entity_id: goal.id,
    metadata: { title: goal.title },
  });

  const { data: members } = await supabase
    .from("circle_members")
    .select("user_id")
    .eq("circle_id", parsed.data.circleId);

  const recipients = new Set((members ?? []).map((member) => member.user_id));
  recipients.delete(user.id);

  await Promise.all(
    Array.from(recipients).map((recipientId) =>
      createNotificationWithEmail(supabase, {
        userId: recipientId,
        type: "goal_created",
        title: "New goal created",
        message: `A new goal "${goal.title}" was added to your circle.`,
        data: { goalId: goal.id },
      }),
    ),
  );

  revalidatePath("/goals");
  revalidatePath("/circles");
  revalidatePath("/dashboard");
  revalidatePath("/notifications");
  return { error: null };
}

export async function updateGoalProgressAction(goalId: string, progress: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: goal } = await supabase
    .from("goals")
    .select("circle_id, title")
    .eq("id", goalId)
    .single();

  const { error } = await supabase
    .from("goals")
    .update({ progress, completion_status: progress >= 100 })
    .eq("id", goalId);

  if (error) {
    return { error: error.message };
  }

  if (goal?.circle_id) {
    const { data: members } = await supabase
      .from("circle_members")
      .select("user_id")
      .eq("circle_id", goal.circle_id);

    const recipients = new Set((members ?? []).map((member) => member.user_id));
    recipients.delete(user.id);

    await Promise.all(
      Array.from(recipients).map((recipientId) =>
        createNotificationWithEmail(supabase, {
          userId: recipientId,
          type: "goal_updated",
          title: "Goal progress updated",
          message: `Progress on "${goal.title}" is now ${progress}%.`,
          data: { goalId },
        }),
      ),
    );
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  revalidatePath("/notifications");
  return { error: null };
}
