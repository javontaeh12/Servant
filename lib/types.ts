export interface TimeSlot {
  start: string;
  end: string;
  label: string;
}

export interface BookingData {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  eventType: string;
  serviceType: string;
  dietaryNeeds: string;
  notes: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Service {
  name: string;
  description: string;
  icon: string;
  included: string[];
}

export interface Testimonial {
  name: string;
  event: string;
  quote: string;
}

export interface Value {
  title: string;
  description: string;
  icon: string;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  pricingType: "per-person" | "flat";
  price: number;
}

export interface PricingConfig {
  eventTypes: Record<string, number>;
  serviceStyles: Record<string, number>;
  perPersonRate: number;
  addOns: AddOn[];
}

export interface QuoteEstimate {
  eventTypePrice: number;
  serviceStylePrice: number;
  perPersonTotal: number;
  addOnBreakdown: { name: string; amount: number }[];
  addOnsTotal: number;
  mealSelectionPrice: number;
  total: number;
}

// Menu system
export interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  pricePerPerson: number;
  isAvailable: boolean;
}

export interface PresetMeal {
  id: string;
  name: string;
  description: string;
  itemIds: string[];
  pricePerPerson: number;
  isAvailable: boolean;
}

export interface MenuConfig {
  categories: MenuCategory[];
  items: MenuItem[];
  presetMeals: PresetMeal[];
}

export interface MealSelection {
  type: "preset" | "custom";
  presetMealId?: string;
  selectedItemIds?: string[];
}

// Calendar
export interface CalendarBooking {
  id: string;
  summary: string;
  description: string;
  start: string;
  end: string;
  status: string;
  created: string;
}

// Square
export interface SquarePayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  receiptUrl: string;
  createdAt: string;
}
