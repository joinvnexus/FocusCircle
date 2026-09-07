import { ProfileForm } from "@/components/forms/profile-form";
import { getProfilePageData } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingPortalButton } from "@/components/settings/billing-portal-button";
import { CheckoutButton } from "@/components/marketing/checkout-button";

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getProfilePageData(user.id);

  if (!profile) {
    return <div className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">Profile not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Update your profile, password, timezone, and notification preferences.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Plan & Billing</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Current plan</div>
            <div className="text-2xl font-semibold capitalize">{profile.plan}</div>
            <div className="text-sm text-muted-foreground">
              {profile.plan === "pro"
                ? "Unlimited circles and advanced analytics"
                : "Up to 3 circles, basic analytics"}
            </div>
          </div>
          {profile.plan === "pro" ? <BillingPortalButton /> : <CheckoutButton label="Upgrade to Pro" />}
        </CardContent>
      </Card>
      <ProfileForm profile={profile} />
    </div>
  );
}
