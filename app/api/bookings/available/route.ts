import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/bookings";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ slots: [] });
  }

  const slots = await getAvailableSlots(date);
  return NextResponse.json({ slots });
}
