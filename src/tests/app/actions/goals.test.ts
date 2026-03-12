import { describe, expect, it, vi } from "vitest";
import { updateGoalProgressAction } from "@/app/actions/goals";
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
      if (table === "goals") {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: { circle_id: "33333333-3333-3333-3333-333333333333", title: "Goal Title" },
              }),
            }),
          }),
          update: () => ({
            eq: async () => ({ error: null }),
          }),
        };
      }
      if (table === "circle_members") {
        return {
          select: () => ({
            eq: async () => ({
              data: [
                { user_id: "11111111-1111-1111-1111-111111111111" },
                { user_id: "22222222-2222-2222-2222-222222222222" },
              ],
            }),
          }),
        };
      }
      return {};
    },
  };
}

describe("updateGoalProgressAction", () => {
  it("sends notifications to circle members excluding actor", async () => {
    const result = await updateGoalProgressAction("goal-1", 75);

    expect(result.error).toBeNull();
    const createNotificationWithEmail = vi.mocked(notificationModule.createNotificationWithEmail);
    expect(createNotificationWithEmail).toHaveBeenCalledTimes(1);
    const firstCall = createNotificationWithEmail.mock.calls.at(0);
    expect(firstCall).toBeDefined();
    expect((firstCall as unknown as [unknown, { userId: string; type: string }])[1]).toMatchObject({
      userId: "22222222-2222-2222-2222-222222222222",
      type: "goal_update",
    });
  });
});
