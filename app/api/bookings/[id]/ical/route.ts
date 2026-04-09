import { NextRequest, NextResponse } from "next/server";
import { getBookingById } from "@/lib/bookings";

function escapeIcal(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function parseTime(timeStr: string): { hour: number; minute: number } {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return { hour: 12, minute: 0 };
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return { hour, minute };
}

function toIcalDate(dateStr: string, timeStr: string): string {
  const { hour, minute } = parseTime(timeStr || "12:00 PM");
  const d = dateStr.replace(/-/g, "");
  return `${d}T${String(hour).padStart(2, "0")}${String(minute).padStart(2, "0")}00`;
}

function toIcalDateEnd(dateStr: string, timeStr: string): string {
  const { hour, minute } = parseTime(timeStr || "12:00 PM");
  const d = dateStr.replace(/-/g, "");
  return `${d}T${String(hour + 2).padStart(2, "0")}${String(minute).padStart(2, "0")}00`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking || booking.status !== "approved") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const tz = process.env.BUSINESS_TIMEZONE || "America/New_York";
  const dtStart = toIcalDate(booking.eventDate, booking.eventTime);
  const dtEnd = toIcalDateEnd(booking.eventDate, booking.eventTime);
  const summary = `${booking.eventType} - I'm A Servant First Catering`;
  const description = [
    `Catered by I'm A Servant First LLC`,
    booking.guestCount ? `Guests: ${booking.guestCount}` : "",
    booking.serviceStyle ? `Service Style: ${booking.serviceStyle}` : "",
    `Questions? Email imaservantfirst07@gmail.com`,
  ]
    .filter(Boolean)
    .join("\\n");

  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  const ical = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IASF Catering//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.id}@iasfcatering.com`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=${tz}:${dtStart}`,
    `DTEND;TZID=${tz}:${dtEnd}`,
    `SUMMARY:${escapeIcal(summary)}`,
    `DESCRIPTION:${escapeIcal(description)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ical, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="booking-${id}.ics"`,
      "Cache-Control": "no-cache",
    },
  });
}
