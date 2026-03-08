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

  revalidatePath("/circles");
  return { error: null };
}

export async function joinCircleAction(inviteCode: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: circle, error } = await supabase
    .from("circles")
    .select("id")
    .eq("invite_code", inviteCode.trim().toUpperCase())
    .single();

  if (error || !circle) return { error: "Invite code not found" };

  const { error: membershipError } = await supabase.from("circle_members").upsert(
    {
      circle_id: circle.id,
      user_id: user.id,
      role: "member",
    },
    { onConflict: "circle_id,user_id" },
  );

  if (membershipError) {
    return { error: membershipError.message };
  }

  revalidatePath("/circles");
  return { error: null };
}
