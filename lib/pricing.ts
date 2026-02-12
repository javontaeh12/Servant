import { PricingConfig, QuoteEstimate } from "./types";

export function calculateEstimate(
  config: PricingConfig,
  eventType: string,
  serviceStyle: string,
  guestCount: number,
  selectedAddOnIds: string[]
): QuoteEstimate {
  const eventTypePrice = config.eventTypes[eventType] ?? 0;
  const serviceStylePrice = config.serviceStyles[serviceStyle] ?? 0;
  const perPersonTotal = config.perPersonRate * guestCount;

  const addOnBreakdown = selectedAddOnIds
    .map((id) => {
      const addOn = config.addOns.find((a) => a.id === id);
      if (!addOn) return null;
      const amount =
        addOn.pricingType === "per-person"
          ? addOn.price * guestCount
          : addOn.price;
      return { name: addOn.name, amount };
    })
    .filter((item): item is { name: string; amount: number } => item !== null);

  const addOnsTotal = addOnBreakdown.reduce((sum, item) => sum + item.amount, 0);
  const total = eventTypePrice + serviceStylePrice + perPersonTotal + addOnsTotal;

  return {
    eventTypePrice,
    serviceStylePrice,
    perPersonTotal,
    addOnBreakdown,
    addOnsTotal,
    total,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
