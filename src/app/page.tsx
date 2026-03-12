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
      <main className="hero-grid">
        <section className="relative overflow-hidden">
          <div className="absolute -left-20 top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-pulse-soft" />
          <div className="absolute right-6 top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-10 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-rose-400/20 blur-3xl animate-pulse-soft" />
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-4 py-1 text-sm text-muted-foreground shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Personal productivity plus small-team accountability
              </div>
              <div className="space-y-5">
                <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.3rem]">
                  Your circle stays aligned, your focus stays sharp.
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  FocusCircle turns priorities into visible momentum. Plan tasks, sync goals, and keep your people accountable without the overhead of enterprise suites.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/signup"><Button size="lg" className="shadow-lg shadow-primary/25">Start free <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
                <Link href="/features"><Button size="lg" variant="outline">Explore features</Button></Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Tasks closed weekly", value: "48k+" },
                  { label: "Average circle size", value: "5 people" },
                  { label: "Teams using goal sync", value: "84%" },
                ].map((metric, index) => (
                  <Card key={metric.label} className={`glass-panel border-white/40 ${index === 0 ? "animate-rise" : index === 1 ? "animate-rise-delay-1" : "animate-rise-delay-2"}`}>
                    <CardContent className="p-5">
                      <div className="text-2xl font-semibold">{metric.value}</div>
                      <div className="text-sm text-muted-foreground">{metric.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -right-4 top-6 h-24 w-24 rounded-3xl border border-white/60 bg-white/70 shadow-lg animate-float" />
              <div className="absolute -left-6 bottom-8 h-16 w-16 rounded-2xl border border-white/60 bg-white/70 shadow-lg animate-float" />
              <div className="rounded-[2.5rem] border border-white/60 bg-white/70 p-5 shadow-glow">
                <div className="rounded-[2rem] border bg-background p-5">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Circle Snapshot</div>
                      <div className="text-2xl font-semibold">Launch Ops</div>
                    </div>
                    <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">87% on track</div>
                  </div>
                  <div className="space-y-3">
                    {[
                      ["Finalize checklist", "Completed"],
                      ["Review onboarding copy", "In Progress"],
                      ["Ship analytics recap", "Todo"],
                    ].map(([title, status], index) => (
                      <div key={title} className={`flex items-center justify-between rounded-2xl border p-4 ${index === 0 ? "animate-rise" : index === 1 ? "animate-rise-delay-1" : "animate-rise-delay-2"}`}>
                        <div>
                          <div className="font-medium">{title}</div>
                          <div className="text-sm text-muted-foreground">Assignee visible, comments attached, deadline tracked</div>
                        </div>
                        <div className="rounded-full bg-secondary px-3 py-1 text-xs">{status}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border bg-white p-4">
                      <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Momentum</div>
                      <div className="mt-2 text-3xl font-semibold">+18%</div>
                      <p className="mt-1 text-sm text-muted-foreground">Week-over-week completion lift</p>
                    </div>
                    <div className="rounded-2xl border bg-white p-4">
                      <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Upcoming</div>
                      <div className="mt-2 text-3xl font-semibold">6</div>
                      <p className="mt-1 text-sm text-muted-foreground">Tasks due this week</p>
                    </div>
                  </div>
                </div>
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
              <Card key={feature.title} className="border-border/70 bg-card/80 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
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
              <Card key={title} className="overflow-hidden bg-white/80 backdrop-blur">
                <div className={`h-2 ${index === 0 ? "bg-emerald-400" : index === 1 ? "bg-cyan-400" : "bg-rose-400"}`} />
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
                <Card key={item.author} className="transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
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
