export interface PriceCalculationInput {
  basePricePence: number;
  materialsPricePence: number;
  travelPricePence: number;
  materialsPolicy?: 'client_provides' | 'freelancer_provides' | 'both';
  locationType?: 'client_travels_to_freelancer' | 'freelancer_travels_to_client';
  clientProvidesOwnMaterials?: boolean;
}

export interface PriceBreakdown {
  basePricePence: number;
  materialsPricePence: number;
  travelPricePence: number;
  platformFeePence: number;
  totalPence: number;
}

const PLATFORM_FEE_PERCENTAGE = 10;

export function calculateBookingPrice(input: PriceCalculationInput): PriceBreakdown {
  const basePricePence = input.basePricePence;

  let materialsPricePence = 0;
  if (input.materialsPolicy === 'freelancer_provides' || 
      (input.materialsPolicy === 'both' && !input.clientProvidesOwnMaterials)) {
    materialsPricePence = input.materialsPricePence;
  }

  let travelPricePence = 0;
  if (input.locationType === 'freelancer_travels_to_client') {
    travelPricePence = input.travelPricePence;
  }

  const subtotal = basePricePence + materialsPricePence + travelPricePence;
  const platformFeePence = Math.round(subtotal * (PLATFORM_FEE_PERCENTAGE / 100));
  const totalPence = subtotal;

  return {
    basePricePence,
    materialsPricePence,
    travelPricePence,
    platformFeePence,
    totalPence,
  };
}

export function formatPricePence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}
