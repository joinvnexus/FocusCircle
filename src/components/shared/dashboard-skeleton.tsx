import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-12 w-56" />
        <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} variant="elevated">
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton variant="circle" className="h-12 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} variant="elevated">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-72 w-full rounded-[var(--radius-xl)]" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
