import { describe, expect, it, vi } from "vitest";
import { createNotificationWithEmail } from "@/lib/notifications";

type MockNotificationInsert = ReturnType<typeof vi.fn>;

function createSupabaseMock(profile: {
  email: string | null;
  notification_preferences: { email_notifications: boolean; deadline_alerts: boolean; weekly_summary: boolean } | null;
}) {
  const insertNotification: MockNotificationInsert = vi.fn().mockResolvedValue({ error: null });
  const selectUser = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: profile }),
    }),
  });

  const from = (table: string) => {
    if (table === "notifications") {
      return { insert: insertNotification };
    }
    if (table === "users") {
      return { select: selectUser };
    }
    return { insert: vi.fn(), select: vi.fn() };
  };

  return { from, insertNotification };
}

describe("createNotificationWithEmail", () => {
  it("sends email when enabled", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "" });
    vi.stubGlobal("fetch", fetchMock);
    process.env.RESEND_API_KEY = "test-key";
    process.env.RESEND_FROM_EMAIL = "FocusCircle <noreply@example.com>";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

    const supabase = createSupabaseMock({
      email: "user@example.com",
      notification_preferences: { email_notifications: true, deadline_alerts: true, weekly_summary: true },
    });

    await createNotificationWithEmail(supabase as never, {
      userId: "user-1",
      type: "task_assigned",
      title: "Assigned",
      message: "You were assigned a task.",
    });

    expect(supabase.insertNotification).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("skips email when preference disabled", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "" });
    vi.stubGlobal("fetch", fetchMock);
    process.env.RESEND_API_KEY = "test-key";
    process.env.RESEND_FROM_EMAIL = "FocusCircle <noreply@example.com>";

    const supabase = createSupabaseMock({
      email: "user@example.com",
      notification_preferences: { email_notifications: true, deadline_alerts: false, weekly_summary: true },
    });

    await createNotificationWithEmail(
      supabase as never,
      {
        userId: "user-2",
        type: "deadline",
        title: "Deadline soon",
        message: "Task due soon.",
      },
      "deadline_alerts",
    );

    expect(supabase.insertNotification).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
