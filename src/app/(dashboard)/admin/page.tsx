import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminUserRow } from "@/components/admin/admin-user-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 20;

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: { q?: string; page?: string };
}) {
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

  const query = typeof searchParams?.q === "string" ? searchParams.q.trim() : "";
  const pageNumber = Math.max(1, Number(searchParams?.page ?? "1") || 1);
  const rangeStart = (pageNumber - 1) * PAGE_SIZE;
  const rangeEnd = rangeStart + PAGE_SIZE - 1;

  let usersQuery = supabase
    .from("users")
    .select("id, email, full_name, plan, is_admin, circle_limit, member_limit, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(rangeStart, rangeEnd);

  if (query) {
    usersQuery = usersQuery.or(`email.ilike.%${query}%,full_name.ilike.%${query}%`);
  }

  const [{ data: users, count }, { data: auditLogs }, { count: activeCountRaw }] = await Promise.all([
    usersQuery,
    supabase
      .from("audit_logs")
      .select("id, actor_id, action, target_type, target_id, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .in("status", ["active", "trialing"]),
  ]);

  const userIds = (users ?? []).map((u) => u.id);
  const { data: scopedSubscriptions } =
    userIds.length > 0
      ? await supabase
          .from("subscriptions")
          .select("id, user_id, status, price_id, current_period_end, cancel_at_period_end")
          .in("user_id", userIds)
      : { data: [] };

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const buildPageLink = (targetPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("page", String(targetPage));
    return `?${params.toString()}`;
  };

  const activeCount = activeCountRaw ?? 0;
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
            <div className="mt-2 text-3xl font-semibold">{totalCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Users</CardTitle>
            <form className="flex w-full max-w-md gap-2">
              <Input name="q" placeholder="Search by name or email" defaultValue={query} />
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {(users ?? []).map((u) => {
            const sub = scopedSubscriptions?.find((item) => item.user_id === u.id);
            return (
              <AdminUserRow
                key={u.id}
                user={{
                  id: u.id,
                  email: u.email,
                  full_name: u.full_name,
                  plan: (u.plan ?? "free") as "free" | "pro",
                  is_admin: u.is_admin ?? false,
                  circle_limit: u.circle_limit,
                  member_limit: u.member_limit,
                  created_at: u.created_at,
                }}
                subscription={sub ?? null}
              />
            );
          })}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Page {pageNumber} of {totalPages} ({totalCount} users)
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" disabled={pageNumber <= 1}>
                <Link href={buildPageLink(Math.max(1, pageNumber - 1))}>Previous</Link>
              </Button>
              <Button asChild variant="outline" disabled={pageNumber >= totalPages}>
                <Link href={buildPageLink(Math.min(totalPages, pageNumber + 1))}>Next</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(auditLogs ?? []).length === 0 ? (
            <div className="text-sm text-muted-foreground">No audit events yet.</div>
          ) : (
            (auditLogs ?? []).map((log) => (
              <div key={log.id} className="rounded-xl border p-3">
                <div className="text-sm font-medium">{log.action}</div>
                <div className="text-xs text-muted-foreground">
                  Actor: {log.actor_id} · {new Date(log.created_at).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Target: {log.target_type} {log.target_id ?? ""}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
