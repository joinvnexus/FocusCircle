import { describe, expect, it } from "vitest";
import { extractMentions, formatStatusLabel, safePercentage } from "@/lib/utils";

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
});
