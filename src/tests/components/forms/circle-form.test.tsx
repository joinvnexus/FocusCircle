import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CircleCreationCard, CircleJoinCard } from "@/components/forms/circle-form";
import * as circleActions from "@/app/actions/circles";

vi.mock("@/app/actions/circles", () => ({
  createCircleAction: vi.fn().mockResolvedValue({ error: null }),
  joinCircleAction: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("Circle forms", () => {
  it("creates a circle", async () => {
    const createCircleAction = vi.mocked(circleActions.createCircleAction);
    render(<CircleCreationCard />);

    await userEvent.type(screen.getByLabelText("Name"), "Focus Crew");
    await userEvent.type(screen.getByLabelText("Description"), "Weekly planning");
    await userEvent.click(screen.getByRole("button", { name: /create circle/i }));

    await waitFor(() => {
      expect(createCircleAction).toHaveBeenCalledTimes(1);
    });

    const firstCall = createCircleAction.mock.calls.at(0);
    expect(firstCall).toBeDefined();
    expect((firstCall as unknown as [Record<string, unknown>])[0]).toMatchObject({
      name: "Focus Crew",
      description: "Weekly planning",
    });
  });

  it("joins a circle with invite code", async () => {
    const joinCircleAction = vi.mocked(circleActions.joinCircleAction);
    render(<CircleJoinCard />);

    await userEvent.type(screen.getByLabelText("Invite code"), "AB12CD34");
    await userEvent.click(screen.getByRole("button", { name: /join circle/i }));

    await waitFor(() => {
      expect(joinCircleAction).toHaveBeenCalledTimes(1);
    });

    expect(joinCircleAction).toHaveBeenCalledWith("AB12CD34");
  });
});
