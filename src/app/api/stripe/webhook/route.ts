import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function toDateTime(seconds: number | null | undefined) {
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

async function resolveUserIdByCustomer(customerId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("users").select("id").eq("stripe_customer_id", customerId).single();
  return data?.id ?? null;
}

async function upsertSubscription(payload: {
  userId: string;
  customerId: string;
  subscriptionId: string;
  status: string;
  priceId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}) {
  const admin = createAdminClient();
  await admin.from("subscriptions").upsert(
    {
      user_id: payload.userId,
      stripe_customer_id: payload.customerId,
      stripe_subscription_id: payload.subscriptionId,
      status: payload.status,
      price_id: payload.priceId,
      current_period_end: payload.currentPeriodEnd,
      cancel_at_period_end: payload.cancelAtPeriodEnd,
    },
    { onConflict: "stripe_subscription_id" },
  );
}

async function updateUserPlan(userId: string, isPro: boolean) {
  const admin = createAdminClient();
  await admin
    .from("users")
    .update({
      plan: isPro ? "pro" : "free",
      circle_limit: isPro ? null : 3,
      member_limit: isPro ? null : 5,
    })
    .eq("id", userId);
}

export async function POST(request: Request) {
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  if (event.type.startsWith("customer.subscription.")) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    const userId = await resolveUserIdByCustomer(customerId);
    if (!userId) {
      return NextResponse.json({ received: true });
    }

    const priceId = subscription.items.data[0]?.price?.id ?? null;
    await upsertSubscription({
      userId,
      customerId,
      subscriptionId: subscription.id,
      status: subscription.status,
      priceId,
      currentPeriodEnd: toDateTime(subscription.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
    });

    const isPro = ["active", "trialing"].includes(subscription.status);
    await updateUserPlan(userId, isPro);
  }

  return NextResponse.json({ received: true });
}
