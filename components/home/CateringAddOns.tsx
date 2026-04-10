"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ConciergeBell,
  Users,
  ChefHat,
  Utensils,
  Wine,
  Flame,
  UtensilsCrossed,
  Loader2,
  X,
  ArrowRight,
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

// Static descriptions for common service styles
const DESCRIPTION_MAP: Record<string, string> = {
  buffet: "Guests serve themselves from an elegant spread of dishes. Perfect for relaxed, social gatherings where variety and convenience are key.",
  "family style": "Dishes are passed around the table just like a home-cooked meal. Warm, communal, and great for creating a family atmosphere.",
  plated: "Each guest receives a beautifully presented individual plate. Ideal for formal occasions where elegance and precision matter.",
  "cocktail reception": "Light bites and small plates served as guests mingle. Sets a sophisticated, social tone for any event.",
  "carving station": "A live carving display featuring premium cuts prepared fresh in front of your guests — a crowd-pleasing centerpiece.",
  "dessert station": "A dedicated spread of custom desserts, sweets, and treats. The perfect finishing touch to any celebration.",
  "custom / full service": "A fully tailored experience from setup to breakdown. We handle every detail so you can focus on your guests.",
};

function getIconForStyle(name: string): LucideIcon {
  const lower = name.toLowerCase();
  for (const [keyword, icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(keyword)) return icon;
  }
  return UtensilsCrossed;
}

function getDescriptionForStyle(name: string): string {
  const lower = name.toLowerCase();
  for (const [keyword, desc] of Object.entries(DESCRIPTION_MAP)) {
    if (lower.includes(keyword)) return desc;
  }
  return "An expertly crafted service option tailored to your event's unique needs and atmosphere.";
}

export default function CateringAddOns() {
  const [styles, setStyles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

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

  const selectedDesc = selectedStyle ? getDescriptionForStyle(selectedStyle) : null;

  return (
    <>
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
              const description = getDescriptionForStyle(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedStyle(name)}
                  className="group relative bg-white border border-sky-deep/50 p-8 lg:p-10 hover:border-primary/30 hover:shadow-lg transition-all duration-500 rounded-sm text-left w-full"
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Icon
                    className="text-primary mb-6"
                    size={32}
                    strokeWidth={1.5}
                  />
                  <h3 className="font-heading text-xl lg:text-2xl font-bold text-slate-text mb-3">
                    {name}
                  </h3>
                  <p className="text-slate-muted text-sm leading-relaxed mb-5 line-clamp-2">
                    {description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-primary text-xs font-bold tracking-wide uppercase group-hover:gap-3 transition-all duration-300">
                    Learn More
                    <ArrowRight size={12} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Style Modal */}
      {selectedStyle && selectedDesc && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:px-4"
          onClick={() => setSelectedStyle(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative bg-white rounded-t-xl md:rounded-sm shadow-2xl w-full md:max-w-lg max-h-[90vh] md:max-h-[85vh] overflow-y-auto animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle for mobile */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-slate-muted/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="relative bg-sky p-6 pb-5 border-b border-sky-deep">
              <button
                type="button"
                onClick={() => setSelectedStyle(null)}
                className="absolute top-4 right-4 text-slate-muted hover:text-slate-text transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-4">
                {(() => {
                  const Icon = getIconForStyle(selectedStyle);
                  return (
                    <Icon
                      className="text-primary shrink-0"
                      size={28}
                      strokeWidth={1.5}
                    />
                  );
                })()}
                <h3 className="font-heading text-xl md:text-2xl font-bold text-slate-text pr-8">
                  {selectedStyle}
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-slate-muted text-sm leading-relaxed mb-8">
                {selectedDesc}
              </p>

              <div className="pb-safe">
                <Link
                  href="/quote"
                  className="inline-block w-full text-center bg-primary text-white font-heading font-bold text-xs tracking-[0.15em] uppercase px-6 py-3.5 rounded-sm hover:bg-primary-dark transition-all duration-300"
                  onClick={() => setSelectedStyle(null)}
                >
                  Request a Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
