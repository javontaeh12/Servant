import { NextRequest, NextResponse } from "next/server";
import { createBookingEvent } from "@/lib/google-calendar";
import { readPricing } from "@/lib/pricing-storage";
import { readMenu } from "@/lib/menu-storage";
import { calculateEstimate } from "@/lib/pricing";
import { MealSelection } from "@/lib/types";

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

    // Build meal description for calendar event
    let mealDescription = "";
    if (mealSelection && menuConfig) {
      const ms = mealSelection as MealSelection;
      if (ms.type === "preset" && ms.presetMealId) {
        const preset = menuConfig.presetMeals.find(
          (p) => p.id === ms.presetMealId
        );
        if (preset) {
          const items = preset.itemIds
            .map((id) => menuConfig!.items.find((i) => i.id === id)?.name)
            .filter(Boolean);
          mealDescription = `🍽️ Meal: ${preset.name} ($${preset.pricePerPerson}/person)\n   Items: ${items.join(", ")}`;
        }
      } else if (ms.type === "custom" && ms.selectedItemIds?.length) {
        const items = ms.selectedItemIds
          .map((id) => {
            const item = menuConfig!.items.find((i) => i.id === id);
            return item ? `${item.name} ($${item.pricePerPerson})` : null;
          })
          .filter(Boolean);
        mealDescription = `🍽️ Custom Menu:\n   ${items.join("\n   ")}`;
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
