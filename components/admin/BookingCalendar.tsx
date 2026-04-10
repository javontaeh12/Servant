"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  ExternalLink,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Booking, BookingStatus } from "@/lib/types";

interface BlockedDate {
  date: string;
  reason?: string;
  blockedBy?: string;
  blockedAt: string;
}

interface BookingCalendarProps {
  bookings: Booking[];
  blockedDates: BlockedDate[];
  onBlockDate: (date: string, reason?: string) => void;
  onUnblockDate: (date: string) => void;
  onSelectBooking: (booking: Booking) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface ParsedMealInfo {
  type: "preset" | "custom";
  presetName?: string;
  pricePerPerson?: number;
  items: { name: string; pricePerPerson: number }[];
}

function parseMealInfo(raw: string | null): ParsedMealInfo | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as ParsedMealInfo; } catch { return null; }
}

// Determine cell background color based on bookings + blocked status
function getCellStyle(isBlocked: boolean, dayBookings: Booking[], isSelected: boolean, isPast: boolean): string {
  if (isSelected) return "bg-primary/10 ring-1 ring-inset ring-primary/40";
  if (isBlocked) return "bg-red-200/80";
  const hasApproved = dayBookings.some((b) => b.status === "approved");
  const hasPending = dayBookings.some((b) => b.status === "pending");
  if (hasApproved) return "bg-green-200/70 hover:bg-green-200/90";
  if (hasPending) return "bg-amber-200/70 hover:bg-amber-200/90";
  if (isPast) return "bg-slate-50/50";
  return "hover:bg-sky/30";
}

export default function BookingCalendar({
  bookings,
  blockedDates,
  onBlockDate,
  onUnblockDate,
  onSelectBooking,
}: BookingCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const blockedSet = useMemo(
    () => new Set(blockedDates.map((b) => b.date)),
    [blockedDates]
  );

  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    for (const b of bookings) {
      if (b.status === "rejected") continue;
      if (!map[b.eventDate]) map[b.eventDate] = [];
      map[b.eventDate].push(b);
    }
    return map;
  }, [bookings]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
    setSelectedDate(null);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
    setSelectedDate(null);
  }

  function goToToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(null);
  }

  const selectedBookings = selectedDate ? (bookingsByDate[selectedDate] || []) : [];
  const isSelectedBlocked = selectedDate ? blockedSet.has(selectedDate) : false;
  const selectedBlockInfo = selectedDate ? blockedDates.find((b) => b.date === selectedDate) : null;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1.5 rounded-sm border border-sky-deep hover:bg-sky/50 transition-colors">
            <ChevronLeft size={16} className="text-slate-muted" />
          </button>
          <h3 className="text-slate-text font-bold text-sm min-w-[160px] text-center">{monthLabel}</h3>
          <button onClick={nextMonth} className="p-1.5 rounded-sm border border-sky-deep hover:bg-sky/50 transition-colors">
            <ChevronRight size={16} className="text-slate-muted" />
          </button>
        </div>
        <button onClick={goToToday} className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">
          Today
        </button>
      </div>

      {/* Calendar grid */}
      <div className="border border-sky-deep rounded-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-sky/50 border-b border-sky-deep">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2 text-center text-[10px] sm:text-xs font-bold text-slate-muted uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="border-b border-r border-sky-deep/50 min-h-[52px] sm:min-h-[72px] bg-slate-50/50" />;
            }

            const dateStr = formatDateStr(viewYear, viewMonth, day);
            const isToday = dateStr === todayStr;
            const isBlocked = blockedSet.has(dateStr);
            const dayBookings = bookingsByDate[dateStr] || [];
            const isSelected = dateStr === selectedDate;
            const isPast = new Date(dateStr + "T23:59:59") < new Date(todayStr + "T00:00:00");

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={cn(
                  "border-b border-r border-sky-deep/50 min-h-[52px] sm:min-h-[72px] p-1 sm:p-1.5 text-left transition-colors relative",
                  getCellStyle(isBlocked, dayBookings, isSelected, isPast)
                )}
              >
                <span className={cn(
                  "text-xs sm:text-sm font-medium inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full",
                  isToday ? "bg-primary text-white" : isPast ? "text-slate-muted/50" : "text-slate-text"
                )}>
                  {day}
                </span>

                {isBlocked && <Lock size={10} className="absolute top-1 right-1 text-red-600" />}

                {/* Name labels on desktop */}
                {dayBookings.length > 0 && (
                  <div className="hidden sm:block mt-0.5">
                    {dayBookings.slice(0, 2).map((b) => (
                      <p key={b.id} className="text-[10px] text-slate-text/70 truncate leading-tight font-medium">
                        {b.clientName.split(" ")[0]}
                      </p>
                    ))}
                    {dayBookings.length > 2 && (
                      <p className="text-[9px] text-slate-muted font-bold">+{dayBookings.length - 2} more</p>
                    )}
                  </div>
                )}

                {/* Dot on mobile */}
                {dayBookings.length > 0 && (
                  <div className="sm:hidden flex gap-0.5 mt-0.5">
                    {dayBookings.slice(0, 3).map((b) => (
                      <span key={b.id} className={cn("w-1.5 h-1.5 rounded-full",
                        b.status === "approved" ? "bg-green-600" : "bg-amber-500"
                      )} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-slate-muted">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-200/70 border border-amber-300" /> Pending</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-200/70 border border-green-300" /> Confirmed</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-200/70 border border-red-300" /> Blocked</span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] flex items-center justify-center font-bold">{today.getDate()}</span> Today
        </span>
      </div>

      {/* Selected date panel */}
      {selectedDate && (
        <div className="mt-4 border border-sky-deep rounded-sm overflow-hidden">
          <div className="flex items-center justify-between bg-sky/50 px-4 py-3 border-b border-sky-deep">
            <h4 className="text-slate-text text-sm font-bold">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </h4>
            <button onClick={() => setSelectedDate(null)} className="text-slate-muted hover:text-slate-text">
              <X size={16} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Block/Unblock */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              {isSelectedBlocked ? (
                <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <Lock size={14} />
                    <span className="font-bold">Date is blocked</span>
                    {selectedBlockInfo?.reason && <span className="text-red-400 text-xs">({selectedBlockInfo.reason})</span>}
                  </div>
                  <button
                    onClick={() => onUnblockDate(selectedDate)}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors border border-sky-deep px-3 py-1.5 rounded-sm"
                  >
                    <Unlock size={12} /> Unblock Date
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                  <input
                    type="text"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Reason (optional)"
                    className="flex-1 bg-sky/50 border border-sky-deep text-slate-text px-3 py-1.5 text-xs rounded-sm focus:outline-none focus:border-primary/50 w-full sm:w-auto"
                  />
                  <button
                    onClick={() => { onBlockDate(selectedDate, blockReason || undefined); setBlockReason(""); }}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 transition-colors border border-red-200 px-3 py-1.5 rounded-sm whitespace-nowrap"
                  >
                    <Lock size={12} /> Block Date
                  </button>
                </div>
              )}
            </div>

            {/* Bookings on this date */}
            {selectedBookings.length === 0 ? (
              <p className="text-slate-muted text-sm">No bookings on this date.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-slate-muted text-xs font-bold uppercase tracking-wide">
                  {selectedBookings.length} Booking{selectedBookings.length !== 1 ? "s" : ""}
                </p>
                {selectedBookings.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setDetailBooking(b)}
                    className={cn(
                      "w-full text-left border rounded-sm p-3 transition-colors",
                      b.status === "approved"
                        ? "border-green-300 bg-green-50 hover:bg-green-100"
                        : "border-amber-300 bg-amber-50 hover:bg-amber-100"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-text text-sm font-bold truncate">{b.clientName}</span>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase border",
                        b.status === "pending" ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-green-100 text-green-800 border-green-300"
                      )}>
                        {b.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-muted">
                      {b.eventTime && <span className="flex items-center gap-1"><Clock size={11} /> {b.eventTime}</span>}
                      {b.guestCount > 0 && <span className="flex items-center gap-1"><Users size={11} /> {b.guestCount} guests</span>}
                      {b.eventType && <span>{b.eventType}</span>}
                    </div>
                    <p className="text-[10px] text-slate-muted/60 mt-1">Tap to view details</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {detailBooking && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
          onClick={() => setDetailBooking(null)}
        >
          <div
            className="bg-white rounded-t-lg sm:rounded-sm shadow-xl w-full sm:max-w-md sm:mx-4 border border-sky-deep max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-sky-deep">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase border",
                  detailBooking.status === "pending" ? "bg-amber-100 text-amber-800 border-amber-300"
                    : detailBooking.status === "approved" ? "bg-green-100 text-green-800 border-green-300"
                    : "bg-red-100 text-red-800 border-red-200"
                )}>
                  {detailBooking.status}
                </span>
                <h3 className="text-slate-text font-bold text-sm">{detailBooking.clientName}</h3>
              </div>
              <button onClick={() => setDetailBooking(null)} className="text-slate-muted hover:text-slate-text p-1">
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-4">
              {/* Event details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-text">
                  <Calendar size={14} className="text-primary flex-shrink-0" />
                  <span className="font-medium">{formatDate(detailBooking.eventDate)}</span>
                </div>
                {detailBooking.eventTime && (
                  <div className="flex items-center gap-2 text-sm text-slate-muted">
                    <Clock size={14} className="flex-shrink-0" />
                    {detailBooking.eventTime}
                  </div>
                )}
                {detailBooking.guestCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-slate-muted">
                    <Users size={14} className="flex-shrink-0" />
                    {detailBooking.guestCount} guests
                  </div>
                )}
                {detailBooking.eventType && (
                  <div className="text-sm text-slate-muted pl-5">
                    {detailBooking.eventType}{detailBooking.serviceStyle ? ` · ${detailBooking.serviceStyle}` : ""}
                  </div>
                )}
              </div>

              {/* Client contact */}
              <div className="border-t border-sky-deep pt-4 space-y-2">
                <p className="text-xs font-bold text-slate-muted uppercase tracking-wide">Client</p>
                {detailBooking.clientEmail && (
                  <a href={`mailto:${detailBooking.clientEmail}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <Mail size={13} /> {detailBooking.clientEmail}
                  </a>
                )}
                {detailBooking.clientPhone && (
                  <a href={`tel:${detailBooking.clientPhone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <Phone size={13} /> {detailBooking.clientPhone}
                  </a>
                )}
              </div>

              {/* Pricing */}
              {detailBooking.estimatedTotal != null && detailBooking.estimatedTotal > 0 && (
                <div className="border-t border-sky-deep pt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-muted uppercase tracking-wide">Total</span>
                  <span className="flex items-center gap-1 font-bold text-slate-text text-sm">
                    <DollarSign size={13} />${detailBooking.estimatedTotal.toFixed(2)}
                  </span>
                </div>
              )}

              {detailBooking.invoiceUrl && (
                <a
                  href={detailBooking.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark font-bold"
                >
                  <ExternalLink size={13} /> View Invoice
                </a>
              )}

              {/* Meal info */}
              {(() => {
                const meal = parseMealInfo(detailBooking.mealInfo);
                if (!meal) return null;
                return (
                  <div className="border-t border-sky-deep pt-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <UtensilsCrossed size={13} className="text-primary" />
                      <span className="text-xs font-bold text-slate-text">
                        {meal.type === "preset" ? `Specialty: ${meal.presetName}` : "Custom Menu"}
                      </span>
                    </div>
                    <ul className="space-y-0.5 pl-5">
                      {meal.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-xs text-slate-muted">
                          <span>{item.name}</span>
                          <span>${item.pricePerPerson}/pp</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              {/* Notes */}
              {detailBooking.notes && (
                <div className="border-t border-sky-deep pt-4">
                  <p className="text-xs font-bold text-slate-muted uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-slate-muted italic">{detailBooking.notes}</p>
                </div>
              )}

              {/* Dietary needs */}
              {detailBooking.dietaryNeeds && (
                <div className="border-t border-sky-deep pt-3">
                  <p className="text-xs font-bold text-slate-muted uppercase tracking-wide mb-1">Dietary Needs</p>
                  <p className="text-sm text-slate-muted">{detailBooking.dietaryNeeds}</p>
                </div>
              )}

              {/* Action buttons for pending */}
              {detailBooking.status === "pending" && (
                <div className="border-t border-sky-deep pt-4 flex gap-2">
                  <button
                    onClick={() => { setDetailBooking(null); onSelectBooking(detailBooking); }}
                    className="flex-1 flex items-center justify-center gap-1 px-4 py-2.5 bg-green-600 text-white rounded-sm text-xs font-bold hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
