import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const inviteCode = String(body?.inviteCode ?? "").trim().toUpperCase();

  if (!inviteCode) {
    return NextResponse.json({ error: "inviteCode is required" }, { status: 422 });
  }

  const { data: circle, error } = await supabase.from("circles").select("id").eq("invite_code", inviteCode).single();

  if (error || !circle) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  const { error: membershipError } = await supabase.from("circle_members").upsert(
    {
      circle_id: circle.id,
      user_id: user.id,
      role: "member",
    },
    { onConflict: "circle_id,user_id" },
  );

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, circleId: circle.id });
}
