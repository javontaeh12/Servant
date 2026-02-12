import { NavLink, Service, Testimonial, Value } from "./types";

export const BUSINESS = {
  name: "I'm A Servant First LLC",
  tagline: "Upscale Southern Catering, Crafted with Heart",
  phone: "(555) 123-4567",
  email: "info@imaservantfirst.com",
  address: "North Carolina",
  hours: {
    weekdays: "Mon - Fri: 9:00 AM - 7:00 PM",
    weekends: "Sat - Sun: 10:00 AM - 5:00 PM",
  },
} as const;

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Quote", href: "/quote" },
  { label: "Contact", href: "/contact" },
];

export const SERVICES: Service[] = [
  {
    name: "Wedding Receptions",
    description:
      "Make your special day unforgettable with a menu crafted to match your love story. From elegant plated dinners to lavish buffets, we bring the soul of southern cuisine to your celebration.",
    icon: "Heart",
    included: [
      "Custom menu consultation",
      "Professional service staff",
      "Elegant table presentation",
      "Complimentary tasting for couples",
      "Setup and cleanup included",
    ],
  },
  {
    name: "Corporate Events",
    description:
      "Elevate your business gatherings with catering that leaves a lasting impression. Power lunches, galas, and team celebrations — all with a refined southern touch.",
    icon: "Building2",
    included: [
      "Breakfast, lunch & dinner options",
      "Dietary accommodation",
      "Professional uniformed staff",
      "Branded presentation available",
      "Flexible scheduling",
    ],
  },
  {
    name: "Private Dinner Parties",
    description:
      "Transform your home into a fine dining experience. Our intimate catering brings chef-quality southern cuisine directly to your table for an evening your guests won't forget.",
    icon: "UtensilsCrossed",
    included: [
      "Personal chef experience",
      "Multi-course meal options",
      "Wine pairing suggestions",
      "Intimate table styling",
      "Full service from start to finish",
    ],
  },
  {
    name: "Holiday & Seasonal Events",
    description:
      "From Thanksgiving spreads to New Year's celebrations, we bring the warmth of southern tradition to every holiday gathering with menus that feel like home.",
    icon: "PartyPopper",
    included: [
      "Seasonal menu specialties",
      "Traditional southern dishes",
      "Custom dessert options",
      "Family-style or plated service",
      "Holiday décor coordination",
    ],
  },
  {
    name: "Church & Community Events",
    description:
      "Nourish your congregation and community with hearty, soulful meals prepared with love. From Sunday dinners to fundraisers, we serve with a servant's heart.",
    icon: "Church",
    included: [
      "Large group capacity",
      "Budget-friendly packages",
      "Buffet-style service",
      "Volunteer coordination support",
      "Delivery and setup",
    ],
  },
  {
    name: "Funeral Repasts",
    description:
      "During times of loss, let us take the burden of feeding your family and friends. We provide comforting, home-style meals with dignity and grace.",
    icon: "HandHeart",
    included: [
      "Compassionate, discreet service",
      "Comfort food menu options",
      "Flexible timing",
      "Full setup and cleanup",
      "Coordination with venue",
    ],
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Angela R.",
    event: "Wedding Reception",
    quote:
      "From the first bite, our guests knew this was something special. The mac & cheese, the smoked brisket — everything was perfection. They didn't just cater our wedding, they elevated it.",
  },
  {
    name: "Marcus T.",
    event: "Corporate Gala",
    quote:
      "We've used several caterers for our company events, but none compare. The presentation was stunning, the food was incredible, and the team was so professional. Our clients were blown away.",
  },
  {
    name: "Diane W.",
    event: "Family Reunion",
    quote:
      "It felt like my grandmother was in the kitchen. The collard greens, the cornbread, the peach cobbler — everything tasted like home but looked like a five-star restaurant. Absolutely amazing.",
  },
];

export const VALUES: Value[] = [
  {
    title: "Servant Leadership",
    description:
      "We lead by serving. Every dish, every interaction is guided by our commitment to putting your needs first.",
    icon: "HandHeart",
  },
  {
    title: "Southern Hospitality",
    description:
      "Warmth, generosity, and genuine care — the heart of southern culture is the heart of everything we do.",
    icon: "Home",
  },
  {
    title: "Culinary Excellence",
    description:
      "We honor traditional southern recipes while elevating them with modern technique and premium ingredients.",
    icon: "ChefHat",
  },
  {
    title: "Attention to Detail",
    description:
      "From the seasoning to the table setting, every detail matters. We don't cut corners — we set them beautifully.",
    icon: "Sparkles",
  },
];

export const EVENT_TYPES = [
  "Wedding Reception",
  "Corporate Event",
  "Private Dinner Party",
  "Holiday Event",
  "Church / Community Event",
  "Funeral Repast",
  "Other",
] as const;

export const SERVICE_STYLES = [
  "Full Catering (Buffet)",
  "Plated Dinner Service",
  "Appetizers & Hors d'oeuvres",
  "Family-Style Service",
  "Dessert Bar",
  "Custom Package",
] as const;
