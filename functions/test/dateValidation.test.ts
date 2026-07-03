import { describe, it, expect } from "vitest";
import { parseIsoDateTime, isValidBookingRange } from "../src/booking/dateValidation";

describe("parseIsoDateTime", () => {
  it("parses a valid ISO string", () => {
    expect(parseIsoDateTime("2026-07-03T09:00:00Z")).toEqual(new Date("2026-07-03T09:00:00Z"));
  });

  it("returns null for invalid input", () => {
    expect(parseIsoDateTime("not-a-date")).toBeNull();
  });
});

describe("isValidBookingRange", () => {
  const now = new Date("2026-07-01T00:00:00Z");

  it("rejects a start time in the past", () => {
    const result = isValidBookingRange(new Date("2026-06-30T00:00:00Z"), new Date("2026-07-02T00:00:00Z"), now);
    expect(result).toEqual({ valid: false, reason: "start_in_past" });
  });

  it("rejects an end time before the start time", () => {
    const result = isValidBookingRange(new Date("2026-07-03T12:00:00Z"), new Date("2026-07-03T09:00:00Z"), now);
    expect(result).toEqual({ valid: false, reason: "end_before_start" });
  });

  it("accepts a valid range", () => {
    const result = isValidBookingRange(new Date("2026-07-03T09:00:00Z"), new Date("2026-07-03T12:00:00Z"), now);
    expect(result).toEqual({ valid: true });
  });
});
