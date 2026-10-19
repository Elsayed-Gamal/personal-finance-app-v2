import { describe, expect, it } from "vitest";
import { recurringSummary } from "../app/_features/overview/recurringSummary";

describe("overview recurring payment estimates", () => {
  const now = new Date("2026-10-19T12:00:00Z");
  it("separates recorded current-month payments from estimates without counting income", () => {
    expect(
      recurringSummary(
        [
          { amount: -100, date: "2026-10-01", day: 1 },
          { amount: -20, date: "2026-09-20", day: 20 },
          { amount: -30, date: "2026-09-28", day: 28 },
          { amount: 500, date: "2026-10-01", day: 1 },
          { amount: -50, date: "2026-11-01", day: 1 },
        ],
        now,
      ),
    ).toEqual({ paid: 100, upcoming: 50, dueSoon: 20 });
  });
  it("clamps monthly due dates to the end of a shorter month", () => {
    expect(
      recurringSummary(
        [{ amount: -10, date: "2026-01-31", day: 31 }],
        new Date("2026-02-27T12:00:00Z"),
      ),
    ).toEqual({ paid: 0, upcoming: 10, dueSoon: 10 });
  });
  it("keeps overdue unpaid estimates in upcoming without labeling them due soon", () => {
    expect(
      recurringSummary([{ amount: -10, date: "2026-09-10", day: 10 }], now),
    ).toEqual({ paid: 0, upcoming: 10, dueSoon: 0 });
  });
  it("handles empty lists and ignores invalid or missing records", () => {
    expect(recurringSummary([], now)).toEqual({
      paid: 0,
      upcoming: 0,
      dueSoon: 0,
    });
    expect(
      recurringSummary(
        [
          { amount: -20, day: 20 },
          { amount: "invalid", date: "2026-10-01" },
          { amount: -20, date: "2026-09-01", day: 32 },
        ],
        now,
      ),
    ).toEqual({ paid: 0, upcoming: 0, dueSoon: 0 });
  });
});
