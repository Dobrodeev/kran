export interface BookingInterval {
  startAt: Date;
  endAt: Date;
}

export function hasOverlap(candidate: BookingInterval, existing: BookingInterval[]): boolean {
  return existing.some((b) => candidate.startAt < b.endAt && candidate.endAt > b.startAt);
}
