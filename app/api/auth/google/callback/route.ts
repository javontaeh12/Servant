import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { createSession, isAllowedEmail, COOKIE_NAME } from "@/lib/session";
import { saveCredentials } from "@/lib/credentials";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/login?error=no_code`
    );
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/login?error=access_denied`
      );
    }

    // Store Google credentials for Calendar/Gmail API access
    if (tokens.refresh_token) {
      await saveCredentials({
        google: {
          refreshToken: tokens.refresh_token,
          email,
          name,
          connectedAt: new Date().toISOString(),
        },
      });
    }

    // Create session JWT
    const sessionToken = await createSession({ email, name });

    // Set session cookie and redirect to admin
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin`
    );
    response.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/login?error=auth_failed`
    );
  }
}
