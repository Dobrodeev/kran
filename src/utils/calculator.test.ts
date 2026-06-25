import { describe, it, expect } from 'vitest';
import { calculateRentalCost } from './calculator';
import type { Crane } from '../types';

const mockCraneXCMG25: Crane = {
  id: 'xcmg-25',
  name: 'XCT25',
  brand: 'XCMG',
  capacity: 25,
  boomLength: 39,
  minOrderHours: 8,
  hourlyRate: 1800,
  shiftRate: 14400,
  image: '',
  isAvailableToday: true,
  isSpecialPrice: false,
  description: 'Test Crane 25t'
};

const mockCraneLiebherr40: Crane = {
  id: 'liebherr-40',
  name: 'LTM 1040',
  brand: 'Liebherr',
  capacity: 40,
  boomLength: 35,
  minOrderHours: 8,
  hourlyRate: 2400,
  shiftRate: 19200,
  image: '',
  isAvailableToday: true,
  isSpecialPrice: false,
  description: 'Test Crane 40t'
};

describe('calculateRentalCost', () => {
  it('should enforce minimum order of 8 hours (1 shift) if fewer hours requested', () => {
    // 4 hours request on 1800/hr crane -> should charge 8 * 1800 = 14400 UAH
    const result = calculateRentalCost(mockCraneXCMG25, 4, true);
    expect(result.baseRentCost).toBe(14400);
    expect(result.deliveryCost).toBe(0);
    expect(result.permitCost).toBe(0);
    expect(result.totalCostExcludingVat).toBe(14400);
    expect(result.vatCost).toBe(2880);
    expect(result.totalCostIncludingVat).toBe(17280);
  });

  it('should charge correct hourly rate for hours above minimum shift', () => {
    // 10 hours request on 1800/hr crane -> should charge 10 * 1800 = 18000 UAH
    const result = calculateRentalCost(mockCraneXCMG25, 10, true);
    expect(result.baseRentCost).toBe(18000);
    expect(result.totalCostExcludingVat).toBe(18000);
  });

  it('should charge 0 delivery inside KP', () => {
    const result = calculateRentalCost(mockCraneXCMG25, 8, true, 20);
    expect(result.deliveryCost).toBe(0);
  });

  it('should charge 50 UAH/km for delivery outside KP', () => {
    // 15 km outside KP -> 15 * 50 = 750 UAH
    const result = calculateRentalCost(mockCraneXCMG25, 8, false, 15);
    expect(result.deliveryCost).toBe(750);
  });

  it('should add permit fee of 1500 UAH for heavy crane (>=40 tons) in center', () => {
    const result = calculateRentalCost(mockCraneLiebherr40, 8, true, 0, true);
    expect(result.permitCost).toBe(1500);
    expect(result.totalCostExcludingVat).toBe(19200 + 1500);
  });

  it('should NOT add permit fee for light crane (<40 tons) in center', () => {
    const result = calculateRentalCost(mockCraneXCMG25, 8, true, 0, true);
    expect(result.permitCost).toBe(0);
  });
});
