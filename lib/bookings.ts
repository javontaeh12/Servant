import { put, get } from "@vercel/blob";
import { Booking, TimeSlot } from "./types";

const BOOKINGS_PATH = "data/bookings.json";

const BUSINESS_START_HOUR = 9;
const BUSINESS_END_HOUR = 19;

// ========== Storage ==========

export async function getBookings(): Promise<Booking[]> {
  try {
    const result = await get(BOOKINGS_PATH, { access: "private" });
    if (!result) return [];
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as Booking[];
  } catch {
    return [];
  }
}

async function saveBookings(bookings: Booking[]): Promise<void> {
  await put(BOOKINGS_PATH, JSON.stringify(bookings, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

// ========== CRUD ==========

export async function createBooking(
  data: Omit<Booking, "id" | "status" | "createdAt" | "updatedAt" | "invoiceId" | "invoiceUrl">
): Promise<Booking> {
  const bookings = await getBookings();
  const now = new Date().toISOString();

  const booking: Booking = {
    ...data,
    id: crypto.randomUUID(),
    status: "pending",
    invoiceId: null,
    invoiceUrl: null,
    createdAt: now,
    updatedAt: now,
  };

  bookings.push(booking);
  await saveBookings(bookings);
  return booking;
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const bookings = await getBookings();
  return bookings.find((b) => b.id === id) || null;
}

export async function updateBooking(
  id: string,
  updates: Partial<Booking>
): Promise<Booking | null> {
  const bookings = await getBookings();
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) return null;

  bookings[index] = {
    ...bookings[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await saveBookings(bookings);
  return bookings[index];
}

// ========== Available Slots ==========

function formatHour(hour: number): string {
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${h}:00 ${ampm}`;
}

function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let hour = BUSINESS_START_HOUR; hour < BUSINESS_END_HOUR; hour++) {
    const start = formatHour(hour);
    const end = formatHour(hour + 1);
    slots.push({ start, end, label: `${start} \u2013 ${end}` });
  }
  return slots;
}

export async function getAvailableSlots(dateStr: string): Promise<TimeSlot[]> {
  const allSlots = generateTimeSlots();

  // Past date check
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const requestDate = new Date(dateStr + "T00:00:00");
  if (requestDate < today) return [];

  // Get existing bookings for this date (exclude rejected)
  const bookings = await getBookings();
  const dateBookings = bookings.filter(
    (b) => b.eventDate === dateStr && b.status !== "rejected"
  );

  // Remove slots that already have bookings
  const bookedTimes = new Set(dateBookings.map((b) => b.eventTime));
  return allSlots.filter((slot) => !bookedTimes.has(slot.start));
}
