import { NextRequest, NextResponse } from "next/server";
import { listUpcomingBookings } from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  try {
    const password = request.headers.get("x-admin-password");
    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
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
