import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyStateIllustration } from "@/components/shared/empty-state";

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
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-8 text-center",
        className,
      )}
    >
      <div className="mx-auto mb-5 flex w-fit items-center justify-center">
        {icon ? <div className="h-12 w-12 text-[var(--color-text-muted)]">{icon}</div> : <EmptyStateIllustration className="h-24 w-28" />}
      </div>
      <h3 className="mb-2 text-[var(--text-heading-sm)] font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <p className="mb-5 text-sm text-[var(--color-text-muted)]">{message}</p>
      {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}
