import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { createSession, isAllowedEmail, COOKIE_NAME } from "@/lib/session";

export async function GET(request: NextRequest) {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "").trim();
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get("google_oauth_state")?.value;

  // CSRF validation
  if (!state || state !== storedState) {
    return NextResponse.redirect(
      `${baseUrl}/login?error=invalid_state`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}/login?error=no_code`
    );
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${baseUrl}/api/auth/google/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user profile
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    const email = userInfo.email || "";
    const name = userInfo.name || email.split("@")[0];

    // Check if email is allowed
    if (!isAllowedEmail(email)) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=access_denied`
      );
    }

    // Create session JWT
    const sessionToken = await createSession({ email, name });

    // Set session cookie and redirect to admin
    const response = NextResponse.redirect(
      `${baseUrl}/admin`
    );
    response.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    response.cookies.set("google_oauth_state", "", { maxAge: 0, path: "/" });

    return response;
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      `${baseUrl}/login?error=auth_failed`
    );
  }
}
