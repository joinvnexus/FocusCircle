"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { updateProfileAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileSchema } from "@/lib/validators";
import type { AppUser } from "@/types";

type ProfileValues = z.input<typeof profileSchema>;

export function ProfileForm({ profile }: { profile: AppUser }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: profile.email,
      fullName: profile.full_name,
      timezone: profile.timezone,
      emailNotifications: profile.notification_preferences?.email_notifications ?? true,
      deadlineAlerts: profile.notification_preferences?.deadline_alerts ?? true,
      weeklySummary: profile.notification_preferences?.weekly_summary ?? false,
      password: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const result = await updateProfileAction(values);
              if (result.error) {
                toast.error(result.error);
                return;
              }
              toast.success("Profile updated");
              form.setValue("password", "");
            });
          })}
        >
          <Field label="Full name"><Input {...form.register("fullName")} /></Field>
          <Field label="Email"><Input type="email" {...form.register("email")} /></Field>
          <Field label="Timezone"><Input {...form.register("timezone")} placeholder="Asia/Dhaka" /></Field>
          <Field label="New password"><Input type="password" {...form.register("password")} placeholder="Leave blank to keep current password" /></Field>
          <div className="space-y-3 md:col-span-2">
            <Label>Notification preferences</Label>
            <CheckboxRow label="Email notifications" checked={form.watch("emailNotifications") ?? true} onChange={(value) => form.setValue("emailNotifications", value)} />
            <CheckboxRow label="Deadline alerts" checked={form.watch("deadlineAlerts") ?? true} onChange={(value) => form.setValue("deadlineAlerts", value)} />
            <CheckboxRow label="Weekly summary" checked={form.watch("weeklySummary") ?? false} onChange={(value) => form.setValue("weeklySummary", value)} />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save changes"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function CheckboxRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border p-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
