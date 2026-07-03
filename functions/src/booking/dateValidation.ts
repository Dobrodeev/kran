export function parseIsoDateTime(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isValidBookingRange(
  startAt: Date,
  endAt: Date,
  now: Date
): { valid: boolean; reason?: string } {
  if (startAt <= now) {
    return { valid: false, reason: "start_in_past" };
  }
  if (endAt <= startAt) {
    return { valid: false, reason: "end_before_start" };
  }
  return { valid: true };
}
