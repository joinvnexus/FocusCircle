import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const posts = [
  { title: "How accountability circles reduce task drift", excerpt: "Why small group structure outperforms solo intention once work gets messy.", tag: "Productivity Systems" },
  { title: "Designing a task board your team will actually maintain", excerpt: "The difference between board hygiene and another abandoned planning ritual.", tag: "Team Workflow" },
  { title: "Using goal-linked tasks to keep progress honest", excerpt: "A practical way to stop goals from becoming vague aspiration dashboards.", tag: "Execution" },
];

export default function BlogPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-4">
          <div className="text-sm font-medium uppercase tracking-[0.22em] text-primary">Blog</div>
          <h1 className="text-4xl font-semibold">Practical writing on productivity, circle dynamics, and execution.</h1>
        </div>
        <div className="mt-12 grid gap-6">
          {posts.map((post) => (
            <Card key={post.title}>
              <CardHeader>
                <div className="text-xs uppercase tracking-[0.2em] text-primary">{post.tag}</div>
                <CardTitle>{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.excerpt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </MarketingShell>
  );
}
