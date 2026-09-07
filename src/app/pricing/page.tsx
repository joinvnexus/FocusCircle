import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { CheckoutButton } from "@/components/marketing/checkout-button";
import { CheckoutStatusToast } from "@/components/marketing/checkout-status-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    description: "Best for personal productivity and small experiments.",
    features: ["Unlimited personal tasks", "Up to 3 circles", "Basic charts", "In-app notifications"],
  },
  {
    name: "Pro",
    price: "$9",
    description: "For small teams that need shared goals and deeper visibility.",
    features: ["Unlimited circles", "Advanced analytics", "Member roles", "Priority support"],
  },
];

export default function PricingPage() {
  return (
    <MarketingShell>
      <CheckoutStatusToast />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-sm font-medium uppercase tracking-[0.22em] text-primary">Pricing</div>
          <h1 className="mt-3 text-4xl font-semibold">Start free. Upgrade when your circle needs more scale.</h1>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {tiers.map((tier) => (
            <Card key={tier.name} className={tier.name === "Pro" ? "border-primary shadow-lg shadow-primary/10" : undefined}>
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-4xl font-semibold">{tier.price}</div>
                  <div className="text-sm text-muted-foreground">{tier.name === "Pro" ? "per user / month" : "forever"}</div>
                </div>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
                <div className="space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="rounded-xl border px-4 py-3 text-sm">{feature}</div>
                  ))}
                </div>
                {tier.name === "Pro" ? (
                  <CheckoutButton label="Upgrade to Pro" />
                ) : (
                  <Link href="/signup"><Button className="w-full">Create free account</Button></Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </MarketingShell>
  );
}
