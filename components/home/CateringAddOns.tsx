"use client";

import { useState, useEffect } from "react";
import {
  ConciergeBell,
  Users,
  ChefHat,
  Utensils,
  Wine,
  Flame,
  UtensilsCrossed,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { PricingConfig } from "@/lib/types";

// Icon mapping for known service style keywords
const ICON_MAP: Record<string, LucideIcon> = {
  buffet: ChefHat,
  family: Users,
  plated: ConciergeBell,
  waiter: ConciergeBell,
  cocktail: Wine,
  appetizer: Wine,
  carving: Flame,
  station: Flame,
  dessert: Utensils,
  custom: UtensilsCrossed,
};

function getIconForStyle(name: string): LucideIcon {
  const lower = name.toLowerCase();
  for (const [keyword, icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(keyword)) return icon;
  }
  return UtensilsCrossed;
}

export default function CateringAddOns() {
  const [styles, setStyles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pricing")
      .then((res) => res.json())
      .then((data: PricingConfig) => {
        setStyles(Object.keys(data.serviceStyles || {}));
      })
      .catch(() => setStyles([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-24 md:py-32 px-6 sm:px-8 bg-sky/50">
        <div className="flex justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </section>
    );
  }

  if (styles.length === 0) return null;

  return (
    <section className="py-24 md:py-32 px-6 sm:px-8 bg-sky/50">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-primary text-xs tracking-[0.35em] uppercase mb-4">
            Catering Options and Add-Ons
          </p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-slate-text">
            What We Offer
          </h2>
          <div className="w-[60px] h-[2px] bg-primary mx-auto mb-5" />
          <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-slate-muted">
            Customize your event with our flexible service styles — from casual
            buffets to full white-glove dining.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {styles.map((name) => {
            const Icon = getIconForStyle(name);
            return (
              <div
                key={name}
                className="group relative bg-white border border-sky-deep/50 p-8 lg:p-10 hover:border-primary/30 hover:shadow-lg transition-all duration-500 rounded-sm"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Icon
                  className="text-primary mb-6"
                  size={32}
                  strokeWidth={1.5}
                />
                <h3 className="font-heading text-xl lg:text-2xl font-bold text-slate-text">
                  {name}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
