import { describe, expect, it } from "vitest";
import {
  signInSchema,
  signUpSchema,
  profileSchema,
  taskSchema,
  goalSchema,
  commentSchema,
} from "@/lib/validators";

describe("validators", () => {
  it("accepts valid sign up payloads", () => {
    const result = signUpSchema.safeParse({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid sign in payloads", () => {
    const result = signInSchema.safeParse({
      email: "not-an-email",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("accepts profile updates with empty password", () => {
    const result = profileSchema.safeParse({
      fullName: "Grace Hopper",
      timezone: "UTC",
      email: "grace@example.com",
      emailNotifications: true,
      deadlineAlerts: false,
      weeklySummary: false,
      password: "",
    });
    expect(result.success).toBe(true);
  });

  it("normalizes optional task relations", () => {
    const result = taskSchema.safeParse({
      title: "Write tests",
      description: "Add unit tests",
      dueDate: undefined,
      priority: "medium",
      status: "todo",
      circleId: "",
      assignedTo: "",
      goalId: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.circleId).toBeUndefined();
      expect(result.data.assignedTo).toBeUndefined();
      expect(result.data.goalId).toBeUndefined();
    }
  });

  it("accepts goal payloads", () => {
    const result = goalSchema.safeParse({
      circleId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Launch FocusCircle",
      description: "Ship v1",
      deadline: "2030-01-01",
      progress: 40,
      completionStatus: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects comments without body", () => {
    const result = commentSchema.safeParse({
      targetType: "task",
      targetId: "550e8400-e29b-41d4-a716-446655440000",
      body: "",
    });
    expect(result.success).toBe(false);
  });
});
