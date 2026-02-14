import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const COOKIE_NAME = "admin_session";
const SESSION_VERSION = process.env.SESSION_VERSION || "1";

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is required");
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  email: string;
  name: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload, v: SESSION_VERSION })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.v !== SESSION_VERSION) {
      return null;
    }
    return { email: payload.email as string, name: payload.name as string };
  } catch {
    return null;
  }
}

// For use in API routes (receives NextRequest)
export async function getSessionFromRequest(
  request: NextRequest
): Promise<SessionPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

// For use in server components / server actions
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function isAllowedEmail(email: string): boolean {
  const allowed = process.env.ALLOWED_ADMIN_EMAILS || "";
  const emails = allowed
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (emails.length === 0) return false; // Default deny when not configured
  return emails.includes(email.toLowerCase());
}

export { COOKIE_NAME };
