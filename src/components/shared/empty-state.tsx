import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
  illustration?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  illustration,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8", className)}>
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : icon ? (
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]">
          {icon}
        </div>
      ) : (
        <div className="mb-6 h-16 w-16 rounded-2xl bg-[var(--color-bg-surface)]" />
      )}
      <h3 className="mb-2 text-[var(--text-heading-md)] font-semibold text-[var(--color-text-primary)]">
        {title}
      </h3>
      {description && (
        <p className="mb-6 max-w-sm text-[var(--text-body-md)] text-[var(--color-text-muted)]">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}