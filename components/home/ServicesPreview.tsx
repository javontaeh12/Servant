"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  Building2,
  UtensilsCrossed,
  ArrowRight,
  X,
  Check,
} from "lucide-react";
import { SERVICES } from "@/lib/constants";

const PREVIEW_SERVICES = [
  {
    name: "Weddings",
    fullName: "Wedding Receptions",
    description:
      "Unforgettable menus crafted to match your love story. Elegant plated dinners, lavish buffets, and everything in between.",
    icon: Heart,
  },
  {
    name: "Corporate Events",
    fullName: "Corporate Events",
    description:
      "Impress clients and celebrate your team with refined southern cuisine that leaves a lasting impression.",
    icon: Building2,
  },
  {
    name: "Private Dining",
    fullName: "Private Dinner Parties",
    description:
      "Transform any space into a fine dining experience. Chef-quality meals served directly to your table.",
    icon: UtensilsCrossed,
  },
];

export default function ServicesPreview() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const fullService = selectedService
    ? SERVICES.find((s) => s.name === selectedService)
    : null;

  const previewIcon = selectedService
    ? PREVIEW_SERVICES.find((p) => p.fullName === selectedService)?.icon
    : null;

  return (
    <>
      <section className="py-24 md:py-32 px-6 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-16 md:mb-20">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-slate-text">
              Our Specialties
            </h2>
            <div className="w-[60px] h-[2px] bg-primary mx-auto mb-5" />
            <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-slate-muted">
              From intimate dinners to grand celebrations, every occasion
              deserves the elegance of southern hospitality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {PREVIEW_SERVICES.map((service) => (
              <div
                key={service.name}
                className="group relative bg-sky/50 border border-sky-deep/50 p-8 lg:p-10 h-full hover:border-primary/30 hover:shadow-lg transition-all duration-500 rounded-sm"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <service.icon
                  className="text-primary mb-6"
                  size={32}
                  strokeWidth={1.5}
                />
                <h3 className="font-heading text-xl lg:text-2xl font-bold text-slate-text mb-3">
                  {service.name}
                </h3>
                <p className="text-slate-muted text-sm leading-relaxed mb-6">
                  {service.description}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedService(service.fullName)}
                  className="inline-flex items-center gap-2 text-primary text-sm font-bold tracking-wide uppercase group-hover:gap-3 transition-all duration-300 cursor-pointer"
                >
                  Learn More
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/services"
              className="inline-block border border-primary/40 text-primary hover:bg-primary hover:text-white font-heading font-bold text-sm tracking-[0.15em] uppercase px-8 py-3.5 rounded-sm transition-all duration-300"
            >
              View More Specialties
            </Link>
          </div>
        </div>
      </section>

      {/* Modal */}
      {fullService && previewIcon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={() => setSelectedService(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal content */}
          <div
            className="relative bg-white rounded-sm shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-sky p-6 pb-5 border-b border-sky-deep">
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 text-slate-muted hover:text-slate-text transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-4">
                {(() => {
                  const Icon = previewIcon;
                  return (
                    <Icon
                      className="text-primary shrink-0"
                      size={28}
                      strokeWidth={1.5}
                    />
                  );
                })()}
                <h3 className="font-heading text-xl md:text-2xl font-bold text-slate-text pr-8">
                  {fullService.name}
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-slate-muted text-sm leading-relaxed mb-6">
                {fullService.description}
              </p>

              <div>
                <p className="text-primary text-xs font-bold tracking-[0.15em] uppercase mb-4">
                  What&apos;s Included
                </p>
                <ul className="space-y-3">
                  {fullService.included.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check
                        size={16}
                        className="text-primary shrink-0 mt-0.5"
                      />
                      <span className="text-slate-text text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/quote"
                  className="inline-block w-full text-center bg-primary text-white font-heading font-bold text-xs tracking-[0.15em] uppercase px-6 py-3.5 rounded-sm hover:bg-primary-dark transition-all duration-300"
                  onClick={() => setSelectedService(null)}
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
