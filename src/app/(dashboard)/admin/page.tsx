import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  const [{ data: users }, { data: subscriptions }] = await Promise.all([
    supabase
      .from("users")
      .select("id, email, full_name, plan, is_admin, circle_limit, member_limit, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("subscriptions")
      .select("user_id, status, price_id, current_period_end, cancel_at_period_end")
      .order("current_period_end", { ascending: false }),
  ]);

  const activeCount = (subscriptions ?? []).filter((sub) => sub.status === "active" || sub.status === "trialing").length;
  const estimatedMrr = activeCount * 9;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Admin</h1>
        <p className="text-muted-foreground">User accounts, subscriptions, and revenue signals.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Active subscriptions</div>
            <div className="mt-2 text-3xl font-semibold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Estimated MRR</div>
            <div className="mt-2 text-3xl font-semibold">${estimatedMrr}</div>
            <div className="text-xs text-muted-foreground">Based on $9 Pro plan</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Total users</div>
            <div className="mt-2 text-3xl font-semibold">{users?.length ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(users ?? []).map((u) => {
            const sub = subscriptions?.find((item) => item.user_id === u.id);
            return (
              <div key={u.id} className="flex flex-col gap-2 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-medium">{u.full_name || "Unnamed"}</div>
                  <div className="text-sm text-muted-foreground">{u.email}</div>
                  <div className="text-xs text-muted-foreground">
                    Plan: {u.plan} {u.is_admin ? "(admin)" : ""}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Subscription: {sub?.status ?? "none"}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
