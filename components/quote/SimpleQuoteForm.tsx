"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, CheckCircle2, ChefHat, ChevronDown, ChevronUp } from "lucide-react";

const inputClass =
  "w-full bg-sky/50 border border-sky-deep text-slate-text placeholder:text-slate-muted/40 px-4 py-3.5 focus:border-primary/50 focus:outline-none transition-colors text-sm rounded-sm";
const labelClass =
  "block text-slate-muted text-xs font-bold tracking-wide uppercase mb-2.5";
const selectClass =
  "w-full bg-sky/50 border border-sky-deep text-slate-text px-4 py-3.5 focus:border-primary/50 focus:outline-none transition-colors text-sm appearance-none rounded-sm";

const EVENT_TYPES = [
  "Wedding Reception",
  "Corporate Event",
  "Birthday Party",
  "Graduation Celebration",
  "Anniversary",
  "Holiday Party",
  "Baby / Bridal Shower",
  "Church / Community Event",
  "Funeral / Repast",
  "Other",
];

const SERVICE_STYLES = [
  "Full Catering (Buffet)",
  "Plated / Sit-Down Service",
  "Family Style",
  "Food Stations",
  "Drop-Off Only (No Staff)",
  "Not sure yet",
];

const CUISINE_TYPES = [
  "Soul Food / Southern",
  "American BBQ",
  "Italian",
  "Mexican / Latin",
  "Seafood",
  "Mediterranean",
  "Mixed / Variety",
  "Vegan / Plant-Based",
  "Other / Open to Suggestions",
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  serviceStyle: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  guestCount: string;
  cuisineType: string;
  menuDetails: string;
  dietaryRestrictions: string;
  budget: string;
  heardFrom: string;
  notes: string;
}

const EMPTY: FormState = {
  name: "",
  email: "",
  phone: "",
  eventType: "",
  serviceStyle: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  venue: "",
  guestCount: "",
  cuisineType: "",
  menuDetails: "",
  dietaryRestrictions: "",
  budget: "",
  heardFrom: "",
  notes: "",
};

function validate(form: FormState): string | null {
  if (!form.name.trim()) return "Please enter your name.";
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    return "Please enter a valid email address.";
  if (!form.phone.trim() || !/^\+?[\d\s\-().]{7,}$/.test(form.phone))
    return "Please enter a valid phone number.";
  if (!form.eventType) return "Please select an event type.";
  if (!form.eventDate) return "Please select your event date.";
  if (!form.guestCount || isNaN(Number(form.guestCount)) || Number(form.guestCount) < 1)
    return "Please enter a valid guest count.";
  return null;
}

function minDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

const ChevronIcon = ({ open }: { open: boolean }) =>
  open ? <ChevronUp size={18} className="text-primary" /> : <ChevronDown size={18} className="text-slate-muted" />;

function Section({
  title,
  subtitle,
  open,
  onToggle,
  onCollapse,
  children,
  required,
}: {
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
  onCollapse: () => void;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="border border-sky-deep rounded-sm">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-sky/30 hover:bg-sky/50 transition-colors text-left"
      >
        <div>
          <span className="font-heading font-bold text-slate-text text-base">
            {title}
            {required && <span className="text-primary ml-1 text-xs">*</span>}
          </span>
          <p className="text-slate-muted text-xs mt-0.5">{subtitle}</p>
        </div>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="relative px-5 pt-5 pb-10 bg-white border-t border-sky-deep">
          {children}
          {/* Floating collapse + advance button */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20">
            <button
              type="button"
              onClick={onCollapse}
              className="w-9 h-9 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-md hover:bg-primary hover:text-white text-primary transition-all"
              aria-label="Collapse section"
            >
              <ChevronUp size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SimpleQuoteForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [open, setOpen] = useState<Record<string, boolean>>({
    contact: false,
    event: false,
    menu: false,
    extra: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({
    contact: null,
    event: null,
    menu: null,
    extra: null,
  });
  const submitRef = useRef<HTMLDivElement | null>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const SECTION_ORDER = ["contact", "event", "menu", "extra"];

  const toggle = (key: string) =>
    setOpen((s) => ({ ...s, [key]: !s[key] }));

  // Close current section, open next, scroll to it
  const collapse = (key: string) => {
    const idx = SECTION_ORDER.indexOf(key);
    const next = SECTION_ORDER[idx + 1];
    setOpen((s) => ({
      ...s,
      [key]: false,
      ...(next ? { [next]: true } : {}),
    }));
    setTimeout(() => {
      if (next) {
        sectionRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Last section done — show submit and scroll to it
        setShowSubmit(true);
        setTimeout(() => {
          submitRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
    }, 50);
  };

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(form);
    if (err) {
      setError(err);
      // Open the section that has the error
      if (err.includes("name") || err.includes("email") || err.includes("phone")) {
        setOpen((s) => ({ ...s, contact: true }));
      } else if (err.includes("event") || err.includes("guest")) {
        setOpen((s) => ({ ...s, event: true }));
      }
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/calendar/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: form.eventType,
          serviceType: form.serviceStyle || "Full Catering (Buffet)",
          guestCount: form.guestCount,
          eventDate: form.eventDate,
          eventTime: form.startTime || "12:00",
          eventEndTime: form.endTime || "16:00",
          name: form.name,
          email: form.email,
          phone: form.phone,
          dietaryNeeds: form.dietaryRestrictions,
          notes: [
            form.menuDetails && `Menu preferences: ${form.menuDetails}`,
            form.cuisineType && `Cuisine: ${form.cuisineType}`,
            form.venue && `Venue: ${form.venue}`,
            form.budget && `Budget: ${form.budget}`,
            form.heardFrom && `Heard from: ${form.heardFrom}`,
            form.notes,
          ]
            .filter(Boolean)
            .join(" | "),
          mealSelection: null,
          selectedAddOns: [],
          simpleForm: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Submission failed. Please try again.");
      }

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 px-4">
        <CheckCircle2 className="text-primary mx-auto mb-6" size={52} />
        <h2 className="font-heading text-3xl font-bold text-slate-text mb-4">
          Request Received!
        </h2>
        <p className="text-slate-muted mb-2">
          Thank you, {form.name.split(" ")[0]}. We&apos;ll review your request and be in touch within 24 hours.
        </p>
        <p className="text-slate-muted text-sm">
          A confirmation has been sent to{" "}
          <span className="text-primary font-medium">{form.email}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-5">
          <ChefHat className="text-primary" size={26} />
        </div>
        <h1 className="font-heading text-4xl font-bold text-slate-text mb-3">
          Request a Quote
        </h1>
        <p className="text-slate-muted max-w-md mx-auto">
          Tap each section to expand and fill it out. Fields marked{" "}
          <span className="text-primary font-medium">*</span> are required.
        </p>
      </div>

      {/* Submit area — appears at top after all sections completed */}
      {showSubmit && (
        <div ref={submitRef} className="mb-8 rounded-sm border border-primary/30 bg-primary/5 px-6 py-6 text-center">
          <p className="text-slate-text font-heading font-bold text-lg mb-1">All done! Ready to submit?</p>
          <p className="text-slate-muted text-sm mb-5">Review your sections above, then tap the button to send your request.</p>
          <button
            type="submit"
            form="quote-form"
            disabled={submitting}
            className="w-full bg-primary text-white font-bold py-4 px-6 hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed rounded-sm flex items-center justify-center gap-2 text-sm tracking-wide uppercase"
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" />Sending Request…</>
            ) : (
              "Submit Quote Request"
            )}
          </button>
        </div>
      )}

      <form id="quote-form" onSubmit={handleSubmit} noValidate className="space-y-3">

        {/* ── Contact Information ── */}
        <div ref={(el) => { sectionRefs.current.contact = el; }}>
        <Section
          title="Contact Information"
          subtitle={open.contact ? "Your name, email, and phone number" : form.name ? `${form.name} · ${form.email}` : "Tap to fill in your details"}
          open={open.contact}
          onToggle={() => toggle("contact")}
          onCollapse={() => collapse("contact")}
          required
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Full Name *</label>
              <input type="text" className={inputClass} placeholder="Jane Smith" value={form.name} onChange={set("name")} />
            </div>
            <div>
              <label className={labelClass}>Email Address *</label>
              <input type="email" className={inputClass} placeholder="jane@example.com" value={form.email} onChange={set("email")} />
            </div>
            <div>
              <label className={labelClass}>Phone Number *</label>
              <input type="tel" className={inputClass} placeholder="(555) 000-0000" value={form.phone} onChange={set("phone")} />
            </div>
          </div>
        </Section>
        </div>

        {/* ── Event Details ── */}
        <div ref={(el) => { sectionRefs.current.event = el; }}>
        <Section
          title="Event Details"
          subtitle={open.event ? "Type, date, time, venue, and guest count" : form.eventType ? `${form.eventType}${form.eventDate ? ` · ${form.eventDate}` : ""}${form.guestCount ? ` · ${form.guestCount} guests` : ""}` : "Tap to fill in your event info"}
          open={open.event}
          onToggle={() => toggle("event")}
          onCollapse={() => collapse("event")}
          required
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Event Type *</label>
              <div className="relative">
                <select className={selectClass} value={form.eventType} onChange={set("eventType")}>
                  <option value="">Select event type</option>
                  {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="w-4 h-4 text-slate-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            <div>
              <label className={labelClass}>Service Style</label>
              <div className="relative">
                <select className={selectClass} value={form.serviceStyle} onChange={set("serviceStyle")}>
                  <option value="">Select style</option>
                  {SERVICE_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="w-4 h-4 text-slate-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            <div>
              <label className={labelClass}>Event Date *</label>
              <input type="date" className={inputClass} min={minDate()} value={form.eventDate} onChange={set("eventDate")} />
            </div>
            <div>
              <label className={labelClass}>Guest Count *</label>
              <input type="number" className={inputClass} placeholder="e.g. 75" min={1} max={2000} value={form.guestCount} onChange={set("guestCount")} />
            </div>
            <div>
              <label className={labelClass}>Start Time</label>
              <input type="time" className={inputClass} value={form.startTime} onChange={set("startTime")} />
            </div>
            <div>
              <label className={labelClass}>End Time</label>
              <input type="time" className={inputClass} value={form.endTime} onChange={set("endTime")} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Venue / Location</label>
              <input type="text" className={inputClass} placeholder="Venue name or address" value={form.venue} onChange={set("venue")} />
            </div>
          </div>
        </Section>
        </div>

        {/* ── Menu & Food Preferences ── */}
        <div ref={(el) => { sectionRefs.current.menu = el; }}>
        <Section
          title="Menu & Food Preferences"
          subtitle={open.menu ? "Cuisine type, dishes, and dietary needs" : form.cuisineType ? `${form.cuisineType}${form.dietaryRestrictions ? ` · ${form.dietaryRestrictions}` : ""}` : "Tap to share your food preferences"}
          open={open.menu}
          onToggle={() => toggle("menu")}
          onCollapse={() => collapse("menu")}
        >
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={labelClass}>Type of Cuisine</label>
              <div className="relative">
                <select className={selectClass} value={form.cuisineType} onChange={set("cuisineType")}>
                  <option value="">Select cuisine type</option>
                  {CUISINE_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="w-4 h-4 text-slate-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            <div>
              <label className={labelClass}>Specific Dishes or Menu Ideas</label>
              <textarea className={`${inputClass} resize-none`} rows={3} placeholder="e.g. fried chicken, mac & cheese, collard greens, peach cobbler…" value={form.menuDetails} onChange={set("menuDetails")} />
            </div>
            <div>
              <label className={labelClass}>Dietary Restrictions / Allergies</label>
              <input type="text" className={inputClass} placeholder="e.g. nut allergy, gluten-free, vegan options needed" value={form.dietaryRestrictions} onChange={set("dietaryRestrictions")} />
            </div>
          </div>
        </Section>
        </div>

        {/* ── Additional Information ── */}
        <div ref={(el) => { sectionRefs.current.extra = el; }}>
        <Section
          title="Additional Information"
          subtitle={open.extra ? "Budget, how you found us, and any special requests" : form.budget || form.notes ? [form.budget, form.notes].filter(Boolean).join(" · ") : "Tap to add any extra details"}
          open={open.extra}
          onToggle={() => toggle("extra")}
          onCollapse={() => collapse("extra")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Approximate Budget</label>
              <input type="text" className={inputClass} placeholder="e.g. $2,000 – $3,500" value={form.budget} onChange={set("budget")} />
            </div>
            <div>
              <label className={labelClass}>How did you hear about us?</label>
              <input type="text" className={inputClass} placeholder="e.g. Google, Instagram, referral" value={form.heardFrom} onChange={set("heardFrom")} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Anything else we should know?</label>
              <textarea className={`${inputClass} resize-none`} rows={3} placeholder="Special requests, theme, setup needs, etc." value={form.notes} onChange={set("notes")} />
            </div>
          </div>
        </Section>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded-sm">
            {error}
          </p>
        )}

        {/* Submit — only visible until showSubmit banner appears */}
        {!showSubmit && (
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white font-bold py-4 px-6 hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed rounded-sm flex items-center justify-center gap-2 text-sm tracking-wide uppercase mt-2"
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" />Sending Request…</>
            ) : (
              "Submit Quote Request"
            )}
          </button>
        )}
      </form>
    </div>
  );
}
