import { NextRequest, NextResponse } from "next/server";
import { createSession, isAllowedEmail, COOKIE_NAME } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isAllowedEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "This email is not authorized." },
        { status: 401 }
      );
    }

    const sessionToken = await createSession({
      email: normalizedEmail,
      name: normalizedEmail.split("@")[0],
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
