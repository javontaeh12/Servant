"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Calendar,
  Clock,
  Users,
  Mail,
  Phone,
  DollarSign,
  RefreshCw,
  Plus,
  Check,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarBooking, BookingStatus, TimeSlot } from "@/lib/types";
import { EVENT_TYPES, SERVICE_STYLES } from "@/lib/constants";

type FilterTab = "all" | BookingStatus;

interface ApprovalModalData {
  booking: CalendarBooking;
  finalTotal: string;
  depositAmount: string;
}

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
  });
}

function formatTime(isoString: string) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const statusBadgeStyles: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export default function BookingsTab() {
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [approvalModal, setApprovalModal] = useState<ApprovalModalData | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const fetchBookings = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const pendingCount = bookings.filter((b) => b.bookingStatus === "pending").length;
  const filteredBookings = bookings.filter((b) => {
    if (filter !== "all" && b.bookingStatus !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const parsed = parseBookingDescription(b.description);
      const searchable = [
        b.summary,
        b.clientEmail,
        b.clientPhone,
        parsed.client,
        parsed.email,
        parsed.phone,
        parsed["event type"],
        parsed["service style"],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

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
      // Slots failed to load
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

  function openApprovalModal(booking: CalendarBooking) {
    setApprovalModal({
      booking,
      finalTotal: booking.estimatedTotal ? String(booking.estimatedTotal) : "",
      depositAmount: booking.estimatedTotal
        ? String(Math.round(booking.estimatedTotal * 0.5))
        : "",
    });
  }

  async function handleApprove() {
    if (!approvalModal) return;

    const { booking, finalTotal, depositAmount } = approvalModal;
    const deposit = Number(depositAmount);
    const total = Number(finalTotal);

    if (!total || total <= 0) return;
    if (!deposit || deposit <= 0 || deposit > total) return;

    const parsed = parseBookingDescription(booking.description);

    setActionLoading(booking.id);
    try {
      const res = await fetch(`/api/calendar/bookings/${booking.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finalTotal: total,
          depositAmount: deposit,
          clientEmail: booking.clientEmail || parsed.email || "",
          clientName: parsed.client || booking.summary.split(" - ")[1]?.split(" - ")[0] || "Client",
          eventType: parsed["event type"] || booking.summary.split(" - ").pop() || "Catering Event",
          eventDate: booking.start.split("T")[0],
          guestCount: parsed["guest count"] || "0",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to approve");
      }

      setApprovalModal(null);
      await fetchBookings();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to approve booking");
      setTimeout(() => setSubmitError(null), 4000);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(bookingId: string) {
    if (!confirm("Are you sure you want to reject this booking?")) return;

    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/calendar/bookings/${bookingId}/reject`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to reject");
      await fetchBookings();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to reject booking");
      setTimeout(() => setSubmitError(null), 4000);
    } finally {
      setActionLoading(null);
    }
  }

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
      {/* Pending banner */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 border border-amber-200 bg-amber-50 rounded-sm p-4 mb-6">
          <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
          <div className="flex-1">
            <p className="text-amber-800 text-sm font-bold">
              {pendingCount} booking{pendingCount !== 1 ? "s" : ""} awaiting review
            </p>
            <p className="text-amber-600 text-xs">Approve or reject pending bookings to notify clients.</p>
          </div>
          <button
            onClick={() => setFilter("pending")}
            className="bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-sm hover:bg-amber-700 transition-colors"
          >
            View Pending
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-primary text-xs font-bold tracking-[0.15em] uppercase">
          Bookings ({bookings.length})
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

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted/50"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, phone, event type..."
          className={cn(inputClass, "pl-10")}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border border-sky-deep rounded-sm p-1 mb-6 w-fit">
        {(["all", "pending", "approved", "rejected"] as const).map((tab) => {
          const count =
            tab === "all" ? bookings.length : bookings.filter((b) => b.bookingStatus === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wide transition-colors",
                filter === tab
                  ? "bg-primary text-white"
                  : "text-slate-muted hover:text-slate-text"
              )}
            >
              {tab} ({count})
            </button>
          );
        })}
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
                  <Loader2 className="animate-spin" size={14} /> Loading slots...
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

      {/* Bookings list */}
      {filteredBookings.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <Calendar className="mx-auto text-slate-muted/30 mb-4" size={48} strokeWidth={1} />
          <p className="text-slate-muted text-sm">
            No {filter !== "all" ? filter : ""} bookings found.
          </p>
        </div>
      ) : (
        filteredBookings.length > 0 && (
          <div className="space-y-3">
            {filteredBookings.map((booking) => {
              const parsed = parseBookingDescription(booking.description);
              const isActioning = actionLoading === booking.id;

              return (
                <div
                  key={booking.id}
                  className="border border-sky-deep rounded-sm p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-slate-text font-bold text-sm truncate">
                          {booking.summary}
                        </h3>
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border",
                            statusBadgeStyles[booking.bookingStatus]
                          )}
                        >
                          {booking.bookingStatus}
                        </span>
                      </div>

                      {parsed.client && (
                        <p className="text-slate-muted text-sm mb-2">{parsed.client}</p>
                      )}

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-muted overflow-hidden">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDateTime(booking.start)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatTime(booking.start)} - {formatTime(booking.end)}
                        </span>
                        {(booking.clientEmail || parsed.email) && (
                          <a
                            href={`mailto:${booking.clientEmail || parsed.email}`}
                            className="flex items-center gap-1 truncate max-w-[200px] text-blue-600 hover:text-blue-800 underline underline-offset-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail size={12} className="flex-shrink-0" />
                            <span className="truncate">{booking.clientEmail || parsed.email}</span>
                          </a>
                        )}
                        {(booking.clientPhone || parsed.phone) && (
                          <a
                            href={`tel:${booking.clientPhone || parsed.phone}`}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 underline underline-offset-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone size={12} />
                            {booking.clientPhone || parsed.phone}
                          </a>
                        )}
                        {parsed["guest count"] && (
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {parsed["guest count"]} guests
                          </span>
                        )}
                        {booking.estimatedTotal != null && booking.estimatedTotal > 0 && (
                          <span className="flex items-center gap-1 font-bold text-slate-text">
                            <DollarSign size={12} />
                            ${booking.estimatedTotal.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {booking.invoiceUrl && (
                        <a
                          href={booking.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:text-primary-dark font-bold"
                        >
                          <ExternalLink size={12} />
                          View Invoice
                        </a>
                      )}
                    </div>

                    {/* Action buttons for pending bookings */}
                    {booking.bookingStatus === "pending" && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => openApprovalModal(booking)}
                          disabled={isActioning}
                          className="flex items-center gap-1 px-4 py-2.5 bg-green-600 text-white rounded-sm text-xs font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {isActioning ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <Check size={14} />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(booking.id)}
                          disabled={isActioning}
                          className="flex items-center gap-1 px-4 py-2.5 bg-red-600 text-white rounded-sm text-xs font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          <X size={14} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Approval Modal */}
      {approvalModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setApprovalModal(null)}
        >
          <div
            className="bg-white rounded-sm shadow-xl w-full max-w-md mx-4 p-6 border border-sky-deep"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-slate-text text-sm font-bold mb-1">Approve Booking</h3>
            <p className="text-slate-muted text-xs mb-5">
              Set the final price and deposit. A Square invoice will be created and emailed to the client.
            </p>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Final Total ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={approvalModal.finalTotal}
                  onChange={(e) =>
                    setApprovalModal({ ...approvalModal, finalTotal: e.target.value })
                  }
                  className={inputClass}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className={labelClass}>Deposit Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={approvalModal.depositAmount}
                  onChange={(e) =>
                    setApprovalModal({ ...approvalModal, depositAmount: e.target.value })
                  }
                  className={inputClass}
                  placeholder="0.00"
                />
              </div>

              {/* Preview split */}
              {Number(approvalModal.finalTotal) > 0 && Number(approvalModal.depositAmount) > 0 && (
                <div className="border border-sky-deep rounded-sm p-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-muted text-xs">Deposit (due in 3 days)</span>
                    <span className="text-slate-text text-xs font-bold">
                      ${Number(approvalModal.depositAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-muted text-xs">Balance (due before event)</span>
                    <span className="text-slate-text text-xs font-bold">
                      ${(Number(approvalModal.finalTotal) - Number(approvalModal.depositAmount)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-sky-deep">
                    <span className="text-slate-text text-xs font-bold uppercase">Total</span>
                    <span className="text-slate-text text-sm font-bold">
                      ${Number(approvalModal.finalTotal).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setApprovalModal(null)}
                  className="flex-1 border border-sky-deep text-slate-muted text-xs font-bold uppercase tracking-wide px-4 py-3 rounded-sm hover:bg-sky/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading === approvalModal.booking.id}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white text-xs font-bold uppercase tracking-wide px-4 py-3 rounded-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === approvalModal.booking.id ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Creating Invoice...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Approve & Invoice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
