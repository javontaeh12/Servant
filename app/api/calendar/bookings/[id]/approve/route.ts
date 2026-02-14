import { NextRequest, NextResponse } from "next/server";
import { updateBookingStatus } from "@/lib/google-calendar";
import { createInvoiceForBooking } from "@/lib/square-invoice";
import { sendEmail } from "@/lib/gmail";
import { clientConfirmationEmail } from "@/lib/email-templates";
import { getSessionFromRequest } from "@/lib/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await params;

  try {
    const body = await request.json();
    const {
      finalTotal,
      depositAmount,
      clientEmail,
      clientName,
      eventType,
      eventDate,
      guestCount,
    } = body;

    if (!finalTotal || !depositAmount || !clientEmail || !clientName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create Square invoice
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

    // 2. Update calendar event status to approved
    await updateBookingStatus(eventId, "approved", {
      estimatedTotal: String(finalTotal),
      invoiceId,
      invoiceUrl,
    });

    // 3. Send confirmation email to client (non-blocking)
    try {
      const { subject, html } = clientConfirmationEmail({
        clientName,
        eventType: eventType || "Catering Event",
        eventDate: eventDate || "TBD",
        guestCount: Number(guestCount || 0),
        finalTotal: Number(finalTotal),
        depositAmount: Number(depositAmount),
        invoiceUrl,
      });
      await sendEmail(clientEmail, subject, html);
    } catch (emailError) {
      console.error("Failed to send client confirmation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      invoiceId,
      invoiceUrl,
    });
  } catch (error) {
    console.error("Approve booking error:", error);
    return NextResponse.json({ error: "Failed to approve booking" }, { status: 500 });
  }
}
