import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalProgressChart, TaskPriorityChart, WeeklyTasksChart } from "@/components/dashboard/productivity-charts";

describe("Productivity charts — CSV export", () => {
  let clickSpy: ReturnType<typeof vi.fn>;
  let createdAnchor: HTMLAnchorElement | null;

  beforeEach(() => {
    createdAnchor = null;
    clickSpy = vi.fn();
    URL.createObjectURL = vi.fn(() => "blob:mock-url");
    URL.revokeObjectURL = vi.fn();

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName === "a") {
        createdAnchor = el as HTMLAnchorElement;
        el.click = clickSpy;
      }
      return el;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exports weekly productivity data as a downloadable CSV", async () => {
    render(<WeeklyTasksChart data={[{ day: "Mon", completed: 3, tasks: [{ id: "1", title: "Ship report" }] }]} />);

    await userEvent.click(screen.getByRole("button", { name: /export csv/i }));

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(createdAnchor?.download).toBe("weekly-productivity.csv");
    expect(clickSpy).toHaveBeenCalled();
  });

  it("exports goal progress data as a downloadable CSV", async () => {
    render(<GoalProgressChart data={[{ name: "Launch v2", progress: 80 }]} />);

    await userEvent.click(screen.getByRole("button", { name: /export csv/i }));

    expect(createdAnchor?.download).toBe("goal-progress.csv");
    expect(clickSpy).toHaveBeenCalled();
  });

  it("exports task priority mix data as a downloadable CSV", async () => {
    render(<TaskPriorityChart data={[{ priority: "high", count: 4 }]} />);

    await userEvent.click(screen.getByRole("button", { name: /export csv/i }));

    expect(createdAnchor?.download).toBe("task-priority-mix.csv");
    expect(clickSpy).toHaveBeenCalled();
  });

  it("shows a hint that the weekly chart supports drill-down", () => {
    render(<WeeklyTasksChart data={[{ day: "Mon", completed: 3 }]} />);
    expect(screen.getByText(/click a bar to see which tasks were completed/i)).toBeInTheDocument();
  });
});
