import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.CRON_SECRET;
  if (!token) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://iasfcatering.com";
  const url = `${baseUrl}/api/bookings/calendar.ics?token=${token}`;

  return NextResponse.json({ url });
}
