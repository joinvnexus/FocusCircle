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
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  align?: "center" | "left";
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  illustration,
  className,
  secondaryActionLabel,
  onSecondaryAction,
  align = "center",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-center gap-5 rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-8",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {illustration ? (
        <div>{illustration}</div>
      ) : icon ? (
        <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]">
          {icon}
        </div>
      ) : (
        <EmptyStateIllustration />
      )}
      <div className="space-y-2">
        <h3 className="text-[var(--text-heading-md)] font-semibold text-[var(--color-text-primary)]">{title}</h3>
        {description ? (
          <p className="max-w-md text-[var(--text-body-md)] leading-[var(--leading-relaxed)] text-[var(--color-text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {(actionLabel && onAction) || (secondaryActionLabel && onSecondaryAction) ? (
        <div className="flex flex-wrap items-center gap-3">
          {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
          {secondaryActionLabel && onSecondaryAction ? (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function EmptyStateIllustration({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-28 w-32 overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border-primary)] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_58%),linear-gradient(180deg,var(--color-bg-surface),transparent)]",
        className,
      )}
      aria-hidden="true"
    >
      <div className="absolute left-4 top-5 h-3 w-14 rounded-full bg-[var(--color-bg-surface-raised)]" />
      <div className="absolute left-4 top-12 h-3 w-20 rounded-full bg-[var(--color-bg-surface-raised)]/80" />
      <div className="absolute left-4 top-[4.75rem] h-3 w-12 rounded-full bg-[var(--color-bg-surface-raised)]/60" />
      <div className="absolute right-4 top-8 h-14 w-14 rounded-[var(--radius-xl)] border border-[var(--color-border-primary)] bg-[var(--color-primary-500)]/12" />
      <div className="absolute bottom-0 left-0 h-10 w-full bg-gradient-to-t from-[var(--color-bg-secondary)] to-transparent" />
    </div>
  );
}
