import { NextResponse } from "next/server";
import { google } from "googleapis";
import crypto from "crypto";

export async function GET() {
  try {
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "").trim();
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${baseUrl}/api/auth/google/callback`
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
        "https://www.googleapis.com/auth/gmail.readonly",
      ],
    });

    const response = NextResponse.redirect(authUrl);
    response.cookies.set("google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to initialize Google OAuth" },
      { status: 500 }
    );
  }
}
