import { PricingConfig, QuoteEstimate, MealSelection, MenuConfig } from "./types";

export function calculateEstimate(
  config: PricingConfig,
  eventType: string,
  serviceStyle: string,
  guestCount: number,
  selectedAddOnIds: string[],
  mealSelection?: MealSelection,
  menuConfig?: MenuConfig
): QuoteEstimate {
  const eventTypeEntry = config.eventTypes[eventType];
  const eventTypePrice = eventTypeEntry
    ? eventTypeEntry.pricingType === "per-person"
      ? eventTypeEntry.price * guestCount
      : eventTypeEntry.price
    : 0;
  const serviceStyleEntry = config.serviceStyles[serviceStyle];
  const serviceStylePrice = serviceStyleEntry
    ? serviceStyleEntry.pricingType === "per-person"
      ? serviceStyleEntry.price * guestCount
      : serviceStyleEntry.price
    : 0;
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

  let mealSelectionPrice = 0;
  if (mealSelection && menuConfig) {
    if (mealSelection.type === "preset" && mealSelection.presetMealId) {
      const preset = menuConfig.presetMeals.find(
        (p) => p.id === mealSelection.presetMealId
      );
      if (preset) {
        mealSelectionPrice = preset.pricePerPerson * guestCount;
      }
    } else if (mealSelection.type === "custom" && mealSelection.selectedItemIds) {
      const itemTotal = mealSelection.selectedItemIds.reduce((sum, itemId) => {
        const item = menuConfig.items.find((i) => i.id === itemId);
        return sum + (item ? item.pricePerPerson : 0);
      }, 0);
      mealSelectionPrice = itemTotal * guestCount;
    }
  }

  const total =
    eventTypePrice + serviceStylePrice + perPersonTotal + addOnsTotal + mealSelectionPrice;

  return {
    eventTypePrice,
    serviceStylePrice,
    perPersonTotal,
    addOnBreakdown,
    addOnsTotal,
    mealSelectionPrice,
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
