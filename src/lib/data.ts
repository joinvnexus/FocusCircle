import { startOfToday } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import type { DashboardSnapshot } from "@/types";

export async function getDashboardSnapshot(userId: string): Promise<DashboardSnapshot> {
  const supabase = await createClient();

  const todayIso = startOfToday().toISOString();

  const [{ data: todaysTasks }, { data: upcomingDeadlines }, { data: recentNotifications }, { data: memberships }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("assigned_to", userId)
      .gte("due_date", todayIso)
      .order("due_date", { ascending: true })
      .limit(6),
    supabase
      .from("tasks")
      .select("*")
      .eq("assigned_to", userId)
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

  const [{ data: circleActivity }, { data: weekly }, { data: goals }] = await Promise.all([
    circleIds.length > 0
      ? supabase
          .from("activity_logs")
          .select("*")
          .in("circle_id", circleIds)
          .order("created_at", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] as never[] }),
    supabase.rpc("weekly_completed_tasks", { actor_id: userId }),
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
    circleActivity: (circleActivity as DashboardSnapshot["circleActivity"]) ?? [],
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
    goalProgress: (goals ?? []).map((goal) => ({ name: goal.title, progress: goal.progress })),
  };
}

export async function getCirclesForUser(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("circle_members")
    .select("role, circles(*)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  return data ?? [];
}

export async function getCircleWorkspace(circleId: string) {
  const supabase = await createClient();

  const [{ data: circle }, { data: members }, { data: tasks }, { data: goals }, { data: activities }] = await Promise.all([
    supabase.from("circles").select("*").eq("id", circleId).single(),
    supabase
      .from("circle_members")
      .select("role, user_id, users(full_name, avatar_url, email)")
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

  return { circle, members: members ?? [], tasks: tasks ?? [], goals: goals ?? [], activities: activities ?? [] };
}
