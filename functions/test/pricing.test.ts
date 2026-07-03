import { describe, it, expect } from "vitest";
import { computePrice } from "../src/booking/pricing";

describe("computePrice", () => {
  it("charges exactly for full hours", () => {
    const price = computePrice(1000, 2, new Date("2026-07-03T09:00:00Z"), new Date("2026-07-03T12:00:00Z"));
    expect(price).toBe(3000);
  });

  it("rounds up partial hours", () => {
    const price = computePrice(1000, 2, new Date("2026-07-03T09:00:00Z"), new Date("2026-07-03T10:30:00Z"));
    expect(price).toBe(2000);
  });

  it("applies the minimum hours floor", () => {
    const price = computePrice(1000, 3, new Date("2026-07-03T09:00:00Z"), new Date("2026-07-03T10:00:00Z"));
    expect(price).toBe(3000);
  });
});
