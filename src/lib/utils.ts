import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNowStrict } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(input));
}

export function formatRelativeTime(input: string | Date): string {
  return formatDistanceToNowStrict(new Date(input), { addSuffix: true });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function randomInviteCode(length = 10): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let value = "";
  for (let i = 0; i < length; i += 1) {
    value += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return value;
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300";
    case "medium":
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950/40 dark:text-yellow-300";
    case "low":
      return "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/40 dark:text-green-300";
    default:
      return "bg-muted text-muted-foreground hover:bg-muted";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/40 dark:text-green-300";
    case "in_progress":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300";
    case "todo":
      return "bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300";
    default:
      return "bg-muted text-muted-foreground hover:bg-muted";
  }
}

export function formatStatusLabel(status: string): string {
  return status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function extractMentions(body: string): string[] {
  return Array.from(new Set(body.match(/@\w+/g)?.map((item) => item.slice(1).toLowerCase()) ?? []));
}

export function safePercentage(value: number, total: number): number {
  if (!total) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}
