import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { getCredentials } from "@/lib/credentials";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const creds = await getCredentials();

  if (creds.google) {
    return NextResponse.json({
      connected: true,
      email: creds.google.email,
      name: creds.google.name,
      connectedAt: creds.google.connectedAt,
    });
  }

  return NextResponse.json({ connected: false });
}
