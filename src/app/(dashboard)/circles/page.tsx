import Link from "next/link";
import { Copy, Users } from "lucide-react";
import { getCirclesForUser } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { CircleCreationCard, CircleJoinCard } from "@/components/forms/circle-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CirclesPage() {
  const user = await requireUser();
  const circles = await getCirclesForUser(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Circles</h1>
        <p className="text-muted-foreground">Create collaboration spaces, share invite codes, and jump into each workspace.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CircleCreationCard />
        <CircleJoinCard />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {circles.length ? circles.map((entry) => {
          const circle = entry.circles as unknown as { id: string; name: string; description: string | null; invite_code: string | null };
          return (
            <Card key={circle.id}>
              <CardHeader>
                <CardTitle>{circle.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{circle.description ?? "No description yet."}</p>
                <div className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Role: <span className="font-medium">{entry.role}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                  <Copy className="h-4 w-4 text-muted-foreground" />
                  Invite code: <span className="font-mono">{circle.invite_code}</span>
                </div>
                <Link href={`/circles/${circle.id}`}>
                  <Button className="w-full">Open workspace</Button>
                </Link>
              </CardContent>
            </Card>
          );
        }) : <div className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">You are not in any circles yet.</div>}
      </div>
    </div>
  );
}
