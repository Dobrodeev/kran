export function computePrice(hourlyRate: number, minHours: number, startAt: Date, endAt: Date): number {
  const rawHours = (endAt.getTime() - startAt.getTime()) / 3_600_000;
  const billableHours = Math.max(minHours, Math.ceil(rawHours));
  return billableHours * hourlyRate;
}
