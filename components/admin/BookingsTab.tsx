"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Calendar,
  Users,
  Mail,
  Phone,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarBooking, TimeSlot } from "@/lib/types";
import { EVENT_TYPES, SERVICE_STYLES } from "@/lib/constants";

const inputClass =
  "w-full bg-sky/50 border border-sky-deep text-slate-text px-4 py-3 focus:border-primary/50 focus:outline-none transition-colors text-sm rounded-sm";
const labelClass =
  "block text-slate-muted text-xs font-bold tracking-wide uppercase mb-2";

function parseBookingDescription(description: string) {
  const lines = description.split("\n");
  const data: Record<string, string> = {};
  for (const line of lines) {
    const match = line.match(/^[^\w]*(\w[\w\s]+?):\s*(.+)$/);
    if (match) {
      data[match[1].trim().toLowerCase()] = match[2].trim();
    }
  }
  return data;
}

function formatDateTime(isoString: string) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function BookingsTab() {
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Booking form state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [eventType, setEventType] = useState("");
  const [serviceStyle, setServiceStyle] = useState("");
  const [notes, setNotes] = useState("");

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/calendar/bookings");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBookings(data);
    } catch {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setClientName("");
    setEmail("");
    setPhone("");
    setEventDate("");
    setTimeSlot("");
    setGuestCount("");
    setEventType("");
    setServiceStyle("");
    setNotes("");
    setAvailableSlots([]);
  };

  const handleDateChange = async (date: string) => {
    setEventDate(date);
    setTimeSlot("");
    setAvailableSlots([]);
    if (!date) return;

    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/calendar/available-slots?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(data.slots || []);
      }
    } catch {
      // Slots failed to load — user can still type manually
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const res = await fetch("/api/calendar/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientName,
          email,
          phone: phone || undefined,
          eventDate,
          eventTime: timeSlot,
          guestCount: guestCount ? parseInt(guestCount) : undefined,
          eventType: eventType || undefined,
          serviceType: serviceStyle || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create booking");
      }

      setSubmitSuccess("Booking created successfully!");
      resetForm();
      setShowForm(false);
      fetchBookings();
      setTimeout(() => setSubmitSuccess(null), 4000);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to create booking"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error && !showForm) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <button
          onClick={fetchBookings}
          className="text-primary text-sm font-bold hover:text-primary-dark transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-primary text-xs font-bold tracking-[0.15em] uppercase">
          Upcoming Bookings ({bookings.length})
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookings}
            className="flex items-center gap-1.5 text-primary text-xs font-bold hover:text-primary-dark transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) resetForm();
            }}
            className="bg-primary text-white font-body font-bold text-xs tracking-wide uppercase px-5 py-2.5 rounded-sm hover:bg-primary-dark transition-all flex items-center gap-1.5"
          >
            <Plus size={14} strokeWidth={2.5} />
            Add Booking
          </button>
        </div>
      </div>

      {/* Status messages */}
      {submitSuccess && (
        <div className="flex items-center gap-2 text-green-600 text-sm mb-4 border border-green-200 bg-green-50 p-3 rounded-sm">
          <CheckCircle2 size={16} /> {submitSuccess}
        </div>
      )}
      {submitError && (
        <div className="flex items-center gap-2 text-red-500 text-sm mb-4 border border-red-200 bg-red-50 p-3 rounded-sm">
          <AlertCircle size={16} /> {submitError}
        </div>
      )}

      {/* Add Booking form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="border border-sky-deep rounded-sm p-5 mb-6 space-y-4"
        >
          <h3 className="text-slate-text text-sm font-bold">New Booking</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Client Name *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Full name"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 555-5555"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Event Date *</label>
              <input
                type="date"
                required
                min={today}
                value={eventDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Time Slot *</label>
              {loadingSlots ? (
                <div className="flex items-center gap-2 px-4 py-3 text-slate-muted text-sm">
                  <Loader2 className="animate-spin" size={14} /> Loading
                  slots...
                </div>
              ) : (
                <select
                  required
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  disabled={!eventDate || availableSlots.length === 0}
                  className={inputClass}
                >
                  <option value="">
                    {eventDate
                      ? availableSlots.length > 0
                        ? "Select a time..."
                        : "No slots available"
                      : "Pick a date first"}
                  </option>
                  {availableSlots.map((slot) => (
                    <option key={slot.start} value={slot.start}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Guest Count</label>
              <input
                type="number"
                min="1"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                placeholder="Number of guests"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className={inputClass}
              >
                <option value="">Select event type...</option>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Service Style</label>
              <select
                value={serviceStyle}
                onChange={(e) => setServiceStyle(e.target.value)}
                className={inputClass}
              >
                <option value="">Select service style...</option>
                {SERVICE_STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details, dietary restrictions, special requests..."
              rows={3}
              className={cn(inputClass, "resize-none")}
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-white font-heading font-bold text-xs tracking-[0.15em] uppercase px-8 py-3.5 flex items-center gap-2 rounded-sm hover:bg-primary-dark transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} /> Creating...
                </>
              ) : (
                "Create Booking"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-slate-muted text-xs font-bold hover:text-slate-text transition-colors px-4 py-3.5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {bookings.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <Calendar className="mx-auto text-slate-muted/30 mb-4" size={48} strokeWidth={1} />
          <p className="text-slate-muted text-sm">No upcoming bookings found.</p>
        </div>
      ) : (
        bookings.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sky-deep">
                    <th className="text-left py-3 px-2 text-slate-muted text-xs font-bold tracking-wide uppercase">
                      Event
                    </th>
                    <th className="text-left py-3 px-2 text-slate-muted text-xs font-bold tracking-wide uppercase">
                      Date & Time
                    </th>
                    <th className="text-left py-3 px-2 text-slate-muted text-xs font-bold tracking-wide uppercase">
                      Client
                    </th>
                    <th className="text-left py-3 px-2 text-slate-muted text-xs font-bold tracking-wide uppercase">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const parsed = parseBookingDescription(booking.description);
                    return (
                      <tr key={booking.id} className="border-b border-sky-deep/50">
                        <td className="py-4 px-2">
                          <p className="text-slate-text font-bold text-sm">
                            {booking.summary}
                          </p>
                        </td>
                        <td className="py-4 px-2 text-slate-muted text-sm whitespace-nowrap">
                          {formatDateTime(booking.start)}
                        </td>
                        <td className="py-4 px-2">
                          {parsed.client && (
                            <p className="text-slate-text text-sm">{parsed.client}</p>
                          )}
                          {parsed.email && (
                            <p className="text-slate-muted text-xs flex items-center gap-1">
                              <Mail size={10} /> {parsed.email}
                            </p>
                          )}
                          {parsed.phone && (
                            <p className="text-slate-muted text-xs flex items-center gap-1">
                              <Phone size={10} /> {parsed.phone}
                            </p>
                          )}
                        </td>
                        <td className="py-4 px-2">
                          {parsed["guest count"] && (
                            <p className="text-slate-muted text-xs flex items-center gap-1">
                              <Users size={10} /> {parsed["guest count"]} guests
                            </p>
                          )}
                          {parsed["event type"] && (
                            <p className="text-slate-muted text-xs">
                              {parsed["event type"]}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-4">
              {bookings.map((booking) => {
                const parsed = parseBookingDescription(booking.description);
                return (
                  <div
                    key={booking.id}
                    className="border border-sky-deep rounded-sm p-4 space-y-3"
                  >
                    <p className="text-slate-text font-bold text-sm">
                      {booking.summary}
                    </p>
                    <p className="text-slate-muted text-xs">
                      {formatDateTime(booking.start)}
                    </p>
                    {parsed.client && (
                      <p className="text-slate-text text-sm">{parsed.client}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-slate-muted">
                      {parsed.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={10} /> {parsed.email}
                        </span>
                      )}
                      {parsed.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={10} /> {parsed.phone}
                        </span>
                      )}
                      {parsed["guest count"] && (
                        <span className="flex items-center gap-1">
                          <Users size={10} /> {parsed["guest count"]} guests
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )
      )}
    </div>
  );
}
