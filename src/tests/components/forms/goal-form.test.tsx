import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalForm, GoalProgressInput } from "@/components/forms/goal-form";
import * as goalActions from "@/app/actions/goals";

vi.mock("@/app/actions/goals", () => ({
  createGoalAction: vi.fn().mockResolvedValue({ error: null }),
  updateGoalProgressAction: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("GoalForm", () => {
  it("submits a new goal", async () => {
    const createGoalAction = vi.mocked(goalActions.createGoalAction);
    render(<GoalForm circles={[{ id: "circle-1", name: "Circle One" }]} />);

    await userEvent.type(screen.getByLabelText("Title"), "Ship release");
    await userEvent.click(screen.getByRole("button", { name: /create goal/i }));

    await waitFor(() => {
      expect(createGoalAction).toHaveBeenCalledTimes(1);
    });

    const firstCall = createGoalAction.mock.calls.at(0);
    expect(firstCall).toBeDefined();
    expect((firstCall as unknown as [Record<string, unknown>])[0]).toMatchObject({
      title: "Ship release",
      circleId: "circle-1",
    });
  });

  it("updates goal progress on blur", async () => {
    const updateGoalProgressAction = vi.mocked(goalActions.updateGoalProgressAction);
    render(<GoalProgressInput goalId="goal-1" progress={25} />);

    const input = screen.getByRole("spinbutton");
    await userEvent.clear(input);
    await userEvent.type(input, "60");
    input.blur();

    await waitFor(() => {
      expect(updateGoalProgressAction).toHaveBeenCalledTimes(1);
    });

    expect(updateGoalProgressAction).toHaveBeenCalledWith("goal-1", 60);
  });
});
