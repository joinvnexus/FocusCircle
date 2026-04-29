"use client";

import { useEffect, useState } from "react";
import { cloneElement, isValidElement } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QUICK_ACTION_EVENT, type QuickAction } from "@/lib/app-events";

interface QuickActionDialogProps {
  action: QuickAction;
  title: string;
  description: string;
  triggerLabel: string;
  children: React.ReactNode;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link" | "subtle";
}

export function QuickActionDialog({
  action,
  title,
  description,
  triggerLabel,
  children,
  triggerVariant = "default",
}: QuickActionDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onQuickAction = (event: Event) => {
      const detail = (event as CustomEvent<QuickAction>).detail;
      if (detail === action) {
        setOpen(true);
      }
    };

    window.addEventListener(QUICK_ACTION_EVENT, onQuickAction);
    return () => window.removeEventListener(QUICK_ACTION_EVENT, onQuickAction);
  }, [action]);

  const content = isValidElement(children)
    ? cloneElement(children as React.ReactElement<{ onSuccess?: () => void }>, {
        onSuccess: () => setOpen(false),
      })
    : children;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant}>
          <Plus className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
