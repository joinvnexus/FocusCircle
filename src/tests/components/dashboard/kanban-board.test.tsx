import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import type { Task } from "@/types";

vi.mock("@/app/actions/tasks", () => ({
  deleteTaskAction: vi.fn().mockResolvedValue({ error: null }),
  updateTaskStatusAction: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    message: vi.fn(),
    success: vi.fn(),
  },
}));

function makeTask(overrides: Partial<Task> & { id: string }): Task {
  return {
    title: "Task",
    description: null,
    status: "in_progress",
    priority: "medium",
    due_date: null,
    assigned_to: null,
    created_by: "user-1",
    circle_id: null,
    goal_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as Task;
}

describe("KanbanBoard", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("flags a column that exceeds its default WIP limit", () => {
    const tasks = Array.from({ length: 6 }, (_, index) =>
      makeTask({ id: `task-${index}`, title: `Task ${index}`, status: "in_progress" }),
    );

    render(<KanbanBoard initialTasks={tasks} />);

    expect(screen.getByText("6 / 5")).toBeInTheDocument();
    expect(screen.getByText(/Over WIP limit/i)).toBeInTheDocument();
  });

  it("does not warn when a column is within its WIP limit", () => {
    const tasks = Array.from({ length: 2 }, (_, index) =>
      makeTask({ id: `task-${index}`, title: `Task ${index}`, status: "in_progress" }),
    );

    render(<KanbanBoard initialTasks={tasks} />);

    expect(screen.getByText("2 / 5")).toBeInTheDocument();
    expect(screen.queryByText(/Over WIP limit/i)).not.toBeInTheDocument();
  });

  it("groups tasks into priority swimlanes when toggled on", async () => {
    const tasks = [
      makeTask({ id: "high-1", title: "High task", status: "todo", priority: "high" }),
      makeTask({ id: "low-1", title: "Low task", status: "todo", priority: "low" }),
    ];

    render(<KanbanBoard initialTasks={tasks} />);

    expect(screen.queryByText("No high priority tasks")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /group by priority/i }));

    expect(screen.getByText("High task")).toBeInTheDocument();
    expect(screen.getByText("Low task")).toBeInTheDocument();
    expect(screen.getAllByText("No medium priority tasks").length).toBeGreaterThan(0);
  });
});
