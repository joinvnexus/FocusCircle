import { describe, expect, it, vi } from "vitest";
import { createTaskAction } from "@/app/actions/tasks";
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
      getUser: async () => ({
        data: { user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "user@example.com" } },
      }),
    },
    from: (table: string) => {
      if (table === "tasks") {
        return {
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: {
                  id: "9a9df8ef-7df1-4df3-8b8d-3c0e0e9f4b0d",
                  title: "Task Title",
                  status: "todo",
                  circle_id: "2f1c9e3b-4c7a-4d47-8f5e-2a0e6b9f4a2c",
                  assigned_to: "a2b3c4d5-6e7f-4a5b-8c9d-0e1f2a3b4c5d",
                },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "activity_logs") {
        return { insert: async () => ({ error: null }) };
      }
      if (table === "notifications") {
        return { insert: async () => ({ error: null }) };
      }
      return {};
    },
  };
}

describe("createTaskAction", () => {
  it("creates a task and sends assignment notification", async () => {
    const result = await createTaskAction({
      title: "Task Title",
      description: "Test",
      priority: "medium",
      status: "todo",
      dueDate: "",
      circleId: "2f1c9e3b-4c7a-4d47-8f5e-2a0e6b9f4a2c",
      assignedTo: "a2b3c4d5-6e7f-4a5b-8c9d-0e1f2a3b4c5d",
      goalId: "",
    });

    expect(result.error).toBeNull();
    const createNotificationWithEmail = vi.mocked(notificationModule.createNotificationWithEmail);
    expect(createNotificationWithEmail).toHaveBeenCalledTimes(1);
    const firstCall = createNotificationWithEmail.mock.calls.at(0);
    expect(firstCall).toBeDefined();
    expect((firstCall as unknown as [unknown, { userId: string; type: string }])[1]).toMatchObject({
      userId: "a2b3c4d5-6e7f-4a5b-8c9d-0e1f2a3b4c5d",
      type: "task_assigned",
    });
  });
});
