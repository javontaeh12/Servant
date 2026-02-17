import { put, list } from "@vercel/blob";
import { BusinessInfo } from "./types";

const BUSINESS_JSON_PATH = "data/business.json";

const DEFAULT_BUSINESS: BusinessInfo = {
  email: "contact@imaservantfirst.com",
  phone: "910-293-2333",
  address: "North Carolina",
  hours: {
    weekdays: "Mon - Fri: 9:00 AM - 7:00 PM",
    weekends: "Sat - Sun: 10:00 AM - 5:00 PM",
  },
  aboutUs: [
    "At I'm A Servant First LLC, our name is our promise. Before we are caterers, before we are chefs, we are servants. Every dish we prepare and every table we set is an act of service — rooted in love, excellence, and the rich tradition of southern hospitality.",
    "Born from a deep passion for bringing people together around great food, our company was founded on the belief that catering is more than a meal — it's an experience. We draw from generations of southern cooking traditions, blending time-honored recipes with modern culinary artistry.",
    "Whether it's a wedding celebration, a corporate gathering, or a family reunion, we approach every event with the same heart: to serve first, and to serve excellently.",
  ],
  aboutImage: "",
  socialLinks: {
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
    youtube: "",
  },
};

export async function readBusiness(): Promise<BusinessInfo> {
  try {
    const { blobs } = await list({ prefix: BUSINESS_JSON_PATH });
    if (blobs.length === 0) {
      return DEFAULT_BUSINESS;
    }
    const response = await fetch(blobs[0].url);
    if (!response.ok) {
      return DEFAULT_BUSINESS;
    }
    return (await response.json()) as BusinessInfo;
  } catch {
    return DEFAULT_BUSINESS;
  }
}

export async function writeBusiness(config: BusinessInfo): Promise<void> {
  await put(BUSINESS_JSON_PATH, JSON.stringify(config, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
