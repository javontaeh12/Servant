import { NextRequest, NextResponse } from "next/server";
import { getBookingById, updateBooking } from "@/lib/bookings";
import { getSessionFromRequest } from "@/lib/session";
import { notifyClientBookingRejected } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const booking = await getBookingById(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  try {
    await updateBooking(id, { status: "rejected" });

    // Notify client (fire-and-forget)
    notifyClientBookingRejected({
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      eventDate: booking.eventDate,
      eventType: booking.eventType,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reject booking error:", error);
    return NextResponse.json(
      { error: "Failed to reject booking" },
      { status: 500 }
    );
  }
}
