import { describe, expect, it } from "vitest";
import { extractMentions, formatStatusLabel, getSubtaskProgress, safePercentage } from "@/lib/utils";

describe("utils", () => {
  it("extracts mentions uniquely and lowercases them", () => {
    const mentions = extractMentions("@Sam and @sarah, plus @Sam again");
    expect(mentions).toEqual(["sam", "sarah"]);
  });

  it("formats status labels", () => {
    expect(formatStatusLabel("in_progress")).toBe("In Progress");
  });

  it("returns safe percentages", () => {
    expect(safePercentage(3, 6)).toBe(50);
    expect(safePercentage(0, 0)).toBe(0);
    expect(safePercentage(10, 4)).toBe(100);
  });

  it("rolls up subtask progress", () => {
    expect(getSubtaskProgress(undefined)).toEqual({ total: 0, completed: 0, percent: 0 });
    expect(getSubtaskProgress([])).toEqual({ total: 0, completed: 0, percent: 0 });
    expect(
      getSubtaskProgress([{ is_done: true }, { is_done: false }, { is_done: true }, { is_done: false }]),
    ).toEqual({ total: 4, completed: 2, percent: 50 });
    expect(getSubtaskProgress([{ is_done: true }])).toEqual({ total: 1, completed: 1, percent: 100 });
  });
});
