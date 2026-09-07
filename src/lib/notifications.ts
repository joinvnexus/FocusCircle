"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";

type NotificationPayload = {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
};

type PreferenceKey = "deadline_alerts" | "weekly_summary";

const fallbackBaseUrl = "http://localhost:3000";

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || fallbackBaseUrl;
}

export async function createNotificationWithEmail(
  supabase: SupabaseClient,
  payload: NotificationPayload,
  preferenceKey?: PreferenceKey,
) {
  const { error: insertError } = await supabase.from("notifications").insert({
    user_id: payload.userId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    data: payload.data ?? null,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("email, full_name, notification_preferences")
    .eq("id", payload.userId)
    .single();

  const preferences = userProfile?.notification_preferences ?? null;
  const emailEnabled = preferences?.email_notifications ?? true;
  const preferenceEnabled = preferenceKey ? preferences?.[preferenceKey] ?? true : true;
  if (!userProfile?.email || !emailEnabled || !preferenceEnabled) {
    return { error: null };
  }

  const appUrl = getAppUrl();
  const subject = `FocusCircle — ${payload.title}`;
  const text = `${payload.title}\n\n${payload.message}\n\nView: ${appUrl}/notifications`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="margin: 0 0 12px;">${payload.title}</h2>
      <p style="margin: 0 0 16px;">${payload.message}</p>
      <a href="${appUrl}/notifications" style="display: inline-block; padding: 10px 16px; background: #111827; color: #ffffff; border-radius: 8px; text-decoration: none;">
        View in FocusCircle
      </a>
      <p style="margin-top: 16px; font-size: 12px; color: #6b7280;">
        You are receiving this because email notifications are enabled in your profile settings.
      </p>
    </div>
  `;

  const emailResult = await sendEmail({
    to: userProfile.email,
    subject,
    html,
    text,
  });

  if (emailResult.error) {
    console.error("Email delivery failed:", emailResult.error);
  }

  return { error: null };
}
