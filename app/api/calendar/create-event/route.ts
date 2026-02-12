import { NextRequest, NextResponse } from "next/server";
import { createBookingEvent } from "@/lib/google-calendar";
import { readPricing } from "@/lib/pricing-storage";
import { calculateEstimate } from "@/lib/pricing";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      phone,
      eventDate,
      eventTime,
      guestCount,
      eventType,
      serviceType,
      dietaryNeeds,
      notes,
      selectedAddOns,
    } = body;

    if (!name || !email || !eventType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Server-side price recalculation
    let estimate = null;
    let pricing = null;
    try {
      pricing = await readPricing();
      estimate = calculateEstimate(
        pricing,
        eventType || "",
        serviceType || "",
        guestCount || 0,
        selectedAddOns || []
      );
    } catch {
      // Pricing is optional — event still gets created without it
    }

    const result = await createBookingEvent({
      name,
      email,
      phone: phone || "",
      eventDate: eventDate || "",
      eventTime: eventTime || new Date().toISOString(),
      guestCount: guestCount || 0,
      eventType,
      serviceType: serviceType || "",
      dietaryNeeds: dietaryNeeds || "",
      notes: notes || "",
      selectedAddOns: selectedAddOns || [],
      estimate,
      pricing,
    });

    return NextResponse.json({
      success: true,
      eventId: result.eventId,
    });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
