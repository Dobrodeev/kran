import { describe, it, expect } from "vitest";
import { hasOverlap } from "../src/booking/availability";

describe("hasOverlap", () => {
  it("returns false when no existing bookings", () => {
    const candidate = { startAt: new Date("2026-07-03T09:00:00Z"), endAt: new Date("2026-07-03T12:00:00Z") };
    expect(hasOverlap(candidate, [])).toBe(false);
  });

  it("returns true when candidate overlaps an existing booking", () => {
    const candidate = { startAt: new Date("2026-07-03T09:00:00Z"), endAt: new Date("2026-07-03T12:00:00Z") };
    const existing = [{ startAt: new Date("2026-07-03T11:00:00Z"), endAt: new Date("2026-07-03T14:00:00Z") }];
    expect(hasOverlap(candidate, existing)).toBe(true);
  });

  it("returns false when candidate is fully before an existing booking", () => {
    const candidate = { startAt: new Date("2026-07-03T09:00:00Z"), endAt: new Date("2026-07-03T10:00:00Z") };
    const existing = [{ startAt: new Date("2026-07-03T10:00:00Z"), endAt: new Date("2026-07-03T12:00:00Z") }];
    expect(hasOverlap(candidate, existing)).toBe(false);
  });

  it("returns false when candidate is fully after an existing booking", () => {
    const candidate = { startAt: new Date("2026-07-03T12:00:00Z"), endAt: new Date("2026-07-03T14:00:00Z") };
    const existing = [{ startAt: new Date("2026-07-03T09:00:00Z"), endAt: new Date("2026-07-03T12:00:00Z") }];
    expect(hasOverlap(candidate, existing)).toBe(false);
  });
});
