import { google } from "googleapis";
import { TimeSlot, PricingConfig, QuoteEstimate, CalendarBooking, BookingStatus } from "./types";
import { formatCurrency } from "./pricing";
import { getGoogleRefreshToken } from "./credentials";

// Color IDs for Google Calendar events
const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "6",   // tangerine/orange
  approved: "10", // basil/green
  rejected: "11", // tomato/red
};

async function getCalendarClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  const refreshToken = await getGoogleRefreshToken();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function getGmailOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  const refreshToken = await getGoogleRefreshToken();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return oauth2Client;
}

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";
const TIMEZONE = process.env.BUSINESS_TIMEZONE || "America/New_York";

// Business hours: 9 AM to 7 PM, 1-hour slots
const BUSINESS_START_HOUR = 9;
const BUSINESS_END_HOUR = 19;
const SLOT_DURATION_MINUTES = 60;

/**
 * Convert a date + time in a specific timezone to a UTC Date.
 * e.g. dateInTimezone("2026-03-15", 9, 0, "America/New_York") → UTC Date for 9 AM Eastern
 */
function dateInTimezone(dateStr: string, hour: number, minute: number, timezone: string): Date {
  const pad = (n: number) => String(n).padStart(2, "0");
  const utcGuess = new Date(`${dateStr}T${pad(hour)}:${pad(minute)}:00.000Z`);

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(utcGuess)
      .map(({ type, value }) => [type, value])
  );

  const tzHour = parseInt(parts.hour === "24" ? "0" : parts.hour);
  const tzMinute = parseInt(parts.minute);
  const tzDay = parseInt(parts.day);
  const requestedDay = parseInt(dateStr.split("-")[2]);

  let offsetMinutes = tzHour * 60 + tzMinute - (hour * 60 + minute);
  if (tzDay > requestedDay) offsetMinutes += 24 * 60;
  else if (tzDay < requestedDay) offsetMinutes -= 24 * 60;

  return new Date(utcGuess.getTime() - offsetMinutes * 60000);
}

/**
 * Generate all business-hour slots for a given date, skipping past slots.
 */
function generateDefaultSlots(date: string): TimeSlot[] {
  const now = new Date();
  const slots: TimeSlot[] = [];
  for (let hour = BUSINESS_START_HOUR; hour < BUSINESS_END_HOUR; hour++) {
    const slotStart = dateInTimezone(date, hour, 0, TIMEZONE);
    const slotEnd = dateInTimezone(date, hour + 1, 0, TIMEZONE);
    if (slotStart <= now) continue;
    slots.push({
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      label: `${formatTimeLabel(slotStart)} - ${formatTimeLabel(slotEnd)}`,
    });
  }
  return slots;
}

export async function getAvailableSlots(date: string): Promise<TimeSlot[]> {
  const dayEndUTC = dateInTimezone(date, BUSINESS_END_HOUR, 0, TIMEZONE);

  const now = new Date();
  if (dayEndUTC < now) return [];

  try {
    const calendar = await getCalendarClient();
    const dayStartUTC = dateInTimezone(date, BUSINESS_START_HOUR, 0, TIMEZONE);

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: dayStartUTC.toISOString(),
        timeMax: dayEndUTC.toISOString(),
        items: [{ id: CALENDAR_ID }],
      },
    });

    const busySlots =
      response.data.calendars?.[CALENDAR_ID]?.busy || [];

    const allSlots: TimeSlot[] = [];
    for (let hour = BUSINESS_START_HOUR; hour < BUSINESS_END_HOUR; hour++) {
      const slotStart = dateInTimezone(date, hour, 0, TIMEZONE);
      const slotEnd = dateInTimezone(date, hour + 1, 0, TIMEZONE);

      if (slotStart <= now) continue;

      const isConflict = busySlots.some((busy) => {
        const busyStart = new Date(busy.start!);
        const busyEnd = new Date(busy.end!);
        return slotStart < busyEnd && slotEnd > busyStart;
      });

      if (!isConflict) {
        allSlots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          label: `${formatTimeLabel(slotStart)} - ${formatTimeLabel(slotEnd)}`,
        });
      }
    }

    return allSlots;
  } catch (error) {
    console.error("Error fetching calendar availability, returning default slots:", error);
    return generateDefaultSlots(date);
  }
}

export async function listUpcomingBookings(): Promise<CalendarBooking[]> {
  try {
    const calendar = await getCalendarClient();
    const now = new Date();
    // Look back 30 days for recent bookings
    const timeMin = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: timeMin.toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];
    return events.map((event) => {
      const props = event.extendedProperties?.private || {};
      return {
        id: event.id || "",
        summary: event.summary || "Untitled",
        description: event.description || "",
        start: event.start?.dateTime || event.start?.date || "",
        end: event.end?.dateTime || event.end?.date || "",
        status: event.status || "confirmed",
        created: event.created || "",
        bookingStatus: (props.bookingStatus as BookingStatus) || "approved",
        clientEmail: props.clientEmail || null,
        clientPhone: props.clientPhone || null,
        estimatedTotal: props.estimatedTotal ? Number(props.estimatedTotal) : null,
        invoiceId: props.invoiceId || null,
        invoiceUrl: props.invoiceUrl || null,
        mealInfo: props.mealInfo || null,
      };
    });
  } catch (error) {
    console.error("Error listing bookings:", error);
    return [];
  }
}

export async function createBookingEvent(data: {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  eventType: string;
  serviceType: string;
  dietaryNeeds: string;
  notes: string;
  selectedAddOns?: string[];
  estimate?: QuoteEstimate | null;
  pricing?: PricingConfig | null;
  mealInfo?: string;
}): Promise<{ eventId: string }> {
  let startTime: Date;
  if (data.eventTime.includes("T")) {
    // Full ISO datetime from slot picker
    startTime = new Date(data.eventTime);
  } else if (data.eventDate && data.eventTime) {
    // Bare "HH:MM" fallback — interpret in business timezone
    const [hours, minutes] = data.eventTime.split(":").map(Number);
    startTime = dateInTimezone(data.eventDate, hours, minutes || 0, TIMEZONE);
  } else {
    startTime = new Date();
  }
  const endTime = new Date(startTime.getTime() + 2 * 60 * 60000); // 2-hour block

  const pricingLines: string[] = [];
  if (data.estimate) {
    pricingLines.push(
      ``,
      `💰 PRICING ESTIMATE`,
      ``,
      `  ${data.eventType} (base): ${formatCurrency(data.estimate.eventTypePrice)}`
    );
    if (data.estimate.serviceStylePrice !== 0) {
      pricingLines.push(
        `  ${data.serviceType}: ${data.estimate.serviceStylePrice > 0 ? "+" : ""}${formatCurrency(data.estimate.serviceStylePrice)}`
      );
    }
    pricingLines.push(
      `  Per-person (${data.guestCount} guests): ${formatCurrency(data.estimate.perPersonTotal)}`
    );
    for (const item of data.estimate.addOnBreakdown) {
      pricingLines.push(`  ${item.name}: ${formatCurrency(item.amount)}`);
    }
    pricingLines.push(
      ``,
      `  ESTIMATED TOTAL: ${formatCurrency(data.estimate.total)}`,
      `  * Estimate only — confirm final pricing with client`
    );
  }

  const addOnNames =
    data.selectedAddOns && data.pricing
      ? data.selectedAddOns
          .map((id) => data.pricing!.addOns.find((a) => a.id === id)?.name)
          .filter(Boolean)
      : [];

  const estimatedTotal = data.estimate?.total ?? 0;

  const calendar = await getCalendarClient();
  const event = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: {
      summary: `Catering Quote - ${data.name} - ${data.eventType}`,
      description: [
        `📋 CATERING QUOTE REQUEST`,
        ``,
        `👤 Client: ${data.name}`,
        `📧 Email: ${data.email}`,
        `📱 Phone: ${data.phone}`,
        ``,
        `🎉 Event Type: ${data.eventType}`,
        `🍽️ Service Style: ${data.serviceType}`,
        `👥 Guest Count: ${data.guestCount}`,
        `📅 Event Date: ${data.eventDate}`,
        addOnNames.length > 0 ? `✨ Add-Ons: ${addOnNames.join(", ")}` : "",
        ``,
        data.dietaryNeeds ? `🥗 Dietary Needs: ${data.dietaryNeeds}` : "",
        data.notes ? `📝 Notes: ${data.notes}` : "",
        ...pricingLines,
        ``,
        `---`,
        `Submitted via I'm A Servant First LLC website`,
      ]
        .filter(Boolean)
        .join("\n"),
      start: {
        dateTime: startTime.toISOString(),
        timeZone: TIMEZONE,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: TIMEZONE,
      },
      colorId: STATUS_COLORS.pending,
      extendedProperties: {
        private: {
          bookingStatus: "pending",
          clientEmail: data.email,
          clientPhone: data.phone,
          estimatedTotal: String(estimatedTotal),
          invoiceId: "",
          invoiceUrl: "",
          mealInfo: data.mealInfo || "",
        },
      },
    },
  });

  return { eventId: event.data.id || "" };
}

export async function updateBookingStatus(
  eventId: string,
  status: BookingStatus,
  extraProps?: Record<string, string>
) {
  const calendar = await getCalendarClient();

  // Get current event to preserve existing extended properties
  const existing = await calendar.events.get({
    calendarId: CALENDAR_ID,
    eventId,
  });

  const currentProps = existing.data.extendedProperties?.private || {};

  const updatedProps: Record<string, string> = {
    ...currentProps,
    bookingStatus: status,
    ...extraProps,
  };

  await calendar.events.patch({
    calendarId: CALENDAR_ID,
    eventId,
    requestBody: {
      colorId: STATUS_COLORS[status],
      extendedProperties: {
        private: updatedProps,
      },
    },
  });
}

function formatTimeLabel(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TIMEZONE,
  });
}
