export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type CircleRole = "owner" | "admin" | "member";
export type CommentTargetType = "task" | "goal";

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  timezone: string;
  notification_preferences: {
    email_notifications: boolean;
    deadline_alerts: boolean;
    weekly_summary: boolean;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface Circle {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  invite_code: string;
  invite_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  role: CircleRole;
  joined_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assigned_to: string | null;
  created_by: string;
  circle_id: string | null;
  goal_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  progress: number;
  completion_status: boolean;
  circle_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  body: string;
  target_type: CommentTargetType;
  target_id: string;
  parent_id: string | null;
  user_id: string;
  mentions: string[] | null;
  reactions: Record<string, string[]> | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  circle_id: string;
  actor_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface DashboardSnapshot {
  todaysTasks: Task[];
  upcomingDeadlines: Task[];
  recentNotifications: Notification[];
  circleActivity: ActivityLog[];
  weeklyCompleted: { day: string; completed: number }[];
  goalProgress: { name: string; progress: number }[];
}

export interface CircleWorkspaceSnapshot {
  circle: Circle | null;
  members: Array<CircleMember & { users: Pick<AppUser, "full_name" | "avatar_url" | "email"> | null }>;
  tasks: Task[];
  goals: Goal[];
  activities: ActivityLog[];
  comments: Array<Comment & { users: Pick<AppUser, "full_name" | "avatar_url" | "email"> | null }>;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
