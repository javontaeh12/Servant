import { NextRequest, NextResponse } from "next/server";
import { getBookingById, updateBooking } from "@/lib/bookings";
import { createInvoiceForBooking } from "@/lib/square-invoice";
import { getSessionFromRequest } from "@/lib/session";
import { notifyClientBookingConfirmed } from "@/lib/email";

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
    const body = await request.json();
    const {
      finalTotal,
      depositAmount,
      clientEmail,
      clientName,
      eventType,
      eventDate,
      mealInfo,
    } = body;

    if (!finalTotal || !depositAmount || !clientEmail || !clientName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create Square invoice
    let invoiceId = "";
    let invoiceUrl = "";
    try {
      const invoiceResult = await createInvoiceForBooking({
        clientName,
        clientEmail,
        eventType: eventType || "Catering Event",
        eventDate: eventDate || new Date().toISOString().split("T")[0],
        finalTotal: Number(finalTotal),
        depositAmount: Number(depositAmount),
        mealInfo: mealInfo || undefined,
      });
      invoiceId = invoiceResult.invoiceId;
      invoiceUrl = invoiceResult.invoiceUrl;
    } catch (invoiceError) {
      console.error("Square invoice creation failed:", invoiceError);
      return NextResponse.json(
        { error: "Failed to create invoice. Check Square configuration." },
        { status: 500 }
      );
    }

    // Update booking status
    await updateBooking(id, {
      status: "approved",
      estimatedTotal: Number(finalTotal),
      invoiceId,
      invoiceUrl,
    });

    // Notify client (fire-and-forget)
    notifyClientBookingConfirmed({
      clientName,
      clientEmail,
      eventDate: eventDate || booking.eventDate,
      eventTime: booking.eventTime,
      eventType: eventType || booking.eventType,
      bookingId: id,
      invoiceUrl: invoiceUrl || null,
      finalTotal: Number(finalTotal),
      depositAmount: Number(depositAmount),
    }).catch(() => {});

    return NextResponse.json({ success: true, invoiceId, invoiceUrl });
  } catch (error) {
    console.error("Approve booking error:", error);
    return NextResponse.json(
      { error: "Failed to approve booking" },
      { status: 500 }
    );
  }
}
