import { NextRequest, NextResponse } from "next/server";
import { readPricing, writePricing } from "@/lib/pricing-storage";
import { PricingConfig } from "@/lib/types";
import { getSessionFromRequest } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await readPricing();
    return NextResponse.json(config, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
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

    if (!body.eventTypes || !body.serviceStyles || !body.addOns) {
      return NextResponse.json(
        { error: "Invalid pricing config" },
        { status: 400 }
      );
    }

    // Normalize empty strings to 0 before saving
    const toNum = (v: unknown): number => {
      if (v === "" || v === undefined || v === null) return 0;
      const n = typeof v === "string" ? parseFloat(v) : Number(v);
      return isNaN(n) ? 0 : n;
    };

    const normalized: PricingConfig = {
      eventTypes: Object.fromEntries(
        Object.entries(body.eventTypes).map(([k, v]) => [k, { ...v, price: toNum(v.price) }])
      ),
      serviceStyles: Object.fromEntries(
        Object.entries(body.serviceStyles).map(([k, v]) => [k, { ...v, price: toNum(v.price) }])
      ),
      perPersonRate: toNum(body.perPersonRate),
      addOns: body.addOns.map((a) => ({ ...a, price: toNum(a.price) })),
    };

    await writePricing(normalized);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error writing pricing:", error);
    return NextResponse.json(
      { error: "Failed to save pricing" },
      { status: 500 }
    );
  }
}
