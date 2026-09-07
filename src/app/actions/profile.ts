"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { avatarSchema, profileSchema } from "@/lib/validators";

export async function updateProfileAction(payload: unknown) {
  const parsed = profileSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid profile details" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error: profileError } = await supabase
    .from("users")
    .update({
      email: parsed.data.email,
      full_name: parsed.data.fullName,
      timezone: parsed.data.timezone,
      notification_preferences: {
        email_notifications: parsed.data.emailNotifications,
        deadline_alerts: parsed.data.deadlineAlerts,
        weekly_summary: parsed.data.weeklySummary,
      },
    })
    .eq("id", user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  const authUpdates: { email?: string; password?: string } = {};
  if (parsed.data.email !== user.email) {
    authUpdates.email = parsed.data.email;
  }
  if (parsed.data.password) {
    authUpdates.password = parsed.data.password;
  }

  if (Object.keys(authUpdates).length) {
    const { error: authError } = await supabase.auth.updateUser(authUpdates);
    if (authError) {
      return { error: authError.message };
    }
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateAvatarAction(payload: unknown) {
  const parsed = avatarSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid avatar update" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("users")
    .update({ avatar_url: parsed.data.avatarUrl })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { error: null };
}
