import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { getCredentials } from "@/lib/credentials";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const creds = await getCredentials();

  if (creds.square) {
    return NextResponse.json({
      connected: true,
      merchantId: creds.square.merchantId || null,
      connectedAt: creds.square.connectedAt,
      connectedBy: creds.square.connectedBy || null,
    });
  }

  return NextResponse.json({ connected: false });
}
