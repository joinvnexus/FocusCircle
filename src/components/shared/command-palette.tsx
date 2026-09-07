"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CheckSquare,
  Command as CommandIcon,
  Home,
  Plus,
  Search,
  Settings,
  Target,
  Users,
  Activity,
  Sparkles,
} from "lucide-react";
import {
  Command as CommandPrimitive,
  CommandEmpty as CommandEmptyPrimitive,
  CommandGroup as CommandGroupPrimitive,
  CommandInput as CommandInputPrimitive,
  CommandItem as CommandItemPrimitive,
  CommandList as CommandListPrimitive,
  CommandSeparator as CommandSeparatorPrimitive,
} from "cmdk";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { dispatchQuickAction, OPEN_COMMAND_PALETTE_EVENT, openCommandPalette, type QuickAction } from "@/lib/app-events";
import { cn } from "@/lib/utils";

const navigationItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", shortcut: "G D" },
  { icon: CheckSquare, label: "My Tasks", href: "/tasks", shortcut: "G T" },
  { icon: Users, label: "Circles", href: "/circles", shortcut: "G C" },
  { icon: Target, label: "Goals", href: "/goals", shortcut: "G O" },
  { icon: Activity, label: "Activity", href: "/activity", shortcut: "G A" },
  { icon: Bell, label: "Notifications", href: "/notifications", shortcut: "G N" },
  { icon: Settings, label: "Settings", href: "/profile", shortcut: "G S" },
] as const;

const quickActions: Array<{
  icon: typeof Plus;
  label: string;
  action: QuickAction;
  shortcut: string;
}> = [
  { icon: Plus, label: "New Task", action: "new-task", shortcut: "N T" },
  { icon: Plus, label: "New Goal", action: "new-goal", shortcut: "N G" },
  { icon: Plus, label: "New Circle", action: "new-circle", shortcut: "N C" },
];

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]",
      className,
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandInputPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandInputPrimitive>
>(({ className, ...props }, ref) => (
  <div
    className="flex items-center gap-3 border-b border-[var(--color-border-primary)] px-4"
    cmdk-input-wrapper=""
  >
    <Search className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
    <CommandInputPrimitive
      ref={ref}
      className={cn(
        "flex h-14 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
    <div className="hidden items-center gap-1 rounded-full border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] px-2 py-1 text-[11px] text-[var(--color-text-muted)] sm:flex">
      <CommandIcon className="h-3 w-3" />
      <span>K</span>
    </div>
  </div>
));
CommandInput.displayName = CommandInputPrimitive.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandListPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandListPrimitive>
>(({ className, ...props }, ref) => (
  <CommandListPrimitive ref={ref} className={cn("max-h-[420px] overflow-hidden", className)} {...props}>
    <ScrollArea className="h-full">
      <div>{props.children}</div>
    </ScrollArea>
  </CommandListPrimitive>
));
CommandList.displayName = CommandListPrimitive.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandEmptyPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandEmptyPrimitive>
>((props, ref) => (
  <CommandEmptyPrimitive
    ref={ref}
    className="px-4 py-10 text-center text-sm text-[var(--color-text-muted)]"
    {...props}
  />
));
CommandEmpty.displayName = CommandEmptyPrimitive.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandGroupPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandGroupPrimitive>
>(({ className, ...props }, ref) => (
  <CommandGroupPrimitive
    ref={ref}
    className={cn(
      "overflow-hidden p-2 text-[var(--color-text-primary)] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:text-[var(--color-text-muted)]",
      className,
    )}
    {...props}
  />
));
CommandGroup.displayName = CommandGroupPrimitive.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandSeparatorPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandSeparatorPrimitive>
>(({ className, ...props }, ref) => (
  <CommandSeparatorPrimitive
    ref={ref}
    className={cn("mx-2 h-px bg-[var(--color-border-primary)]", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandSeparatorPrimitive.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandItemPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandItemPrimitive>
>(({ className, ...props }, ref) => (
  <CommandItemPrimitive
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-sm outline-none transition aria-selected:bg-[var(--color-bg-surface)] aria-selected:text-[var(--color-text-primary)] data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
      className,
    )}
    {...props}
  />
));
CommandItem.displayName = CommandItemPrimitive.displayName;

function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "ml-auto rounded-full border border-[var(--color-border-primary)] px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]",
        className,
      )}
      {...props}
    />
  );
}

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    const onOpen = () => setOpen(true);

    document.addEventListener("keydown", down);
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpen);

    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpen);
    };
  }, []);

  const recentItems = React.useMemo(
    () =>
      navigationItems
        .filter((item) => item.href !== pathname)
        .slice(0, 3)
        .map((item) => ({
          ...item,
          context: item.href.startsWith("/notifications") ? "Unread and recent updates" : "Jump back in quickly",
        })),
    [pathname],
  );

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const runQuickAction = (action: QuickAction) => {
    setOpen(false);
    dispatchQuickAction(action);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl overflow-hidden border border-[var(--color-border-primary)] bg-transparent p-0 shadow-none">
        <Command className="border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] shadow-[var(--shadow-xl)]">
          <CommandInput placeholder="Search pages or run a quick action..." />
          <CommandList>
            <CommandEmpty>
              <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-medium text-[var(--color-text-primary)]">No matches</div>
                  <div>Try a page name like tasks, goals, or notifications.</div>
                </div>
              </div>
            </CommandEmpty>

            <CommandGroup heading="Navigation">
              {navigationItems.map((item) => (
                <CommandItem key={item.href} value={`${item.label} ${item.href}`} onSelect={() => navigate(item.href)}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">{item.href}</span>
                  </div>
                  <CommandShortcut>{item.shortcut}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Quick Actions">
              {quickActions.map((item) => (
                <CommandItem key={item.action} value={item.label} onSelect={() => runQuickAction(item.action)}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary-500)]/12 text-[var(--color-brand-primary)]">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">Open the creation flow immediately</span>
                  </div>
                  <CommandShortcut>{item.shortcut}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Recent">
              {recentItems.map((item) => (
                <CommandItem key={item.href} value={`${item.label} recent`} onSelect={() => navigate(item.href)}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">{item.context}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

          <div className="flex items-center justify-between border-t border-[var(--color-border-primary)] px-4 py-3 text-xs text-[var(--color-text-muted)]">
            <div>Use arrows to move, enter to open</div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[var(--color-text-muted)]"
              onClick={openCommandPalette}
            >
              <CommandIcon className="mr-1 h-3 w-3" />
              Cmd/Ctrl + K
            </Button>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
