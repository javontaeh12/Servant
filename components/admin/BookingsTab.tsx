"use client";

import { useState, useEffect } from "react";
import { Loader2, Calendar, Users, Mail, Phone, RefreshCw } from "lucide-react";
import { CalendarBooking } from "@/lib/types";

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

export default function BookingsTab({ password }: { password: string }) {
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/calendar/bookings", {
        headers: { "x-admin-password": password },
      });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error) {
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
        <button
          onClick={fetchBookings}
          className="flex items-center gap-1.5 text-primary text-xs font-bold hover:text-primary-dark transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="mx-auto text-slate-muted/30 mb-4" size={48} strokeWidth={1} />
          <p className="text-slate-muted text-sm">No upcoming bookings found.</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
