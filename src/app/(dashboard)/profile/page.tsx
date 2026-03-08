import { ProfileForm } from "@/components/forms/profile-form";
import { getProfilePageData } from "@/lib/data";
import { requireUser } from "@/lib/auth";

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
      <ProfileForm profile={profile} />
    </div>
  );
}
