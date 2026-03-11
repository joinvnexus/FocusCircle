"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createNotificationWithEmail } from "@/lib/notifications";
import { taskSchema } from "@/lib/validators";

async function createActivityAndNotifications({
  circleId,
  actorId,
  actionType,
  entityId,
  metadata,
  notificationUserId,
  notification,
}: {
  circleId?: string | null;
  actorId: string;
  actionType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  notificationUserId?: string | null;
  notification?: { type: string; title: string; message: string; data?: Record<string, unknown> };
}) {
  const supabase = await createClient();

  if (circleId) {
    await supabase.from("activity_logs").insert({
      circle_id: circleId,
      actor_id: actorId,
      action_type: actionType,
      entity_type: "task",
      entity_id: entityId,
      metadata: metadata ?? null,
    });
  }

  if (notificationUserId && notification) {
    await createNotificationWithEmail(supabase, {
      userId: notificationUserId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data ?? null,
    });
  }
}

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

  const assignedTo = parsed.data.assignedTo || user.id;
  const circleId = parsed.data.circleId || null;
  const goalId = parsed.data.goalId || null;

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    status: parsed.data.status,
    priority: parsed.data.priority,
    due_date: parsed.data.dueDate ?? null,
    assigned_to: assignedTo,
    created_by: user.id,
    circle_id: circleId,
    goal_id: goalId,
    })
    .select("*")
    .single();

  if (error || !task) {
    return { error: error?.message ?? "Unable to create task" };
  }

  await createActivityAndNotifications({
    circleId: task.circle_id,
    actorId: user.id,
    actionType: "task_created",
    entityId: task.id,
    metadata: { title: task.title, status: task.status },
    notificationUserId: task.assigned_to && task.assigned_to !== user.id ? task.assigned_to : null,
    notification:
      task.assigned_to && task.assigned_to !== user.id
        ? {
            type: "task_assigned",
            title: "New task assignment",
            message: `You were assigned "${task.title}".`,
            data: { taskId: task.id },
          }
        : undefined,
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateTaskAction(taskId: string, payload: unknown) {
  const parsed = taskSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid task" };
  }

  const supabase = await createClient();
  const { data: currentTask } = await supabase.from("tasks").select("*").eq("id", taskId).single();
  const assignedTo = parsed.data.assignedTo || currentTask?.assigned_to || null;
  const circleId = parsed.data.circleId || null;
  const goalId = parsed.data.goalId || null;
  const { error } = await supabase
    .from("tasks")
    .update({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      due_date: parsed.data.dueDate ?? null,
      assigned_to: assignedTo,
      circle_id: circleId,
      goal_id: goalId,
    })
    .eq("id", taskId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/circles");
  return { error: null };
}

export async function updateTaskStatusAction(taskId: string, status: "todo" | "in_progress" | "completed") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: task } = await supabase.from("tasks").select("*").eq("id", taskId).single();
  const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
  if (error) {
    return { error: error.message };
  }

  if (task && user && task.circle_id) {
    await createActivityAndNotifications({
      circleId: task.circle_id,
      actorId: user.id,
      actionType: status === "completed" ? "task_completed" : "task_updated",
      entityId: task.id,
      metadata: { title: task.title, status },
    });
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
  revalidatePath("/circles");
  return { error: null };
}
