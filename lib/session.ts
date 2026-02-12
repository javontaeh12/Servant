import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const COOKIE_NAME = "admin_session";
const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "fallback-secret-change-me"
);

export interface SessionPayload {
  email: string;
  name: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
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
  if (emails.length === 0) return true; // No restriction if not set
  return emails.includes(email.toLowerCase());
}

export { COOKIE_NAME };
