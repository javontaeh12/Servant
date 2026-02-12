import { NextRequest, NextResponse } from "next/server";
import { readPricing, writePricing } from "@/lib/pricing-storage";
import { PricingConfig } from "@/lib/types";
import { getSessionFromRequest } from "@/lib/session";

export async function GET() {
  try {
    const config = await readPricing();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error reading pricing:", error);
    return NextResponse.json(
      { error: "Failed to load pricing" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as PricingConfig;

    if (!body.eventTypes || !body.serviceStyles || !body.addOns || typeof body.perPersonRate !== "number") {
      return NextResponse.json(
        { error: "Invalid pricing config" },
        { status: 400 }
      );
    }

    await writePricing(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error writing pricing:", error);
    return NextResponse.json(
      { error: "Failed to save pricing" },
      { status: 500 }
    );
  }
}
