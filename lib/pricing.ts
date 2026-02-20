import { PricingConfig, QuoteEstimate, MealSelection, MenuConfig } from "./types";

function toNum(val: number | string | undefined): number {
  if (val === "" || val === undefined) return 0;
  const n = typeof val === "string" ? parseFloat(val) : val;
  return isNaN(n) ? 0 : n;
}

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
      ? toNum(eventTypeEntry.price) * guestCount
      : toNum(eventTypeEntry.price)
    : 0;
  const serviceStyleEntry = config.serviceStyles[serviceStyle];
  const serviceStylePrice = serviceStyleEntry
    ? serviceStyleEntry.pricingType === "per-person"
      ? toNum(serviceStyleEntry.price) * guestCount
      : toNum(serviceStyleEntry.price)
    : 0;
  const perPersonTotal = toNum(config.perPersonRate) * guestCount;

  const addOnBreakdown = selectedAddOnIds
    .map((id) => {
      const addOn = config.addOns.find((a) => a.id === id);
      if (!addOn) return null;
      const amount =
        addOn.pricingType === "per-person"
          ? toNum(addOn.price) * guestCount
          : toNum(addOn.price);
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

export function formatCurrency(amount: number | string): string {
  if (typeof amount === "string") amount = parseFloat(amount) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
