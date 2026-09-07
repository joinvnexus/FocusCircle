import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubtaskList } from "@/components/forms/subtask-list";
import * as subtaskActions from "@/app/actions/subtasks";
import type { Subtask } from "@/types";

vi.mock("@/app/actions/subtasks", () => ({
  createSubtaskAction: vi.fn(),
  toggleSubtaskAction: vi.fn(),
  deleteSubtaskAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

function makeSubtask(overrides: Partial<Subtask> & { id: string }): Subtask {
  return {
    task_id: "task-1",
    title: "Subtask",
    is_done: false,
    position: 0,
    created_by: "user-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("SubtaskList", () => {
  it("shows progress roll-up based on completed subtasks", () => {
    const subtasks = [
      makeSubtask({ id: "s1", title: "Write draft", is_done: true }),
      makeSubtask({ id: "s2", title: "Review draft", is_done: false }),
    ];

    render(<SubtaskList taskId="task-1" initialSubtasks={subtasks} />);

    expect(screen.getByText("1/2 done")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("adds a new subtask via the create action", async () => {
    const createSubtaskAction = vi.mocked(subtaskActions.createSubtaskAction);
    createSubtaskAction.mockResolvedValue({
      error: null,
      subtask: makeSubtask({ id: "new-1", title: "New subtask" }),
    });

    render(<SubtaskList taskId="task-1" initialSubtasks={[]} />);

    await userEvent.type(screen.getByPlaceholderText("Add a subtask"), "New subtask");
    await userEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(createSubtaskAction).toHaveBeenCalledWith("task-1", { title: "New subtask" });
    });
    expect(await screen.findByText("New subtask")).toBeInTheDocument();
  });

  it("toggles a subtask as done", async () => {
    const toggleSubtaskAction = vi.mocked(subtaskActions.toggleSubtaskAction);
    toggleSubtaskAction.mockResolvedValue({ error: null });

    const subtasks = [makeSubtask({ id: "s1", title: "Ship it", is_done: false })];
    render(<SubtaskList taskId="task-1" initialSubtasks={subtasks} />);

    await userEvent.click(screen.getByRole("checkbox"));

    await waitFor(() => {
      expect(toggleSubtaskAction).toHaveBeenCalledWith("s1", true);
    });
  });

  it("removes a subtask via the delete action", async () => {
    const deleteSubtaskAction = vi.mocked(subtaskActions.deleteSubtaskAction);
    deleteSubtaskAction.mockResolvedValue({ error: null });

    const subtasks = [makeSubtask({ id: "s1", title: "Delete me", is_done: false })];
    render(<SubtaskList taskId="task-1" initialSubtasks={subtasks} />);

    await userEvent.click(screen.getByRole("button", { name: /delete subtask/i }));

    await waitFor(() => {
      expect(deleteSubtaskAction).toHaveBeenCalledWith("s1");
    });
    expect(screen.queryByText("Delete me")).not.toBeInTheDocument();
  });
});
