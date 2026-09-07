"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractMentions } from "@/lib/utils";
import { commentSchema } from "@/lib/validators";
import { createNotificationWithEmail } from "@/lib/notifications";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Resolves @mention tokens (e.g. "sam" from "@Sam") to user ids among a
 * circle's members, matching against the first word of their full name.
 */
async function resolveMentionedUserIds(
  supabase: SupabaseClient,
  circleId: string | null | undefined,
  mentions: string[],
): Promise<string[]> {
  if (!circleId || !mentions.length) {
    return [];
  }

  const { data: members } = await supabase
    .from("circle_members")
    .select("user_id, users(id, full_name)")
    .eq("circle_id", circleId);

  if (!members) {
    return [];
  }

  const mentionSet = new Set(mentions);
  const matches: string[] = [];
  for (const member of members) {
    const joinedUsers = (member as { users?: { id: string; full_name: string }[] | { id: string; full_name: string } | null }).users;
    const userRecord = Array.isArray(joinedUsers) ? joinedUsers[0] : joinedUsers;
    const fullName = userRecord?.full_name;
    if (!fullName) continue;
    const firstName = fullName.trim().split(/\s+/)[0]?.toLowerCase();
    if (firstName && mentionSet.has(firstName)) {
      matches.push(member.user_id as string);
    }
  }
  return matches;
}

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

  const mentions = extractMentions(parsed.data.body);

  const { data: comment, error } = await supabase.from("comments").insert({
    target_type: parsed.data.targetType,
    target_id: parsed.data.targetId,
    body: parsed.data.body,
    parent_id: parsed.data.parentId ?? null,
    user_id: user.id,
    mentions,
  }).select("*").single();

  if (error || !comment) {
    return { error: error?.message ?? "Unable to create comment" };
  }

  if (parsed.data.targetType === "goal") {
    const { data: goal } = await supabase
      .from("goals")
      .select("circle_id, title, created_by")
      .eq("id", parsed.data.targetId)
      .single();

    if (goal?.circle_id) {
      await supabase.from("activity_logs").insert({
        circle_id: goal.circle_id,
        actor_id: user.id,
        action_type: "comment_added",
        entity_type: "comment",
        entity_id: comment.id,
        metadata: { targetType: "goal", targetId: parsed.data.targetId },
      });

      const { data: members } = await supabase
        .from("circle_members")
        .select("user_id")
        .eq("circle_id", goal.circle_id);

      const mentionedUserIds = new Set(await resolveMentionedUserIds(supabase, goal.circle_id, mentions));

      const recipients = new Set<string>([
        ...(members ?? []).map((member) => member.user_id),
        goal.created_by,
      ]);

      recipients.delete(user.id);
      for (const mentionedId of mentionedUserIds) {
        recipients.delete(mentionedId);
      }

      await Promise.all([
        ...Array.from(recipients).map((recipientId) =>
          createNotificationWithEmail(supabase, {
            userId: recipientId,
            type: "comment",
            title: "New goal comment",
            message: `A comment was added to "${goal.title}".`,
            data: { goalId: parsed.data.targetId },
          }),
        ),
        ...Array.from(mentionedUserIds)
          .filter((id) => id !== user.id)
          .map((recipientId) =>
            createNotificationWithEmail(supabase, {
              userId: recipientId,
              type: "mention",
              title: "You were mentioned",
              message: `You were mentioned in a comment on "${goal.title}".`,
              data: { goalId: parsed.data.targetId },
            }),
          ),
      ]);
    }
  } else {
    const { data: task } = await supabase
      .from("tasks")
      .select("circle_id, title, assigned_to, created_by")
      .eq("id", parsed.data.targetId)
      .single();

    if (task?.circle_id) {
      await supabase.from("activity_logs").insert({
        circle_id: task.circle_id,
        actor_id: user.id,
        action_type: "comment_added",
        entity_type: "comment",
        entity_id: comment.id,
        metadata: { targetType: "task", targetId: parsed.data.targetId },
      });
    }

    const mentionedUserIds = new Set(await resolveMentionedUserIds(supabase, task?.circle_id, mentions));

    if (task) {
      const recipients = new Set<string>([task.assigned_to, task.created_by].filter(Boolean) as string[]);
      recipients.delete(user.id);
      for (const mentionedId of mentionedUserIds) {
        recipients.delete(mentionedId);
      }

      await Promise.all([
        ...Array.from(recipients).map((recipientId) =>
          createNotificationWithEmail(supabase, {
            userId: recipientId,
            type: "comment",
            title: "New task comment",
            message: `A comment was added to "${task.title}".`,
            data: { taskId: parsed.data.targetId },
          }),
        ),
        ...Array.from(mentionedUserIds)
          .filter((id) => id !== user.id)
          .map((recipientId) =>
            createNotificationWithEmail(supabase, {
              userId: recipientId,
              type: "mention",
              title: "You were mentioned",
              message: `You were mentioned in a comment on "${task.title}".`,
              data: { taskId: parsed.data.targetId },
            }),
          ),
      ]);
    }
  }

  revalidatePath("/activity");
  revalidatePath("/tasks");
  revalidatePath("/goals");
  revalidatePath("/circles");
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function toggleCommentReactionAction(commentId: string, emoji: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: comment, error: fetchError } = await supabase.from("comments").select("reactions").eq("id", commentId).single();
  if (fetchError) {
    return { error: fetchError.message };
  }

  const reactions = ((comment?.reactions as Record<string, string[]>) ?? {}) as Record<string, string[]>;
  const current = new Set(reactions[emoji] ?? []);
  if (current.has(user.id)) {
    current.delete(user.id);
  } else {
    current.add(user.id);
  }

  reactions[emoji] = Array.from(current);

  const { error } = await supabase.from("comments").update({ reactions }).eq("id", commentId);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/circles");
  return { error: null };
}
