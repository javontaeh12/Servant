"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    question: "How far in advance should I book?",
    answer:
      "We recommend booking at least 2–4 weeks in advance for most events. For weddings and large-scale events, 1–3 months is ideal to ensure availability and allow time for menu planning.",
  },
  {
    question: "What is included in the pricing estimate?",
    answer:
      "The estimate includes your event type base price, service style, per-person catering, and any add-ons you select. Final pricing is confirmed after a consultation where we discuss your specific menu, venue logistics, and any custom requests.",
  },
  {
    question: "Do you accommodate dietary restrictions?",
    answer:
      "Absolutely. We accommodate vegetarian, vegan, gluten-free, nut-free, and other dietary needs. Just let us know in the quote form and we'll work with you to create a menu everyone can enjoy.",
  },
  {
    question: "What areas do you serve?",
    answer:
      "We are based in Houston, TX and serve the greater Houston metropolitan area. For events outside this area, please contact us directly to discuss travel arrangements.",
  },
  {
    question: "Can I customize the menu?",
    answer:
      "Yes! Every event gets a personalized menu. After submitting your quote request, we'll schedule a consultation to discuss your preferences, dietary needs, and vision for the event.",
  },
  {
    question: "What happens after I submit a quote request?",
    answer:
      "Our team will review your request and reach out within 24 hours to schedule a consultation. During the consultation, we'll finalize your menu, discuss logistics, and provide a detailed final quote.",
  },
  {
    question: "Do you provide staff for the event?",
    answer:
      "Yes, professional service staff is included with most packages. This covers setup, serving, and cleanup so you can focus on enjoying your event.",
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "Cancellations made 14 or more days before the event receive a full refund. Cancellations within 7–13 days receive a 50% refund. Please contact us directly for details on last-minute changes.",
  },
];

export default function QuoteFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 px-6 sm:px-8 bg-sky">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary text-xs tracking-[0.35em] uppercase mb-4">
            Common Questions
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-text">
            Frequently Asked Questions
          </h2>
          <div className="h-[2px] w-[60px] bg-primary mx-auto mt-5" />
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-sky-deep rounded-sm overflow-hidden"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-sm font-bold text-slate-text pr-4">
                  {item.question}
                </span>
                <ChevronDown
                  size={16}
                  className={cn(
                    "text-primary shrink-0 transition-transform duration-200",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  openIndex === index ? "max-h-60" : "max-h-0"
                )}
              >
                <p className="px-6 pb-5 text-slate-muted text-sm leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
