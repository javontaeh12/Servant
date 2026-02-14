import { NextRequest, NextResponse } from "next/server";
import { updateBookingStatus } from "@/lib/google-calendar";
import { getSessionFromRequest } from "@/lib/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await params;

  try {
    await updateBookingStatus(eventId, "rejected");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reject booking error:", error);
    return NextResponse.json({ error: "Failed to reject booking" }, { status: 500 });
  }
}
