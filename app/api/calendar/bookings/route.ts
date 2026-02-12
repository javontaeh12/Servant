import { NextRequest, NextResponse } from "next/server";
import { listUpcomingBookings } from "@/lib/google-calendar";
import { getSessionFromRequest } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await listUpcomingBookings();
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
