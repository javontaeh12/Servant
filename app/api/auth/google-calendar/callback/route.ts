import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getSessionFromRequest } from "@/lib/session";
import { saveCredentials } from "@/lib/credentials";

export async function GET(request: NextRequest) {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "").trim();

  // Must be logged in as admin
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.redirect(`${baseUrl}/login`);
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get("gcal_oauth_state")?.value;

  // CSRF validation
  if (!state || state !== storedState) {
    return NextResponse.redirect(`${baseUrl}/admin?calendar=error`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/admin?calendar=error`);
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${baseUrl}/api/auth/google-calendar/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    if (!tokens.refresh_token) {
      console.error("No refresh token received — user may need to revoke and reconnect");
      return NextResponse.redirect(`${baseUrl}/admin?calendar=no_refresh`);
    }

    // Get user info for display
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    await saveCredentials({
      google: {
        refreshToken: tokens.refresh_token,
        email: userInfo.email || "",
        name: userInfo.name || "",
        connectedAt: new Date().toISOString(),
      },
    });

    const response = NextResponse.redirect(`${baseUrl}/admin?calendar=connected`);
    response.cookies.set("gcal_oauth_state", "", { maxAge: 0, path: "/" });
    return response;
  } catch (error) {
    console.error("Google Calendar OAuth callback error:", error);
    return NextResponse.redirect(`${baseUrl}/admin?calendar=error`);
  }
}
