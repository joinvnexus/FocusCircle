"use client";

export const OPEN_COMMAND_PALETTE_EVENT = "focuscircle:open-command-palette";
export const QUICK_ACTION_EVENT = "focuscircle:quick-action";

export type QuickAction = "new-task" | "new-goal" | "new-circle";

export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent(OPEN_COMMAND_PALETTE_EVENT));
}

export function dispatchQuickAction(action: QuickAction) {
  window.dispatchEvent(
    new CustomEvent<QuickAction>(QUICK_ACTION_EVENT, {
      detail: action,
    }),
  );
}
