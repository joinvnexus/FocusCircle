import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categories = [
  {
    title: "Execution",
    items: ["Personal task management", "Kanban board", "Due dates and priorities", "Goal-linked tasks"],
  },
  {
    title: "Collaboration",
    items: ["Circle workspaces", "Invites and roles", "Threaded comments", "Realtime activity feed"],
  },
  {
    title: "Visibility",
    items: ["Dashboard widgets", "Weekly productivity charts", "Goal completion tracking", "Notification center"],
  },
];

export default function FeaturesPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="text-sm font-medium uppercase tracking-[0.22em] text-primary">Features</div>
          <h1 className="text-4xl font-semibold tracking-tight">Everything required to manage personal focus and small-team accountability.</h1>
          <p className="text-lg text-muted-foreground">FocusCircle brings planning, collaboration, communication, and analytics into one clean workflow instead of spreading them across five tools.</p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.title}>
              <CardHeader>
                <CardTitle>{category.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.items.map((item) => (
                  <div key={item} className="rounded-xl border px-4 py-3 text-sm">{item}</div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </MarketingShell>
  );
}
