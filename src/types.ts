export interface Crane {
  id: string;
  name: string;
  brand: string;
  capacity: number; // in tons
  boomLength: number; // in meters
  minOrderHours: number; // standard shift is 8 hours
  hourlyRate: number; // UAH per hour
  shiftRate: number; // UAH per 8-hour shift
  image: string; // URL or local path
  isAvailableToday: boolean;
  isSpecialPrice: boolean;
  description: string;
}

export interface KyivZone {
  id: string;
  name: string;
  deliveryCostInsideKp: number; // flat fee (e.g. 0 if included, or fixed)
  pricePerKmOutsideKp: number; // e.g. 50 UAH/km
  description: string;
}

export interface BookingDetails {
  craneId: string;
  date: string;
  hours: number;
  location: string;
  insideKp: boolean;
  distanceOutsideKm: number;
  contactName: string;
  contactPhone: string;
}

export interface CalculationResult {
  baseRentCost: number;
  deliveryCost: number;
  permitCost: number; // for heavy crane center entry
  totalCostExcludingVat: number;
  vatCost: number;
  totalCostIncludingVat: number;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  readTime: string;
  date: string;
  image?: string;
}
