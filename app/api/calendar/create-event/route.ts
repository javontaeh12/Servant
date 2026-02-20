import { NextRequest, NextResponse } from "next/server";
import { createBookingEvent } from "@/lib/google-calendar";
import { readPricing } from "@/lib/pricing-storage";
import { readMenu } from "@/lib/menu-storage";
import { calculateEstimate } from "@/lib/pricing";
import { MealSelection } from "@/lib/types";
import { sendEmail } from "@/lib/gmail";
import { adminNewBookingEmail } from "@/lib/email-templates";
import { readBusiness } from "@/lib/business-storage";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per minute per IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (!checkRateLimit(`create-event:${ip}`, 5, 60000)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

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
      mealSelection,
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
    let menuConfig = null;
    try {
      pricing = await readPricing();
      menuConfig = await readMenu();
      estimate = calculateEstimate(
        pricing,
        eventType || "",
        serviceType || "",
        guestCount || 0,
        selectedAddOns || [],
        (mealSelection as MealSelection) || undefined,
        menuConfig || undefined
      );
    } catch {
      // Pricing is optional — event still gets created without it
    }

    // Build meal description for calendar event + structured mealInfo JSON
    let mealDescription = "";
    let mealInfoJson = "";
    if (mealSelection && menuConfig) {
      const ms = mealSelection as MealSelection;
      if (ms.type === "preset" && ms.presetMealId) {
        const preset = menuConfig.presetMeals.find(
          (p) => p.id === ms.presetMealId
        );
        if (preset) {
          const items = preset.itemIds
            .map((id) => {
              const item = menuConfig!.items.find((i) => i.id === id);
              return item ? { name: item.name, pricePerPerson: item.pricePerPerson } : null;
            })
            .filter(Boolean);
          const itemNames = items.map((i) => i!.name);
          mealDescription = `🍽️ Meal: ${preset.name} ($${preset.pricePerPerson}/person)\n   Items: ${itemNames.join(", ")}`;
          mealInfoJson = JSON.stringify({
            type: "preset",
            presetName: preset.name,
            pricePerPerson: preset.pricePerPerson,
            items: items.map((i) => ({ name: i!.name, pricePerPerson: i!.pricePerPerson })),
          });
        }
      } else if (ms.type === "custom" && ms.selectedItemIds?.length) {
        const items = ms.selectedItemIds
          .map((id) => {
            const item = menuConfig!.items.find((i) => i.id === id);
            return item ? { name: item.name, pricePerPerson: item.pricePerPerson } : null;
          })
          .filter(Boolean);
        mealDescription = `🍽️ Custom Menu:\n   ${items.map((i) => `${i!.name} ($${i!.pricePerPerson})`).join("\n   ")}`;
        mealInfoJson = JSON.stringify({
          type: "custom",
          items: items.map((i) => ({ name: i!.name, pricePerPerson: i!.pricePerPerson })),
        });
      }
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
      notes: notes
        ? mealDescription
          ? `${notes}\n\n${mealDescription}`
          : notes
        : mealDescription || "",
      selectedAddOns: selectedAddOns || [],
      estimate,
      pricing,
      mealInfo: mealInfoJson || undefined,
    });

    // Send admin notification email (non-blocking)
    try {
      const business = await readBusiness();
      const adminEmail = business.email || process.env.ALLOWED_ADMIN_EMAILS?.split(",")[0]?.trim();
      if (adminEmail) {
        const { subject, html } = adminNewBookingEmail({
          clientName: name,
          clientEmail: email,
          clientPhone: phone || "N/A",
          eventType,
          eventDate: eventDate || "TBD",
          guestCount: Number(guestCount || 0),
          estimatedTotal: estimate?.total ?? 0,
        });
        await sendEmail(adminEmail, subject, html);
      }
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
      // Don't fail the booking if email fails
    }

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
