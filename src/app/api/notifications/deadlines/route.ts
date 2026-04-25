import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotificationWithEmail } from "@/lib/notifications";

const HOURS_AHEAD = 24;
const DEDUPE_WINDOW_HOURS = 24;

function requireCronAuth(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const header = request.headers.get("authorization") || "";
  if (header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(request: Request) {
  const authError = requireCronAuth(request);
  if (authError) {
    return authError;
  }

  const supabase = createAdminClient();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + HOURS_AHEAD * 60 * 60 * 1000);
  const dedupeStart = new Date(now.getTime() - DEDUPE_WINDOW_HOURS * 60 * 60 * 1000);

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, due_date, assigned_to, created_by, status")
    .gte("due_date", now.toISOString())
    .lte("due_date", windowEnd.toISOString())
    .neq("status", "completed");

  if (!tasks?.length) {
    return NextResponse.json({ sent: 0 });
  }

  const recipients = tasks
    .map((task) => task.assigned_to || task.created_by)
    .filter(Boolean) as string[];
  const uniqueRecipients = Array.from(new Set(recipients));

  const { data: existingNotifications } = await supabase
    .from("notifications")
    .select("user_id, data")
    .eq("type", "deadline")
    .gte("created_at", dedupeStart.toISOString())
    .in("user_id", uniqueRecipients);

  const sentKeys = new Set(
    (existingNotifications ?? [])
      .map((notification) => {
        const taskId = (notification.data as { taskId?: string } | null)?.taskId;
        return taskId ? `${notification.user_id}:${taskId}` : null;
      })
      .filter(Boolean) as string[],
  );

  let sent = 0;

  for (const task of tasks) {
    const recipientId = task.assigned_to || task.created_by;
    if (!recipientId || !task.due_date) {
      continue;
    }
    const key = `${recipientId}:${task.id}`;
    if (sentKeys.has(key)) {
      continue;
    }

    await createNotificationWithEmail(
      supabase,
      {
        userId: recipientId,
        type: "deadline",
        title: "Upcoming deadline",
        message: `Task "${task.title}" is due within the next ${HOURS_AHEAD} hours.`,
        data: { taskId: task.id, dueDate: task.due_date },
      },
      "deadline_alerts",
    );

    sentKeys.add(key);
    sent += 1;
  }

  return NextResponse.json({ sent });
}
