import { NextRequest, NextResponse } from "next/server";
import { getBookings } from "@/lib/bookings";

function escapeIcal(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function parseTime(timeStr: string): { hour: number; minute: number } {
  // Parse "9:00 AM" or "1:00 PM" format
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
  // dateStr = "2026-04-15", timeStr = "9:00 AM"
  const { hour, minute } = parseTime(timeStr);
  const d = dateStr.replace(/-/g, "");
  const h = String(hour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${d}T${h}${m}00`;
}

function toIcalDateEnd(dateStr: string, timeStr: string): string {
  const { hour, minute } = parseTime(timeStr);
  const endHour = hour + 1; // 1-hour slot
  const d = dateStr.replace(/-/g, "");
  const h = String(endHour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${d}T${h}${m}00`;
}

export async function GET(request: NextRequest) {
  // Simple token auth — use a query param to protect the feed
  const token = request.nextUrl.searchParams.get("token");
  const expectedToken = process.env.CRON_SECRET;

  if (!token || token !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await getBookings();
  const tz = process.env.BUSINESS_TIMEZONE || "America/New_York";

  // Only include approved and pending bookings
  const activeBookings = bookings.filter(
    (b) => b.status === "approved" || b.status === "pending"
  );

  const events = activeBookings.map((b) => {
    const dtStart = toIcalDate(b.eventDate, b.eventTime);
    const dtEnd = toIcalDateEnd(b.eventDate, b.eventTime);
    const statusTag = b.status === "pending" ? "[PENDING] " : "";
    const summary = `${statusTag}${b.eventType} - ${b.clientName}`;
    const description = [
      `Client: ${b.clientName}`,
      `Email: ${b.clientEmail}`,
      `Phone: ${b.clientPhone}`,
      `Guests: ${b.guestCount}`,
      `Service: ${b.serviceStyle}`,
      b.dietaryNeeds ? `Dietary: ${b.dietaryNeeds}` : "",
      b.notes ? `Notes: ${b.notes}` : "",
      b.status === "approved" && b.estimatedTotal
        ? `Total: $${b.estimatedTotal}`
        : "",
    ]
      .filter(Boolean)
      .join("\\n");

    return [
      "BEGIN:VEVENT",
      `UID:${b.id}@iasfcatering.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
      `DTSTART;TZID=${tz}:${dtStart}`,
      `DTEND;TZID=${tz}:${dtEnd}`,
      `SUMMARY:${escapeIcal(summary)}`,
      `DESCRIPTION:${escapeIcal(description)}`,
      `STATUS:${b.status === "approved" ? "CONFIRMED" : "TENTATIVE"}`,
      "END:VEVENT",
    ].join("\r\n");
  });

  const ical = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IASF Catering//Bookings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:IASF Catering Bookings",
    `X-WR-TIMEZONE:${tz}`,
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ical, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="bookings.ics"',
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
