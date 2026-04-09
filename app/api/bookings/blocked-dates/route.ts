import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { getBlockedDates, blockDate, unblockDate } from "@/lib/bookings";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dates = await getBlockedDates();
  return NextResponse.json(dates);
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date, reason } = await request.json();
  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  await blockDate(date, reason, session.email);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date } = await request.json();
  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  await unblockDate(date);
  return NextResponse.json({ success: true });
}
