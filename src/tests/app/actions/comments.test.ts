import { describe, expect, it, vi } from "vitest";
import { createCommentAction } from "@/app/actions/comments";
import * as notificationModule from "@/lib/notifications";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/notifications", () => ({
  createNotificationWithEmail: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => createSupabaseMock(),
}));

function createSupabaseMock() {
  return {
    auth: {
      getUser: async () => ({ data: { user: { id: "11111111-1111-1111-1111-111111111111" } } }),
    },
    from: (table: string) => {
      if (table === "comments") {
        return {
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: { id: "comment-1" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "tasks") {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: {
                  circle_id: "33333333-3333-3333-3333-333333333333",
                  title: "Task Title",
                  assigned_to: "22222222-2222-2222-2222-222222222222",
                  created_by: "44444444-4444-4444-4444-444444444444",
                },
              }),
            }),
          }),
        };
      }
      if (table === "activity_logs") {
        return { insert: async () => ({ error: null }) };
      }
      if (table === "circle_members") {
        return {
          select: () => ({
            eq: async () => ({ data: [{ user_id: "11111111-1111-1111-1111-111111111111" }] }),
          }),
        };
      }
      return {};
    },
  };
}

describe("createCommentAction", () => {
  it("notifies task assignee and creator", async () => {
    const result = await createCommentAction({
      targetType: "task",
      targetId: "9a9df8ef-7df1-4df3-8b8d-3c0e0e9f4b0d",
      body: "New comment",
    });

    expect(result.error).toBeNull();
    const createNotificationWithEmail = vi.mocked(notificationModule.createNotificationWithEmail);
    expect(createNotificationWithEmail).toHaveBeenCalledTimes(2);
    const recipients = createNotificationWithEmail.mock.calls
      .map((call) => (call as unknown as [unknown, { userId: string; type: string }])[1].userId)
      .sort();
    expect(recipients).toEqual([
      "22222222-2222-2222-2222-222222222222",
      "44444444-4444-4444-4444-444444444444",
    ]);
  });
});
