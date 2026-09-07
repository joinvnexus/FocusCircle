import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TourProvider, TourLauncher } from "@/components/shared/tour-system";

describe("Tour system", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("does not render a launcher for an unknown tour id", () => {
    render(
      <TourProvider>
        <TourLauncher tourId="does-not-exist" />
      </TourProvider>,
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("walks through a predefined tour and marks it completed on finish", async () => {
    render(
      <TourProvider>
        <TourLauncher tourId="dashboard-intro" />
      </TourProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: /start tour/i }));

    expect(screen.getByText("Dashboard Overview - Step 1 of 5")).toBeInTheDocument();
    expect(screen.getByText("Your Focus Snapshot")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^next$/i }));
    expect(screen.getByText("Dashboard Overview - Step 2 of 5")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^back$/i }));
    expect(screen.getByText("Dashboard Overview - Step 1 of 5")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /close tour/i }));

    // Ending early still marks the tour completed, and the launcher offers
    // to retake it afterwards.
    expect(screen.getByRole("button", { name: /retake/i })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("focuscircle:completed-tours") ?? "[]")).toContain(
      "dashboard-intro",
    );
  });

  it("completing every step also marks the tour as done", async () => {
    render(
      <TourProvider>
        <TourLauncher tourId="notifications-intro" />
      </TourProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: /start tour/i }));

    // notifications-intro has 3 steps; click Next twice then Done.
    await userEvent.click(screen.getByRole("button", { name: /^next$/i }));
    await userEvent.click(screen.getByRole("button", { name: /^next$/i }));
    await userEvent.click(screen.getByRole("button", { name: /^done$/i }));

    expect(JSON.parse(window.localStorage.getItem("focuscircle:completed-tours") ?? "[]")).toContain(
      "notifications-intro",
    );
    expect(screen.queryByText(/Notifications Center - Step/i)).not.toBeInTheDocument();
  });
});
