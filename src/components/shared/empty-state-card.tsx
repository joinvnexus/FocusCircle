import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateCardProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyStateCard({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  className,
}: EmptyStateCardProps) {
  return (
    <div className={cn("rounded-2xl border border-dashed p-8 text-center", className)}>
      {icon && <div className="mx-auto mb-4 h-12 w-12 text-muted-foreground">{icon}</div>}
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}