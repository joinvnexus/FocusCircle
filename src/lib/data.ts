import { endOfDay, startOfDay, subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { safePercentage } from "@/lib/utils";
import type { AppUser, CircleWorkspaceSnapshot, DashboardSnapshot, Task } from "@/types";

export async function getDashboardSnapshot(userId: string): Promise<DashboardSnapshot> {
  const supabase = await createClient();

  const todayStart = startOfDay(new Date()).toISOString();
  const todayEnd = endOfDay(new Date()).toISOString();

  const [{ data: todaysTasks }, { data: upcomingDeadlines }, { data: recentNotifications }, { data: memberships }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .or(`assigned_to.eq.${userId},created_by.eq.${userId}`)
      .gte("due_date", todayStart)
      .lte("due_date", todayEnd)
      .order("due_date", { ascending: true })
      .limit(6),
    supabase
      .from("tasks")
      .select("*")
      .or(`assigned_to.eq.${userId},created_by.eq.${userId}`)
      .not("due_date", "is", null)
      .order("due_date", { ascending: true })
      .limit(8),
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("circle_members").select("circle_id").eq("user_id", userId),
  ]);

  const circleIds = (memberships ?? []).map((row) => row.circle_id);

  const [activityResult, weekly, goalsResult] = await Promise.all([
    circleIds.length > 0
      ? supabase
          .from("activity_logs")
          .select("*")
          .in("circle_id", circleIds)
          .order("created_at", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] as never[] }),
    getWeeklyCompletedTasks(userId),
    circleIds.length > 0
      ? supabase
          .from("goals")
          .select("title, progress")
          .in("circle_id", circleIds)
          .order("updated_at", { ascending: false })
          .limit(6)
      : Promise.resolve({ data: [] as never[] }),
  ]);

  return {
    todaysTasks: (todaysTasks as DashboardSnapshot["todaysTasks"]) ?? [],
    upcomingDeadlines: (upcomingDeadlines as DashboardSnapshot["upcomingDeadlines"]) ?? [],
    recentNotifications: (recentNotifications as DashboardSnapshot["recentNotifications"]) ?? [],
    circleActivity: (activityResult.data as DashboardSnapshot["circleActivity"]) ?? [],
    weeklyCompleted:
      (weekly as DashboardSnapshot["weeklyCompleted"]) ?? [
        { day: "Mon", completed: 0 },
        { day: "Tue", completed: 0 },
        { day: "Wed", completed: 0 },
        { day: "Thu", completed: 0 },
        { day: "Fri", completed: 0 },
        { day: "Sat", completed: 0 },
        { day: "Sun", completed: 0 },
      ],
    goalProgress: (goalsResult.data ?? []).map((goal) => ({ name: goal.title, progress: goal.progress })),
  };
}

export async function getCirclesForUser(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("circle_members")
    .select("role, circles(*)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  return (data ?? []).map((entry) => ({
    role: entry.role,
    circles: Array.isArray(entry.circles) ? entry.circles[0] : entry.circles,
  }));
}

export async function getCircleWorkspace(circleId: string): Promise<CircleWorkspaceSnapshot> {
  const supabase = await createClient();

  const [{ data: circle }, { data: members }, { data: tasks }, { data: goals }, { data: activities }] = await Promise.all([
    supabase.from("circles").select("*").eq("id", circleId).single(),
    supabase
      .from("circle_members")
      .select("id, circle_id, user_id, role, joined_at, users(full_name, avatar_url, email)")
      .eq("circle_id", circleId),
    supabase
      .from("tasks")
      .select("*")
      .eq("circle_id", circleId)
      .order("created_at", { ascending: false }),
    supabase.from("goals").select("*").eq("circle_id", circleId).order("deadline", { ascending: true }),
    supabase
      .from("activity_logs")
      .select("*")
      .eq("circle_id", circleId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const commentTargetIds = [
    ...((tasks as Task[] | null)?.map((task) => task.id) ?? []),
    ...((goals ?? []).map((goal) => goal.id) ?? []),
  ];

  const { data: comments } = commentTargetIds.length
    ? await supabase
        .from("comments")
        .select("*, users(full_name, avatar_url, email)")
        .in("target_id", commentTargetIds)
        .order("created_at", { ascending: true })
    : { data: [] };

  return {
    circle,
    members: ((members ?? []).map((member) => ({
      ...member,
      users: Array.isArray(member.users) ? member.users[0] ?? null : member.users ?? null,
    })) as unknown as CircleWorkspaceSnapshot["members"]) ?? [],
    tasks: tasks ?? [],
    goals: goals ?? [],
    activities: (activities as CircleWorkspaceSnapshot["activities"]) ?? [],
    comments: (comments as CircleWorkspaceSnapshot["comments"]) ?? [],
  };
}

export async function getTaskBoardData(userId: string) {
  const supabase = await createClient();
  const [{ data: tasks }, { data: circles }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .or(`assigned_to.eq.${userId},created_by.eq.${userId}`)
      .order("created_at", { ascending: false }),
    supabase
      .from("circle_members")
      .select("circle_id, circles(id, name)")
      .eq("user_id", userId)
      .order("joined_at", { ascending: false }),
  ]);

  return {
    tasks: (tasks ?? []) as Task[],
    circles: (circles ?? [])
      .map((entry) => (Array.isArray(entry.circles) ? entry.circles[0] : entry.circles))
      .filter(Boolean),
  };
}

export async function getGoalsPageData(userId: string) {
  const supabase = await createClient();
  const { data: memberships } = await supabase.from("circle_members").select("circle_id, circles(id, name)").eq("user_id", userId);
  const circleIds = (memberships ?? []).map((item) => item.circle_id);

  const { data: goals } = circleIds.length
    ? await supabase
        .from("goals")
        .select("*, circles(name), tasks(id, status)")
        .in("circle_id", circleIds)
        .order("deadline", { ascending: true })
    : { data: [] };

  return {
    circles: (memberships ?? [])
      .map((item) => (Array.isArray(item.circles) ? item.circles[0] : item.circles))
      .filter(Boolean),
    goals: (goals ?? []).map((goal) => {
      const taskCount = goal.tasks?.length ?? 0;
      const completedTasks = goal.tasks?.filter((task: { status: string }) => task.status === "completed").length ?? 0;
      return {
        ...goal,
        circle_name: goal.circles?.name ?? "Circle",
        task_count: taskCount,
        completed_tasks: completedTasks,
        progress: goal.progress ?? safePercentage(completedTasks, taskCount),
      };
    }),
  };
}

export async function getNotificationsPageData(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getActivityPageData(userId: string) {
  const supabase = await createClient();
  const { data: memberships } = await supabase.from("circle_members").select("circle_id").eq("user_id", userId);
  const circleIds = (memberships ?? []).map((entry) => entry.circle_id);

  if (!circleIds.length) {
    return [];
  }

  const { data } = await supabase
    .from("activity_logs")
    .select("*, circles(name)")
    .in("circle_id", circleIds)
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function getProfilePageData(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("users").select("*").eq("id", userId).single();
  return data as AppUser | null;
}

export async function getAdvancedAnalytics(userId: string) {
  const supabase = await createClient();
  const start = subDays(startOfDay(new Date()), 29).toISOString();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("priority, status, updated_at")
    .or(`assigned_to.eq.${userId},created_by.eq.${userId}`)
    .gte("updated_at", start);

  const priorityCounts = new Map<string, number>([
    ["low", 0],
    ["medium", 0],
    ["high", 0],
  ]);

  const statusCounts = new Map<string, number>([
    ["todo", 0],
    ["in_progress", 0],
    ["completed", 0],
  ]);

  for (const task of tasks ?? []) {
    if (task.priority) {
      priorityCounts.set(task.priority, (priorityCounts.get(task.priority) ?? 0) + 1);
    }
    if (task.status) {
      statusCounts.set(task.status, (statusCounts.get(task.status) ?? 0) + 1);
    }
  }

  const total = tasks?.length ?? 0;
  const completed = statusCounts.get("completed") ?? 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    completionRate,
    byPriority: ["low", "medium", "high"].map((priority) => ({
      priority,
      count: priorityCounts.get(priority) ?? 0,
    })),
    byStatus: ["todo", "in_progress", "completed"].map((status) => ({
      status,
      count: statusCounts.get(status) ?? 0,
    })),
    windowStart: start,
  };
}

async function getWeeklyCompletedTasks(userId: string) {
  const supabase = await createClient();
  const start = subDays(startOfDay(new Date()), 6).toISOString();

  const { data } = await supabase
    .from("tasks")
    .select("updated_at")
    .eq("status", "completed")
    .or(`assigned_to.eq.${userId},created_by.eq.${userId}`)
    .gte("updated_at", start);

  const labelOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const counts = new Map(labelOrder.map((label) => [label, 0]));

  for (const task of data ?? []) {
    const label = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date(task.updated_at));
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return labelOrder.map((day) => ({ day, completed: counts.get(day) ?? 0 }));
}
