import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { saveCredentials } from "@/lib/credentials";

export async function GET(request: NextRequest) {
  // Must be logged in
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/login`
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get("square_oauth_state")?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin?square=error&reason=invalid_state`
    );
  }

  try {
    const baseUrl =
      process.env.SQUARE_ENVIRONMENT === "production"
        ? "https://connect.squareup.com"
        : "https://connect.squareupsandbox.com";

    const tokenResponse = await fetch(`${baseUrl}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.SQUARE_APPLICATION_ID,
        client_secret: process.env.SQUARE_APPLICATION_SECRET,
        code,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Square token exchange failed:", tokenData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin?square=error&reason=token_exchange`
      );
    }

    // Store Square credentials
    await saveCredentials({
      square: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        merchantId: tokenData.merchant_id,
        expiresAt: tokenData.expires_at,
        connectedAt: new Date().toISOString(),
      },
    });

    // Clear the state cookie
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin?square=connected`
    );
    response.cookies.set("square_oauth_state", "", {
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Square OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin?square=error`
    );
  }
}
