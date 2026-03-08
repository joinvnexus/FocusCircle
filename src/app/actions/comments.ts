"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { commentSchema } from "@/lib/validators";

export async function createCommentAction(payload: unknown) {
  const parsed = commentSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid comment" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("comments").insert({
    target_type: parsed.data.targetType,
    target_id: parsed.data.targetId,
    body: parsed.data.body,
    parent_id: parsed.data.parentId ?? null,
    user_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/activity");
  revalidatePath("/tasks");
  revalidatePath("/goals");
  return { error: null };
}
