"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Users,
  Loader2,
  CheckCircle2,
  DollarSign,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EVENT_TYPES, SERVICE_STYLES } from "@/lib/constants";
import { PricingConfig, QuoteEstimate, AddOn } from "@/lib/types";
import { calculateEstimate, formatCurrency } from "@/lib/pricing";

interface FormData {
  eventType: string;
  serviceType: string;
  guestCount: string;
  selectedAddOns: string[];
  eventDate: string;
  eventTime: string;
  name: string;
  email: string;
  phone: string;
  dietaryNeeds: string;
  notes: string;
}

const initialForm: FormData = {
  eventType: "",
  serviceType: "",
  guestCount: "",
  selectedAddOns: [],
  eventDate: "",
  eventTime: "",
  name: "",
  email: "",
  phone: "",
  dietaryNeeds: "",
  notes: "",
};

const inputClass =
  "w-full bg-sky/50 border border-sky-deep text-slate-text placeholder:text-slate-muted/40 px-4 py-3.5 focus:border-primary/50 focus:outline-none transition-colors text-sm rounded-sm";
const labelClass =
  "block text-slate-muted text-xs font-bold tracking-wide uppercase mb-2.5";
const selectClass =
  "w-full bg-sky/50 border border-sky-deep text-slate-text px-4 py-3.5 focus:border-primary/50 focus:outline-none transition-colors text-sm appearance-none rounded-sm";

const STEP_LABELS = [
  "Event Details",
  "Add-Ons",
  "Choose Date & Time",
  "Your Information",
  "Review & Submit",
];

export default function QuoteForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  useEffect(() => {
    fetch("/api/pricing")
      .then((res) => res.json())
      .then((data) => setPricing(data))
      .catch(() => {});
  }, []);

  const estimate: QuoteEstimate | null =
    pricing && form.eventType && form.serviceType && form.guestCount
      ? calculateEstimate(
          pricing,
          form.eventType,
          form.serviceType,
          parseInt(form.guestCount) || 0,
          form.selectedAddOns
        )
      : null;

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAddOn = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      selectedAddOns: prev.selectedAddOns.includes(id)
        ? prev.selectedAddOns.filter((a) => a !== id)
        : [...prev.selectedAddOns, id],
    }));
  }, []);

  const handleDateChange = (date: string) => {
    update("eventDate", date);
  };

  const goToStep = (newStep: number) => {
    setTransitioning(true);
    setTimeout(() => {
      setStep(newStep);
      setTransitioning(false);
    }, 200);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/calendar/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          guestCount: parseInt(form.guestCount) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Unable to submit. Please try again or call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return form.eventType && form.serviceType && form.guestCount;
      case 2:
        return true; // add-ons are optional
      case 3:
        return form.eventDate && form.eventTime;
      case 4:
        return form.name && form.email && form.phone;
      default:
        return true;
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  if (success) {
    return (
      <div className="text-center py-20 px-6 max-w-lg mx-auto animate-fade-up">
        <CheckCircle2
          className="text-primary mx-auto mb-6"
          size={56}
          strokeWidth={1.5}
        />
        <h2 className="font-heading text-3xl font-bold text-slate-text mb-4">
          Quote Request Submitted
        </h2>
        <p className="text-slate-muted text-[15px] mb-2">
          Thank you, {form.name}. We&apos;ve received your request and added it
          to our calendar.
        </p>
        <p className="text-slate-muted/60 text-sm mb-10">
          We&apos;ll contact you within 24 hours to discuss your event.
        </p>
        <div className="bg-sky border border-sky-deep p-6 text-left rounded-sm">
          <p className="text-primary text-xs font-bold tracking-wide uppercase mb-4">
            Event Summary
          </p>
          <div className="space-y-2 text-sm">
            <p className="text-slate-text">{form.eventType}</p>
            <p className="text-slate-text">{form.eventDate}</p>
            <p className="text-slate-text">
              {form.guestCount} guests &middot; {form.serviceType}
            </p>
          </div>
          {estimate && (
            <div className="border-t border-sky-deep mt-4 pt-4">
              <p className="text-primary text-xs font-bold tracking-wide uppercase mb-3">
                Estimated Total
              </p>
              <p className="text-2xl font-heading font-bold text-slate-text">
                {formatCurrency(estimate.total)}
              </p>
              <p className="text-slate-muted/60 text-xs mt-1">
                Final pricing confirmed after consultation
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pb-28">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-0 mb-12">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                "w-9 h-9 flex items-center justify-center text-xs font-bold transition-all rounded-full",
                s === step
                  ? "bg-primary text-white"
                  : s < step
                  ? "bg-primary/20 text-primary"
                  : "bg-sky-deep text-slate-muted/40"
              )}
            >
              {s < step ? <Check size={14} /> : s}
            </div>
            {s < 5 && (
              <div
                className={cn(
                  "w-6 md:w-12 h-[1px] transition-all",
                  s < step ? "bg-primary/30" : "bg-sky-deep"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step label */}
      <div className="text-center mb-10">
        <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-1">
          Step {step} of 5
        </p>
        <h3 className="font-heading text-xl text-slate-text">
          {STEP_LABELS[step - 1]}
        </h3>
      </div>

      <div
        className={cn(
          "transition-all duration-200",
          transitioning
            ? "opacity-0 translate-y-2"
            : "opacity-100 translate-y-0"
        )}
      >
        {/* Step 1: Event Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Event Type *</label>
              <select
                value={form.eventType}
                onChange={(e) => update("eventType", e.target.value)}
                className={selectClass}
              >
                <option value="">Select event type...</option>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                    {pricing
                      ? ` — ${formatCurrency(pricing.eventTypes[type] ?? 0)} base`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Service Style *</label>
              <select
                value={form.serviceType}
                onChange={(e) => update("serviceType", e.target.value)}
                className={selectClass}
              >
                <option value="">Select service style...</option>
                {SERVICE_STYLES.map((style) => {
                  const mod = pricing?.serviceStyles[style] ?? 0;
                  const modLabel =
                    mod > 0
                      ? ` (+${formatCurrency(mod)})`
                      : mod < 0
                      ? ` (${formatCurrency(mod)})`
                      : "";
                  return (
                    <option key={style} value={style}>
                      {style}{modLabel}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className={labelClass}>
                <Users size={12} className="inline mr-1.5 -mt-0.5" />
                Guest Count *
                {pricing && (
                  <span className="font-normal normal-case tracking-normal text-slate-muted/60 ml-1">
                    ({formatCurrency(pricing.perPersonRate)}/person)
                  </span>
                )}
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={form.guestCount}
                onChange={(e) => update("guestCount", e.target.value)}
                placeholder="Number of guests"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* Step 2: Add-Ons */}
        {step === 2 && pricing && (
          <div className="space-y-4">
            <p className="text-slate-muted text-sm text-center mb-6">
              Enhance your event with these optional extras.
            </p>
            {pricing.addOns.map((addOn: AddOn) => {
              const selected = form.selectedAddOns.includes(addOn.id);
              const guestCount = parseInt(form.guestCount) || 0;
              const cost =
                addOn.pricingType === "per-person"
                  ? addOn.price * guestCount
                  : addOn.price;
              return (
                <button
                  key={addOn.id}
                  type="button"
                  onClick={() => toggleAddOn(addOn.id)}
                  className={cn(
                    "w-full text-left p-5 border rounded-sm transition-all",
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-sky-deep bg-sky/50 hover:border-primary/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={cn(
                            "w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-all",
                            selected
                              ? "bg-primary border-primary"
                              : "border-sky-deep"
                          )}
                        >
                          {selected && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <span className="text-sm font-bold text-slate-text">
                          {addOn.name}
                        </span>
                      </div>
                      <p className="text-slate-muted text-xs ml-7">
                        {addOn.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-primary">
                        {addOn.pricingType === "per-person"
                          ? `${formatCurrency(addOn.price)}/person`
                          : formatCurrency(addOn.price)}
                      </p>
                      {addOn.pricingType === "per-person" && guestCount > 0 && (
                        <p className="text-xs text-slate-muted/60">
                          {formatCurrency(cost)} total
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className={labelClass}>
                <Calendar size={12} className="inline mr-1.5 -mt-0.5" />
                Event Date *
              </label>
              <input
                type="date"
                min={minDate}
                value={form.eventDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <Clock size={12} className="inline mr-1.5 -mt-0.5" />
                Preferred Time *
              </label>
              <input
                type="time"
                value={form.eventTime}
                onChange={(e) => update("eventTime", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* Step 4: Your Information */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Your full name"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@email.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Phone *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="(555) 123-4567"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Dietary Restrictions</label>
              <textarea
                value={form.dietaryNeeds}
                onChange={(e) => update("dietaryNeeds", e.target.value)}
                placeholder="Any dietary needs we should know about..."
                rows={3}
                className={cn(inputClass, "resize-none")}
              />
            </div>
            <div>
              <label className={labelClass}>Additional Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Tell us about your vision for the event..."
                rows={3}
                className={cn(inputClass, "resize-none")}
              />
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="bg-sky border border-sky-deep p-6 rounded-sm">
              <p className="text-primary text-xs font-bold tracking-wide uppercase mb-5">
                Review Your Details
              </p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5 text-sm">
                <div>
                  <p className="text-slate-muted text-xs mb-1">Event Type</p>
                  <p className="text-slate-text">{form.eventType}</p>
                </div>
                <div>
                  <p className="text-slate-muted text-xs mb-1">Service Style</p>
                  <p className="text-slate-text">{form.serviceType}</p>
                </div>
                <div>
                  <p className="text-slate-muted text-xs mb-1">Guests</p>
                  <p className="text-slate-text">{form.guestCount}</p>
                </div>
                <div>
                  <p className="text-slate-muted text-xs mb-1">Date</p>
                  <p className="text-slate-text">{form.eventDate}</p>
                </div>
              </div>
              {form.selectedAddOns.length > 0 && pricing && (
                <div className="border-t border-sky-deep mt-5 pt-5 text-sm">
                  <p className="text-slate-muted text-xs mb-2">Add-Ons</p>
                  <div className="space-y-1">
                    {form.selectedAddOns.map((id) => {
                      const addOn = pricing.addOns.find((a) => a.id === id);
                      return addOn ? (
                        <p key={id} className="text-slate-text">
                          {addOn.name}
                        </p>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              <div className="border-t border-sky-deep mt-5 pt-5 grid grid-cols-2 gap-x-8 gap-y-5 text-sm">
                <div>
                  <p className="text-slate-muted text-xs mb-1">Name</p>
                  <p className="text-slate-text">{form.name}</p>
                </div>
                <div>
                  <p className="text-slate-muted text-xs mb-1">Email</p>
                  <p className="text-slate-text">{form.email}</p>
                </div>
                <div>
                  <p className="text-slate-muted text-xs mb-1">Phone</p>
                  <p className="text-slate-text">{form.phone}</p>
                </div>
              </div>
              {(form.dietaryNeeds || form.notes) && (
                <div className="border-t border-sky-deep mt-5 pt-5 text-sm space-y-3">
                  {form.dietaryNeeds && (
                    <div>
                      <p className="text-slate-muted text-xs mb-1">
                        Dietary Needs
                      </p>
                      <p className="text-slate-muted">{form.dietaryNeeds}</p>
                    </div>
                  )}
                  {form.notes && (
                    <div>
                      <p className="text-slate-muted text-xs mb-1">Notes</p>
                      <p className="text-slate-muted">{form.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pricing Breakdown */}
            {estimate && (
              <div className="bg-sky border border-sky-deep p-6 rounded-sm">
                <p className="text-primary text-xs font-bold tracking-wide uppercase mb-4">
                  Pricing Estimate
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-muted">
                      {form.eventType} (base)
                    </span>
                    <span className="text-slate-text">
                      {formatCurrency(estimate.eventTypePrice)}
                    </span>
                  </div>
                  {estimate.serviceStylePrice !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-muted">
                        {form.serviceType}
                      </span>
                      <span className="text-slate-text">
                        {estimate.serviceStylePrice > 0 ? "+" : ""}
                        {formatCurrency(estimate.serviceStylePrice)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-muted">
                      {form.guestCount} guests &times;{" "}
                      {pricing
                        ? formatCurrency(pricing.perPersonRate)
                        : ""}{" "}
                      per person
                    </span>
                    <span className="text-slate-text">
                      {formatCurrency(estimate.perPersonTotal)}
                    </span>
                  </div>
                  {estimate.addOnBreakdown.map((item) => (
                    <div key={item.name} className="flex justify-between">
                      <span className="text-slate-muted">{item.name}</span>
                      <span className="text-slate-text">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-sky-deep pt-3 flex justify-between">
                    <span className="font-bold text-slate-text">
                      Estimated Total
                    </span>
                    <span className="font-bold text-primary text-lg font-heading">
                      {formatCurrency(estimate.total)}
                    </span>
                  </div>
                </div>
                <p className="text-slate-muted/50 text-[11px] mt-4 leading-relaxed">
                  * This is an approximate estimate. Final pricing will be
                  confirmed after a consultation with our team. Menu selections,
                  venue logistics, and seasonal availability may affect the final
                  quote.
                </p>
              </div>
            )}

            {error && (
              <div className="border border-red-300 bg-red-50 p-4 text-red-600 text-sm text-center rounded-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12">
        {step > 1 ? (
          <button
            onClick={() => goToStep(step - 1)}
            className="flex items-center gap-1.5 text-slate-muted hover:text-slate-text text-sm transition-colors"
          >
            <ChevronLeft size={16} /> Back
          </button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button
            onClick={() => goToStep(step + 1)}
            disabled={!canProceed()}
            className={cn(
              "bg-primary text-white font-heading font-bold text-xs tracking-[0.15em] uppercase px-8 py-3.5 flex items-center gap-1.5 rounded-sm transition-all duration-300",
              canProceed()
                ? "hover:bg-primary-dark"
                : "opacity-30 cursor-not-allowed"
            )}
          >
            Next <ChevronRight size={14} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-primary text-white font-heading font-bold text-xs tracking-[0.15em] uppercase px-10 py-4 flex items-center gap-2 rounded-sm hover:bg-primary-dark transition-all duration-300 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Submitting...
              </>
            ) : (
              "Submit Quote Request"
            )}
          </button>
        )}
      </div>

      {/* Sticky running total */}
      {estimate && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-sky-deep shadow-lg z-50">
          <div className="max-w-xl mx-auto px-6">
            <button
              type="button"
              onClick={() => setBreakdownOpen(!breakdownOpen)}
              className="w-full flex items-center justify-between py-4"
            >
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-primary" />
                <span className="text-sm font-bold text-slate-text">
                  Estimated Total
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-heading font-bold text-primary">
                  {formatCurrency(estimate.total)}
                </span>
                {breakdownOpen ? (
                  <ChevronDown size={16} className="text-slate-muted" />
                ) : (
                  <ChevronUp size={16} className="text-slate-muted" />
                )}
              </div>
            </button>

            {breakdownOpen && (
              <div className="pb-4 border-t border-sky-deep pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-muted">
                    {form.eventType} (base)
                  </span>
                  <span className="text-slate-text">
                    {formatCurrency(estimate.eventTypePrice)}
                  </span>
                </div>
                {estimate.serviceStylePrice !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-muted">{form.serviceType}</span>
                    <span className="text-slate-text">
                      {estimate.serviceStylePrice > 0 ? "+" : ""}
                      {formatCurrency(estimate.serviceStylePrice)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-muted">
                    Per-person ({form.guestCount} guests)
                  </span>
                  <span className="text-slate-text">
                    {formatCurrency(estimate.perPersonTotal)}
                  </span>
                </div>
                {estimate.addOnBreakdown.map((item) => (
                  <div key={item.name} className="flex justify-between">
                    <span className="text-slate-muted">{item.name}</span>
                    <span className="text-slate-text">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
