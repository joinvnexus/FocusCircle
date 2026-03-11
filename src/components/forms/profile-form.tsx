"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { updateAvatarAction, updateProfileAction } from "@/app/actions/profile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import { profileSchema } from "@/lib/validators";
import type { AppUser } from "@/types";

type ProfileValues = z.input<typeof profileSchema>;

export function ProfileForm({ profile }: { profile: AppUser }) {
  const [isPending, startTransition] = useTransition();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const { refreshSession } = useAuth();
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);
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

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Upload an image file (PNG or JPG)");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar must be 2MB or smaller");
      event.target.value = "";
      return;
    }

    if (!supabase) {
      toast.error("Supabase client is not configured");
      event.target.value = "";
      return;
    }

    setAvatarUploading(true);
    try {
      const extension = file.name.split(".").pop() || "png";
      const uniqueId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const path = `${profile.id}/${uniqueId}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        toast.error(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data.publicUrl;

      const result = await updateAvatarAction({ avatarUrl: publicUrl });
      if (result.error) {
        toast.error(result.error);
        return;
      }

      setAvatarUrl(publicUrl);
      await refreshSession();
      toast.success("Avatar updated");
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

  const handleAvatarRemove = () => {
    startTransition(async () => {
      const result = await updateAvatarAction({ avatarUrl: null });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setAvatarUrl("");
      await refreshSession();
      toast.success("Avatar removed");
    });
  };

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
          <div className="md:col-span-2 flex flex-col gap-4 rounded-2xl border p-4">
            <Label>Avatar</Label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt={profile.full_name} /> : null}
                  <AvatarFallback>{getInitials(profile.full_name || "U")}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Upload a new avatar</p>
                  <p className="text-xs text-muted-foreground">PNG or JPG up to 2MB</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                  className="max-w-xs"
                />
                {avatarUrl ? (
                  <Button type="button" variant="ghost" disabled={isPending || avatarUploading} onClick={handleAvatarRemove}>
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
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
