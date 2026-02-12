import { google } from "googleapis";
import { TimeSlot, PricingConfig, QuoteEstimate, CalendarBooking } from "./types";
import { formatCurrency } from "./pricing";
import { getGoogleRefreshToken } from "./credentials";

async function getCalendarClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  const refreshToken = await getGoogleRefreshToken();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";
const TIMEZONE = process.env.BUSINESS_TIMEZONE || "America/Chicago";

// Business hours: 9 AM to 7 PM, 1-hour slots
const BUSINESS_START_HOUR = 9;
const BUSINESS_END_HOUR = 19;
const SLOT_DURATION_MINUTES = 60;

export async function getAvailableSlots(date: string): Promise<TimeSlot[]> {
  const dayStart = new Date(`${date}T0${BUSINESS_START_HOUR}:00:00`);
  const dayEnd = new Date(`${date}T${BUSINESS_END_HOUR}:00:00`);

  // Don't show slots for past dates
  const now = new Date();
  if (dayEnd < now) return [];

  try {
    const calendar = await getCalendarClient();
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: dayStart.toISOString(),
        timeMax: dayEnd.toISOString(),
        timeZone: TIMEZONE,
        items: [{ id: CALENDAR_ID }],
      },
    });

    const busySlots =
      response.data.calendars?.[CALENDAR_ID]?.busy || [];

    // Generate all possible slots within business hours
    const allSlots: TimeSlot[] = [];
    const current = new Date(dayStart);

    while (current.getTime() + SLOT_DURATION_MINUTES * 60000 <= dayEnd.getTime()) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current.getTime() + SLOT_DURATION_MINUTES * 60000);

      // Skip slots that are in the past
      if (slotStart > now) {
        // Check if slot overlaps with any busy period
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

      current.setMinutes(current.getMinutes() + SLOT_DURATION_MINUTES);
    }

    return allSlots;
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return [];
  }
}

export async function listUpcomingBookings(): Promise<CalendarBooking[]> {
  try {
    const calendar = await getCalendarClient();
    const now = new Date();
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: now.toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];
    return events.map((event) => ({
      id: event.id || "",
      summary: event.summary || "Untitled",
      description: event.description || "",
      start: event.start?.dateTime || event.start?.date || "",
      end: event.end?.dateTime || event.end?.date || "",
      status: event.status || "confirmed",
      created: event.created || "",
    }));
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
}): Promise<{ eventId: string }> {
  const startTime = new Date(data.eventTime);
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
      colorId: "6", // Tangerine/orange for visibility
    },
  });

  return { eventId: event.data.id || "" };
}

function formatTimeLabel(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
