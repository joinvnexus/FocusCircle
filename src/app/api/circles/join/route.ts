import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const limit = checkRateLimit(request.headers.get("x-forwarded-for") ?? "circles:join:unknown");
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const inviteCode = String(body?.inviteCode ?? "").replace(/[^a-z0-9]/gi, "").toUpperCase();

  if (!inviteCode) {
    return NextResponse.json({ error: "inviteCode is required" }, { status: 422 });
  }

  const { data: circleId, error } = await supabase.rpc("join_circle_by_invite", {
    invite_code_input: inviteCode,
  });

  if (error || !circleId) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  const { error: membershipError } = await supabase.from("circle_members").upsert(
    {
      circle_id: circleId,
      user_id: user.id,
      role: "member",
    },
    { onConflict: "circle_id,user_id" },
  );

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, circleId });
}
