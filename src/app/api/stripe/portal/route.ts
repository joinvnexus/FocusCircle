import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: appUser } = await supabase.from("users").select("stripe_customer_id").eq("id", user.id).single();

  if (!appUser?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing customer found" }, { status: 404 });
  }

  const baseUrl = getBaseUrl();
  const session = await stripe.billingPortal.sessions.create({
    customer: appUser.stripe_customer_id,
    return_url: `${baseUrl}/profile`,
  });

  return NextResponse.json({ url: session.url });
}
