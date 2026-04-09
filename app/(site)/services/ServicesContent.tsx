"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Building2,
  UtensilsCrossed,
  PartyPopper,
  Church,
  HandHeart,
  Cake,
  Users,
  Gift,
  GraduationCap,
  School,
  Check,
  X,
} from "lucide-react";
import { SERVICES } from "@/lib/constants";

const ICON_MAP: Record<string, React.ElementType> = {
  Heart,
  Building2,
  UtensilsCrossed,
  PartyPopper,
  Church,
  HandHeart,
  Cake,
  Users,
  Gift,
  GraduationCap,
  School,
};

type SpecialtyImages = Record<string, string>;

export default function ServicesContent() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [specialtyImages, setSpecialtyImages] = useState<SpecialtyImages>({});

  useEffect(() => {
    fetch("/api/specialties")
      .then((res) => res.json())
      .then((data) => setSpecialtyImages(data))
      .catch(() => {});
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedService]);

  const fullService = selectedService
    ? SERVICES.find((s) => s.name === selectedService)
    : null;

  return (
    <>
      {/* Page Hero */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-6 sm:px-8 bg-sky">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <p className="animate-fade-in text-primary text-xs tracking-[0.35em] uppercase mb-5">
            What We Offer
          </p>
          <h1 className="animate-fade-up-delay-1 font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-slate-text">
            Our Specialties
          </h1>
          <div
            className="animate-line-grow h-[2px] bg-primary mx-auto mt-6"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-28 px-6 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {SERVICES.map((service) => {
            const Icon = ICON_MAP[service.icon] || Heart;
            const imageUrl = specialtyImages[service.name];

            return (
              <button
                key={service.name}
                type="button"
                onClick={() => setSelectedService(service.name)}
                className="group relative bg-sky/50 border border-sky-deep/50 hover:border-primary/30 hover:shadow-lg transition-all duration-500 rounded-sm overflow-hidden text-left cursor-pointer"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                {imageUrl ? (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={service.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="pt-8 px-6">
                    <Icon className="text-primary" size={32} strokeWidth={1.5} />
                  </div>
                )}
                <div className={imageUrl ? "p-5" : "px-6 pt-4 pb-6"}>
                  <h3 className="font-heading text-lg font-bold text-slate-text mb-2">
                    {service.name}
                  </h3>
                  <p className="text-slate-muted text-sm leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                  <span className="inline-block mt-3 text-primary text-xs font-bold tracking-wide uppercase">
                    Tap for Details
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-6 sm:px-8 bg-sky/50">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-slate-text mb-5">
            Every Event is Unique
          </h3>
          <div className="w-10 h-[2px] bg-primary mx-auto mb-6" />
          <p className="text-slate-muted text-[15px] leading-[1.8] mb-10">
            We believe every celebration deserves a custom touch. Contact us for
            a personalized quote tailored to your vision, guest count, and
            preferences. No event is too big or too small.
          </p>
          <Link
            href="/quote"
            className="inline-block bg-primary text-white hover:bg-primary-dark font-heading font-bold text-sm tracking-[0.15em] uppercase px-10 py-4 rounded-sm transition-all duration-300"
          >
            Get Your Free Quote
          </Link>
        </div>
      </section>

      {/* Service Detail Modal */}
      {fullService && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:px-4"
          onClick={() => setSelectedService(null)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

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
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 text-slate-muted hover:text-slate-text transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-4">
                {(() => {
                  const Icon = ICON_MAP[fullService.icon] || Heart;
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

            {/* Image if available */}
            {specialtyImages[fullService.name] && (
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={specialtyImages[fullService.name]}
                  alt={fullService.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              </div>
            )}

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

              <div className="mt-8 pb-safe">
                <Link
                  href={`/quote?service=${encodeURIComponent(fullService.name)}`}
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
