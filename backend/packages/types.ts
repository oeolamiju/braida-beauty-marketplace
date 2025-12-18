export interface ServicePackage {
  id: number;
  freelancerId: string;
  name: string;
  description: string | null;
  discountPercent: number;
  discountAmountPence: number;
  isActive: boolean;
  imageUrl: string | null;
  validUntil: string | null;
  maxUses: number | null;
  currentUses: number;
  services: PackageService[];
  originalPricePence: number;
  discountedPricePence: number;
  totalDurationMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface PackageService {
  id: number;
  serviceId: number;
  title: string;
  durationMinutes: number;
  pricePence: number;
  sortOrder: number;
}

