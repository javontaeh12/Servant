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
  price: number | string;
}

export interface PricingEntry {
  price: number | string;
  pricingType: "flat" | "per-person";
}

export interface PricingConfig {
  eventTypes: Record<string, PricingEntry>;
  serviceStyles: Record<string, PricingEntry>;
  perPersonRate: number | string;
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
  image?: string;
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

// Business Info (admin-managed)
export interface BusinessInfo {
  email: string;
  phone: string;
  address: string;
  hours: {
    weekdays: string;
    weekends: string;
  };
  aboutUs: string[];
  aboutImage: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    tiktok: string;
    youtube: string;
  };
}

// Bookings
export type BookingStatus = "pending" | "approved" | "rejected";

export interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  eventType: string;
  serviceStyle: string;
  dietaryNeeds: string;
  notes: string;
  status: BookingStatus;
  estimatedTotal: number | null;
  invoiceId: string | null;
  invoiceUrl: string | null;
  mealInfo: string | null;
  createdAt: string;
  updatedAt: string;
}

// Gallery
export interface GalleryImage {
  id: string;
  src: string;
  caption: string;
  sortOrder: number;
}

export interface GalleryConfig {
  images: GalleryImage[];
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
