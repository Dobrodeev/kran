import type { Crane, CalculationResult } from '../types';

/**
 * Calculates the total rental and delivery costs for a crane.
 * 
 * @param crane The Crane object
 * @param hours Number of hours rented (minimum of 8 hours / 1 shift)
 * @param insideKp Whether delivery is within Kyiv CP (checkpoint) limits
 * @param distanceOutsideKm Distance in km outside CP limits
 * @param requiresCenterPermit Whether a special city center transit permit is needed
 */
export function calculateRentalCost(
  crane: Crane,
  hours: number,
  insideKp: boolean,
  distanceOutsideKm: number = 0,
  requiresCenterPermit: boolean = false
): CalculationResult {
  // Base rent: Minimum order is crane.minOrderHours (usually 8)
  const billedHours = Math.max(hours, crane.minOrderHours);
  const baseRentCost = billedHours * crane.hourlyRate;

  // Delivery cost: inside KP is free (0), outside is 50 UAH/km
  // Usually, delivery is calculated round-trip (departure + return), 
  // but to keep it simple and match the spec: "+50 UAH/km outside KP"
  const deliveryCost = insideKp ? 0 : distanceOutsideKm * 50;

  // Permit cost: Heavy cranes (> 30 tons) entering the city center need a special permit
  // Let's charge a flat fee of 1500 UAH for the permit if selected and crane is heavy
  const permitCost = (requiresCenterPermit && crane.capacity >= 40) ? 1500 : 0;

  const totalCostExcludingVat = baseRentCost + deliveryCost + permitCost;
  const vatCost = Math.round(totalCostExcludingVat * 0.2);
  const totalCostIncludingVat = totalCostExcludingVat + vatCost;

  return {
    baseRentCost,
    deliveryCost,
    permitCost,
    totalCostExcludingVat,
    vatCost,
    totalCostIncludingVat
  };
}
