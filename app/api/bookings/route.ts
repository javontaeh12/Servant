import { NextRequest, NextResponse } from "next/server";
import { getBookings, createBooking } from "@/lib/bookings";
import { getSessionFromRequest } from "@/lib/session";
import { readPricing } from "@/lib/pricing-storage";
import { readMenu } from "@/lib/menu-storage";
import { calculateEstimate } from "@/lib/pricing";
import { MealSelection } from "@/lib/types";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await getBookings();
  bookings.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json(bookings);
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const rateLimitResult = checkRateLimit(`create-booking:${ip}`, 5, 60000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfterSeconds),
          },
        }
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

    // Validate mealSelection
    let validatedMealSelection: MealSelection | undefined;
    if (mealSelection != null) {
      if (
        typeof mealSelection !== "object" ||
        (mealSelection.type !== "preset" && mealSelection.type !== "custom")
      ) {
        return NextResponse.json(
          { success: false, error: "Invalid meal selection" },
          { status: 400 }
        );
      }
      validatedMealSelection = mealSelection as MealSelection;
    }

    // Server-side price calculation
    let estimatedTotal: number | null = null;
    let mealInfoJson: string | null = null;
    try {
      const pricing = await readPricing();
      const menuConfig = await readMenu();
      const estimate = calculateEstimate(
        pricing,
        eventType || "",
        serviceType || "",
        guestCount || 0,
        selectedAddOns || [],
        validatedMealSelection,
        menuConfig || undefined
      );
      estimatedTotal = estimate?.total ?? null;

      // Build meal info JSON
      if (validatedMealSelection && menuConfig) {
        const ms = validatedMealSelection;
        if (ms.type === "preset" && ms.presetMealId) {
          const preset = menuConfig.presetMeals.find(
            (p) => p.id === ms.presetMealId
          );
          if (preset) {
            const items = preset.itemIds
              .map((id) => {
                const item = menuConfig.items.find((i) => i.id === id);
                return item
                  ? { name: item.name, pricePerPerson: item.pricePerPerson }
                  : null;
              })
              .filter(Boolean);
            mealInfoJson = JSON.stringify({
              type: "preset",
              presetName: preset.name,
              pricePerPerson: preset.pricePerPerson,
              items,
            });
          }
        } else if (ms.type === "custom" && ms.selectedItemIds?.length) {
          const items = ms.selectedItemIds
            .map((id: string) => {
              const item = menuConfig.items.find((i) => i.id === id);
              return item
                ? { name: item.name, pricePerPerson: item.pricePerPerson }
                : null;
            })
            .filter(Boolean);
          mealInfoJson = JSON.stringify({ type: "custom", items });
        }
      }
    } catch {
      // Pricing is optional
    }

    const booking = await createBooking({
      clientName: name,
      clientEmail: email,
      clientPhone: phone || "",
      eventDate: eventDate || "",
      eventTime: eventTime || "",
      guestCount: guestCount || 0,
      eventType: eventType || "",
      serviceStyle: serviceType || "",
      dietaryNeeds: dietaryNeeds || "",
      notes: notes || "",
      estimatedTotal,
      mealInfo: mealInfoJson,
    });

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
