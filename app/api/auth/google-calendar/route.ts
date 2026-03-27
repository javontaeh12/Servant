import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import crypto from "crypto";
import { getSessionFromRequest } from "@/lib/session";

export async function GET(request: NextRequest) {
  // Must be logged in as admin
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "").trim();
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${baseUrl}/api/auth/google-calendar/callback`
    );

    const state = crypto.randomBytes(16).toString("hex");

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      state,
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/gmail.send",
      ],
    });

    const response = NextResponse.redirect(authUrl);
    response.cookies.set("gcal_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.redirect(
      new URL("/admin?calendar=error", request.url)
    );
  }
}
