"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminSubscriptionUpdateSchema, adminUserUpdateSchema } from "@/lib/validators";

async function ensureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", user: null };
  }

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) {
    return { error: "Forbidden", user: null, supabase };
  }

  return { error: null, user, supabase };
}

export async function updateAdminUserAction(payload: unknown) {
  const parsed = adminUserUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid admin update" };
  }

  const adminCheck = await ensureAdmin();
  if (adminCheck.error) {
    return { error: adminCheck.error };
  }

  const updates: Record<string, unknown> = {};
  if (typeof parsed.data.isAdmin === "boolean") {
    updates.is_admin = parsed.data.isAdmin;
  }
  if (parsed.data.plan) {
    updates.plan = parsed.data.plan;
  }
  if (typeof parsed.data.circleLimit === "number") {
    updates.circle_limit = parsed.data.circleLimit;
  }
  if (typeof parsed.data.memberLimit === "number") {
    updates.member_limit = parsed.data.memberLimit;
  }

  if (!Object.keys(updates).length) {
    return { error: "No updates provided" };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.from("users").update(updates).eq("id", parsed.data.userId);
  if (error) {
    return { error: error.message };
  }

  await adminCheck.supabase.from("audit_logs").insert({
    actor_id: adminCheck.user?.id,
    action: "admin.user.update",
    target_type: "user",
    target_id: parsed.data.userId,
    metadata: updates,
  });

  revalidatePath("/admin");
  return { error: null };
}

export async function updateAdminSubscriptionAction(payload: unknown) {
  const parsed = adminSubscriptionUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid subscription update" };
  }

  const adminCheck = await ensureAdmin();
  if (adminCheck.error) {
    return { error: adminCheck.error };
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.status) {
    updates.status = parsed.data.status;
  }
  if (parsed.data.priceId) {
    updates.price_id = parsed.data.priceId;
  }
  if (typeof parsed.data.cancelAtPeriodEnd === "boolean") {
    updates.cancel_at_period_end = parsed.data.cancelAtPeriodEnd;
  }
  if (parsed.data.currentPeriodEnd) {
    updates.current_period_end = parsed.data.currentPeriodEnd;
  }

  if (!Object.keys(updates).length) {
    return { error: "No updates provided" };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.from("subscriptions").update(updates).eq("id", parsed.data.subscriptionId);
  if (error) {
    return { error: error.message };
  }

  await adminCheck.supabase.from("audit_logs").insert({
    actor_id: adminCheck.user?.id,
    action: "admin.subscription.update",
    target_type: "subscription",
    target_id: parsed.data.subscriptionId,
    metadata: updates,
  });

  revalidatePath("/admin");
  return { error: null };
}
