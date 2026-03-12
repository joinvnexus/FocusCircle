"use server";

import { addDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { randomInviteCode } from "@/lib/utils";
import { circleSchema } from "@/lib/validators";

export async function createCircleAction(payload: unknown) {
  const parsed = circleSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid circle" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const inviteCode = randomInviteCode();
  const { data: circle, error } = await supabase
    .from("circles")
    .insert({
      owner_id: user.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      invite_code: inviteCode,
      invite_expires_at: addDays(new Date(), 14).toISOString(),
    })
    .select("id")
    .single();

  if (error || !circle) {
    return { error: error?.message ?? "Could not create circle" };
  }

  await supabase.from("circle_members").insert({
    circle_id: circle.id,
    user_id: user.id,
    role: "owner",
  });

  await supabase.from("activity_logs").insert({
    circle_id: circle.id,
    actor_id: user.id,
    action_type: "circle_created",
    entity_type: "circle",
    entity_id: circle.id,
    metadata: { name: parsed.data.name },
  });

  revalidatePath("/circles");
  return { error: null };
}

export async function joinCircleAction(inviteCode: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const normalizedCode = inviteCode.replace(/[^a-z0-9]/gi, "").toUpperCase();
  if (!normalizedCode) return { error: "Invite code is required" };

  const { data: circleId, error } = await supabase.rpc("join_circle_by_invite", {
    invite_code_input: normalizedCode,
  });

  if (error || !circleId) return { error: "Invite code not found" };

  const { error: membershipError } = await supabase.from("circle_members").upsert(
    {
      circle_id: circleId,
      user_id: user.id,
      role: "member",
    },
    { onConflict: "circle_id,user_id" },
  );

  if (membershipError) {
    return { error: membershipError.message };
  }

  await supabase.from("activity_logs").insert({
    circle_id: circleId,
    actor_id: user.id,
    action_type: "member_joined",
    entity_type: "circle_member",
    entity_id: circleId,
    metadata: { userId: user.id },
  });

  revalidatePath("/circles");
  return { error: null };
}

export async function updateCircleMemberRoleAction(circleId: string, userId: string, role: "owner" | "admin" | "member") {
  const supabase = await createClient();
  const { error } = await supabase.from("circle_members").update({ role }).eq("circle_id", circleId).eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/circles/${circleId}`);
  return { error: null };
}
