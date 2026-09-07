"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateAdminSubscriptionAction, updateAdminUserAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AdminUserRowProps = {
  user: {
    id: string;
    email: string | null;
    full_name: string | null;
    plan: "free" | "pro";
    is_admin: boolean;
    circle_limit: number | null;
    member_limit: number | null;
    created_at: string;
  };
  subscription?: {
    id: string;
    status: string;
    price_id: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
  } | null;
};

function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function AdminUserRow({ user, subscription }: AdminUserRowProps) {
  const [isPending, startTransition] = useTransition();
  const [isAdmin, setIsAdmin] = useState(user.is_admin);
  const [plan, setPlan] = useState<"free" | "pro">(user.plan ?? "free");
  const [circleLimit, setCircleLimit] = useState(() => String(user.circle_limit ?? 3));
  const [memberLimit, setMemberLimit] = useState(() => String(user.member_limit ?? 5));
  const [subStatus, setSubStatus] = useState(subscription?.status ?? "none");
  const [subPriceId, setSubPriceId] = useState(subscription?.price_id ?? "");
  const [subCancelAtPeriodEnd, setSubCancelAtPeriodEnd] = useState(subscription?.cancel_at_period_end ?? false);
  const [subPeriodEnd, setSubPeriodEnd] = useState(() => toDateTimeLocal(subscription?.current_period_end ?? null));

  const limitsDirty = useMemo(() => {
    const circleValue = Number(circleLimit);
    const memberValue = Number(memberLimit);
    return circleValue !== (user.circle_limit ?? 3) || memberValue !== (user.member_limit ?? 5) || plan !== (user.plan ?? "free");
  }, [circleLimit, memberLimit, plan, user.circle_limit, user.member_limit, user.plan]);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateAdminUserAction({
        userId: user.id,
        plan,
        circleLimit: Number(circleLimit),
        memberLimit: Number(memberLimit),
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("User updated");
    });
  };

  const handleToggleAdmin = () => {
    startTransition(async () => {
      const result = await updateAdminUserAction({
        userId: user.id,
        isAdmin: !isAdmin,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setIsAdmin((prev) => !prev);
      toast.success(!isAdmin ? "Admin access granted" : "Admin access revoked");
    });
  };

  const handleSaveSubscription = () => {
    if (!subscription?.id) {
      toast.error("No subscription to update");
      return;
    }

    startTransition(async () => {
      const result = await updateAdminSubscriptionAction({
        subscriptionId: subscription.id,
        status: subStatus !== "none" ? subStatus : undefined,
        priceId: subPriceId || undefined,
        cancelAtPeriodEnd: subCancelAtPeriodEnd,
        currentPeriodEnd: subPeriodEnd ? new Date(subPeriodEnd).toISOString() : undefined,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Subscription updated");
    });
  };

  return (
    <div className="grid gap-4 rounded-2xl border p-4">
      <div>
        <div className="font-medium">{user.full_name || "Unnamed"}</div>
        <div className="text-sm text-muted-foreground">{user.email}</div>
        <div className="text-xs text-muted-foreground">Joined: {new Date(user.created_at).toLocaleDateString()}</div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Plan</div>
          <Select value={plan} onValueChange={(value) => setPlan(value as "free" | "pro")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Circle limit</div>
          <Input
            type="number"
            min={1}
            max={1000}
            value={circleLimit}
            onChange={(event) => setCircleLimit(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Member limit</div>
          <Input
            type="number"
            min={1}
            max={1000}
            value={memberLimit}
            onChange={(event) => setMemberLimit(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end md:items-end">
          <Button type="button" variant={isAdmin ? "secondary" : "outline"} onClick={handleToggleAdmin} disabled={isPending}>
            {isAdmin ? "Remove admin" : "Make admin"}
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending || !limitsDirty}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border bg-muted/40 p-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Subscription status</div>
          <Select value={subStatus} onValueChange={setSubStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="trialing">Trialing</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="past_due">Past due</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Price ID</div>
          <Input
            value={subPriceId}
            onChange={(event) => setSubPriceId(event.target.value)}
            placeholder="price_xxx"
          />
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Current period end</div>
          <Input
            type="datetime-local"
            value={subPeriodEnd}
            onChange={(event) => setSubPeriodEnd(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <Button
            type="button"
            variant={subCancelAtPeriodEnd ? "secondary" : "outline"}
            onClick={() => setSubCancelAtPeriodEnd((prev) => !prev)}
            disabled={isPending}
          >
            {subCancelAtPeriodEnd ? "Cancel at period end" : "Keep renewing"}
          </Button>
          <Button type="button" onClick={handleSaveSubscription} disabled={isPending || !subscription}>
            {isPending ? "Saving..." : "Save subscription"}
          </Button>
        </div>
      </div>
    </div>
  );
}
