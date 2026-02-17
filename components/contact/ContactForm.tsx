"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

const inputClass =
  "w-full bg-white border border-sky-deep text-slate-text placeholder:text-slate-muted/40 px-4 py-3.5 focus:border-primary/50 focus:outline-none transition-colors text-sm rounded-sm";
const labelClass = "block text-slate-muted text-xs font-bold tracking-wide uppercase mb-2.5";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/calendar/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `[Contact Form] ${form.name}`,
          email: form.email,
          phone: form.phone,
          eventType: "General Inquiry",
          serviceType: "N/A",
          guestCount: 0,
          eventDate: new Date().toISOString().split("T")[0],
          eventTime: new Date().toISOString(),
          dietaryNeeds: "",
          notes: `Contact form message:\n\n${form.message}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Unable to send. Please call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="text-primary mx-auto mb-4" size={44} strokeWidth={1.5} />
        <h3 className="font-heading text-xl text-slate-text font-bold mb-2">
          Message Sent
        </h3>
        <p className="text-slate-muted text-sm">
          We&apos;ll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Full Name *</label>
        <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Email *</label>
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Phone</label>
        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(555) 123-4567" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Message *</label>
        <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help you?" rows={5} className={`${inputClass} resize-none`} />
      </div>

      {error && (
        <div className="border border-red-300 bg-red-50 p-3 text-red-600 text-sm text-center rounded-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary text-white font-heading font-bold text-xs tracking-[0.15em] uppercase py-4 rounded-sm hover:bg-primary-dark transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </button>
    </form>
  );
}
