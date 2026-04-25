import { z } from "zod";

const optionalCircleId = z
  .union([z.string().uuid(), z.literal(""), z.literal("personal")])
  .optional()
  .transform((value) => {
    if (!value || value === "personal") {
      return undefined;
    }

    return value;
  });

const optionalAssigneeId = z
  .union([z.string().uuid(), z.literal(""), z.literal("unassigned")])
  .optional()
  .transform((value) => {
    if (!value || value === "unassigned") {
      return undefined;
    }

    return value;
  });

const optionalGoalId = z
  .union([z.string().uuid(), z.literal(""), z.literal("none")])
  .optional()
  .transform((value) => {
    if (!value || value === "none") {
      return undefined;
    }

    return value;
  });
const optionalDateString = z.union([z.string().min(1), z.literal("")]).optional().transform((value) => {
  if (!value) {
    return undefined;
  }

  return value;
});

export const signUpSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signInSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const profileSchema = z.object({
  fullName: z.string().min(2),
  timezone: z.string().min(2),
  email: z.email("Enter a valid email"),
  emailNotifications: z.boolean().default(true),
  deadlineAlerts: z.boolean().default(true),
  weeklySummary: z.boolean().default(false),
  password: z.string().min(8).optional().or(z.literal("")),
});

export const avatarSchema = z.object({
  avatarUrl: z.string().url().nullable(),
});

export const taskSchema = z.object({
  title: z.string().min(2),

  description: z.string().max(600),

  dueDate: optionalDateString,

  priority: z.enum(["low", "medium", "high"]),

  status: z.enum(["todo", "in_progress", "completed"]),

  circleId: optionalCircleId,

  assignedTo: optionalAssigneeId,

  goalId: optionalGoalId,
});

export const circleSchema = z.object({
  name: z.string().min(2),
  description: z.string().max(500).optional(),
});

export const goalSchema = z.object({
  circleId: z.string().min(1),
  title: z.string().min(2),
  description: z.string().max(800).optional(),
  deadline: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  completionStatus: z.boolean().default(false),
});

export const commentSchema = z.object({
  targetType: z.enum(["task", "goal"]),
  targetId: z.string().uuid(),
  body: z.string().min(1).max(1000),
  parentId: z.string().uuid().optional(),
});

export const passwordResetRequestSchema = z.object({
  email: z.email("Enter a valid email"),
});

export const passwordResetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const adminUserUpdateSchema = z.object({
  userId: z.string().uuid(),
  isAdmin: z.boolean().optional(),
  plan: z.enum(["free", "pro"]).optional(),
  circleLimit: z.number().int().min(1).max(1000).optional(),
  memberLimit: z.number().int().min(1).max(1000).optional(),
});

export const adminSubscriptionUpdateSchema = z.object({
  subscriptionId: z.string().uuid(),
  status: z.string().min(2).optional(),
  priceId: z.string().min(2).optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  currentPeriodEnd: z.string().optional(),
});
