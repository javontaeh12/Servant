import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { removeGoogleCredentials } from "@/lib/credentials";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await removeGoogleCredentials();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to disconnect Google Calendar:", error);
    return NextResponse.json(
      { error: "Failed to disconnect" },
      { status: 500 }
    );
  }
}
