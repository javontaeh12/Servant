import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  // Must be logged in first
  const appBaseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "").trim();
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.redirect(
      `${appBaseUrl}/login`
    );
  }

  const applicationId = process.env.SQUARE_APPLICATION_ID;
  if (!applicationId) {
    return NextResponse.json(
      { error: "Square Application ID not configured" },
      { status: 500 }
    );
  }

  const state = crypto.randomBytes(16).toString("hex");
  const baseUrl =
    process.env.SQUARE_ENVIRONMENT === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

  const params = new URLSearchParams({
    client_id: applicationId,
    scope: "PAYMENTS_WRITE PAYMENTS_READ ORDERS_WRITE ORDERS_READ MERCHANT_PROFILE_READ INVOICES_WRITE INVOICES_READ CUSTOMERS_WRITE CUSTOMERS_READ",
    session: "false",
    state,
  });

  // Store state in cookie for CSRF validation
  const response = NextResponse.redirect(
    `${baseUrl}/oauth2/authorize?${params.toString()}`
  );
  response.cookies.set("square_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
