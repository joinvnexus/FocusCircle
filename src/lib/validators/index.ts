import { z } from "zod";

const optionalUuid = z.union([z.string().uuid(), z.literal("")]).optional().transform((value) => {
  if (!value) {
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
  description: z.string().max(600).optional(),
  dueDate: optionalDateString,
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "in_progress", "completed"]).default("todo"),
  circleId: optionalUuid,
  assignedTo: optionalUuid,
  goalId: optionalUuid,
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
