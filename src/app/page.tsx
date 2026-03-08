import Link from "next/link";
import { ArrowRight, Bell, CheckCircle2, LayoutDashboard, MessageSquare, Target, Users } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { icon: LayoutDashboard, title: "Actionable dashboard", description: "See today's priorities, deadlines, circle momentum, and analytics in one view." },
  { icon: CheckCircle2, title: "Task execution", description: "Manage personal and shared tasks with due dates, priorities, goal links, and Kanban status." },
  { icon: Users, title: "Private circles", description: "Create focused collaboration spaces for small teams, study groups, or accountability partners." },
  { icon: Target, title: "Shared goals", description: "Track circle outcomes and let progress update from completed tasks automatically." },
  { icon: MessageSquare, title: "Comments and mentions", description: "Discuss work in context with threaded comments, mentions, and reactions." },
  { icon: Bell, title: "Realtime notifications", description: "Get notified for assignments, comments, goal updates, and deadline pressure." },
];

const testimonials = [
  { quote: "FocusCircle replaced our scattered Notion board, Slack reminders, and habit sheet in one week.", author: "Raisa, Product Lead" },
  { quote: "The circle workspace made weekly accountability actually stick because progress was visible.", author: "Jamil, Founder" },
  { quote: "We use it for study planning and shipped a cleaner routine than any generic task app gave us.", author: "Muna, Student Team Organizer" },
];

export default function LandingPage() {
  return (
    <MarketingShell>
      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border bg-card px-4 py-1 text-sm text-muted-foreground">
              Personal productivity plus small-team accountability
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
                The operating system for <span className="text-primary">focused circles</span>.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                FocusCircle combines task planning, lightweight collaboration, habits, and shared goal tracking for people who need structure without enterprise overhead.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup"><Button size="lg">Start free <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Link href="/features"><Button size="lg" variant="outline">Explore features</Button></Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Tasks closed weekly", value: "48k+" },
                { label: "Average circle size", value: "5 people" },
                { label: "Teams using goal sync", value: "84%" },
              ].map((metric) => (
                <Card key={metric.label}>
                  <CardContent className="p-5">
                    <div className="text-2xl font-semibold">{metric.value}</div>
                    <div className="text-sm text-muted-foreground">{metric.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border bg-card p-4 shadow-xl shadow-primary/10">
            <div className="rounded-[1.5rem] border bg-background p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Circle Snapshot</div>
                  <div className="text-xl font-semibold">Launch Ops</div>
                </div>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">87% on track</div>
              </div>
              <div className="space-y-3">
                {[
                  ["Finalize checklist", "Completed"],
                  ["Review onboarding copy", "In Progress"],
                  ["Ship analytics recap", "Todo"],
                ].map(([title, status]) => (
                  <div key={title} className="flex items-center justify-between rounded-2xl border p-4">
                    <div>
                      <div className="font-medium">{title}</div>
                      <div className="text-sm text-muted-foreground">Assignee visible, comments attached, deadline tracked</div>
                    </div>
                    <div className="rounded-full bg-secondary px-3 py-1 text-xs">{status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <div className="text-sm font-medium uppercase tracking-[0.22em] text-primary">Why it works</div>
            <h2 className="mt-3 text-3xl font-semibold">One system for your own focus and your circle&apos;s accountability.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/70 bg-card/80">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {["Personal planning", "Circle coordination", "Analytics and notifications"].map((title, index) => (
              <Card key={title} className="overflow-hidden">
                <div className={`h-2 ${index === 0 ? "bg-primary" : index === 1 ? "bg-chart-2" : "bg-chart-4"}`} />
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>
                    {index === 0
                      ? "Daily priorities, upcoming deadlines, and streak-aware momentum."
                      : index === 1
                        ? "Shared task boards, member roles, comments, and goals in one workspace."
                        : "Weekly trends, completion rates, unread notifications, and recent circle events."}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-card/50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.22em] text-primary">Social proof</div>
                <h2 className="mt-3 text-3xl font-semibold">Teams use FocusCircle to keep momentum visible.</h2>
              </div>
              <Link href="/pricing" className="text-sm text-primary">See pricing</Link>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {testimonials.map((item) => (
                <Card key={item.author}>
                  <CardContent className="space-y-4 p-6">
                    <p className="text-base leading-7">{item.quote}</p>
                    <div className="text-sm text-muted-foreground">{item.author}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="overflow-hidden border-primary/20 bg-primary text-primary-foreground">
            <CardContent className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
              <div className="space-y-2">
                <div className="text-sm uppercase tracking-[0.2em] text-primary-foreground/80">Start now</div>
                <h2 className="text-3xl font-semibold">Build your first circle in minutes.</h2>
                <p className="max-w-2xl text-primary-foreground/80">Launch personal planning for free, then add your team, classmates, or accountability partners when you&apos;re ready.</p>
              </div>
              <div className="flex gap-3">
                <Link href="/signup"><Button variant="secondary" size="lg">Create account</Button></Link>
                <Link href="/pricing"><Button variant="outline" size="lg" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">Compare plans</Button></Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </MarketingShell>
  );
}
