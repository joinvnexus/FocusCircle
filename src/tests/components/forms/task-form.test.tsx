import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskForm } from "@/components/forms/task-form";
import * as taskActions from "@/app/actions/tasks";

vi.mock("@/app/actions/tasks", () => ({
  createTaskAction: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("TaskForm", () => {
  it("submits a new task", async () => {
    const createTaskAction = vi.mocked(taskActions.createTaskAction);
    const circleId = "2f1c9e3b-4c7a-4d47-8f5e-2a0e6b9f4a2c";
    const goalId = "9a9df8ef-7df1-4df3-8b8d-3c0e0e9f4b0d";
    render(
      <TaskForm
        circles={[{ id: circleId, name: "Circle One" }]}
        goalOptions={[{ id: goalId, title: "Goal One" }]}
      />,
    );

    await userEvent.type(screen.getByLabelText("Title"), "Write tests");
    const selects = Array.from(document.querySelectorAll("select"));
    fireEvent.change(selects[2], { target: { value: circleId } });
    fireEvent.change(selects[3], { target: { value: goalId } });
    await userEvent.click(screen.getByRole("button", { name: /create task/i }));

    await waitFor(() => {
      expect(createTaskAction).toHaveBeenCalledTimes(1);
    });

    const firstCall = createTaskAction.mock.calls.at(0);
    expect(firstCall).toBeDefined();
    const payload = (firstCall as unknown as [Record<string, unknown>])[0];
    expect(payload.title).toBe("Write tests");
    expect(payload.circleId).toBe(circleId);
    expect(payload.goalId).toBe(goalId);
  });
});
