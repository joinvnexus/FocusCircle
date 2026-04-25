"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command as CommandPrimitive,
  CommandInput as CommandInputPrimitive,
  CommandList as CommandListPrimitive,
  CommandEmpty as CommandEmptyPrimitive,
  CommandGroup as CommandGroupPrimitive,
  CommandSeparator as CommandSeparatorPrimitive,
  CommandItem as CommandItemPrimitive,
} from "cmdk";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Search,
  Calendar,
  CheckSquare,
  Users,
  Target,
  Bell,
  Settings,
  Plus,
  Home,
  Command as CommandIcon,
} from "lucide-react";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]",
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

const CommandDialog = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 max-w-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--color-text-muted)] [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandInputPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandInputPrimitive>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-[var(--color-border-primary)] px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
    <CommandInputPrimitive
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-[var(--color-text-muted)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
    <Button
      variant="ghost"
      size="sm"
      className="ml-auto h-6 px-2 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-raised)]"
    >
      <kbd className="flex items-center gap-1">
        <CommandIcon className="h-3 w-3" />
        <span>K</span>
      </kbd>
    </Button>
  </div>
));
CommandInput.displayName = CommandInputPrimitive.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandListPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandListPrimitive>
>(({ className, ...props }, ref) => (
  <CommandListPrimitive ref={ref} className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}>
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
    className="py-6 text-center text-sm text-[var(--color-text-muted)]"
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
    className={cn("overflow-hidden p-1 text-[var(--color-text-primary)]", className)}
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
    className={cn("-mx-1 h-px bg-[var(--color-border-primary)]", className)}
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
      "relative flex cursor-default select-none items-center rounded-[var(--radius-sm)] px-2 py-1.5 text-sm outline-none aria-selected:bg-[var(--color-bg-surface-raised)] aria-selected:text-[var(--color-text-primary)] data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
      className
    )}
    {...props}
  />
));
CommandItem.displayName = CommandItemPrimitive.displayName;

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-[var(--color-text-muted)]", className)} {...props} />;
};
CommandShortcut.displayName = "CommandShortcut";

// Navigation items
const navigationItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", shortcut: "G H" },
  { icon: CheckSquare, label: "My Tasks", href: "/tasks", shortcut: "G T" },
  { icon: Users, label: "Circles", href: "/circles", shortcut: "G C" },
  { icon: Target, label: "Goals", href: "/goals", shortcut: "G O" },
  { icon: Calendar, label: "Activity", href: "/activity", shortcut: "G A" },
  { icon: Bell, label: "Notifications", href: "/notifications", shortcut: "G N" },
  { icon: Settings, label: "Settings", href: "/profile", shortcut: "G S" },
];

const quickActions = [
  { icon: Plus, label: "New Task", action: "new-task", color: "#2563eb" },
  { icon: Plus, label: "New Goal", action: "new-goal", color: "#2563eb" },
  { icon: Plus, label: "New Circle", action: "new-circle", color: "#2563eb" },
];

export function CommandPalette() {
  const [query, setQuery] = React.useState("");

  return (
    <CommandDialog>
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search tasks, circles, settings..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem key={item.label} onSelect={() => {}}>
                <item.icon className="mr-2 h-4 w-4 text-[var(--color-text-muted)]" />
                <span>{item.label}</span>
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            {quickActions.map((item) => (
              <CommandItem key={item.label} onSelect={() => {}}>
                <div
                  className="mr-2 flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <item.icon className="h-3 w-3" style={{ color: item.color }} />
                </div>
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Recent Searches">
            <CommandItem onSelect={() => {}}>
              <Search className="mr-2 h-4 w-4 text-[var(--color-text-muted)]" />
              <span>Team meeting notes</span>
            </CommandItem>
            <CommandItem onSelect={() => {}}>
              <Search className="mr-2 h-4 w-4 text-[var(--color-text-muted)]" />
              <span>Q2 marketing plan</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
