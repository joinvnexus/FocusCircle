"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markNotificationReadAction(notificationId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function markAllNotificationsReadAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function markNotificationsReadAction(notificationIds: string[]) {
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").update({ is_read: true }).in("id", notificationIds);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteNotificationsAction(notificationIds: string[]) {
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").delete().in("id", notificationIds);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  return { error: null };
}
