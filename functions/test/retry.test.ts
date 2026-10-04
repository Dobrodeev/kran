import { describe, it, expect, vi } from "vitest";
import { withRetry } from "../src/ai/retry";

const apiError = (status: number) => Object.assign(new Error(`status ${status}`), { status });

describe("withRetry", () => {
  it("retries transient errors and returns the eventual result", async () => {
    const fn = vi.fn().mockRejectedValueOnce(apiError(503)).mockRejectedValueOnce(apiError(429)).mockResolvedValue("ok");
    await expect(withRetry(fn, { baseDelayMs: 1 })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("gives up after the configured number of attempts", async () => {
    const fn = vi.fn().mockRejectedValue(apiError(503));
    await expect(withRetry(fn, { attempts: 2, baseDelayMs: 1 })).rejects.toThrow("status 503");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("does not retry non-transient errors", async () => {
    const fn = vi.fn().mockRejectedValue(apiError(404));
    await expect(withRetry(fn, { baseDelayMs: 1 })).rejects.toThrow("status 404");
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
