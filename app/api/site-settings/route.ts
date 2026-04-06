import { NextRequest, NextResponse } from "next/server";
import { readSiteSettings, writeSiteSettings } from "@/lib/site-settings-storage";
import { getSessionFromRequest } from "@/lib/session";

export async function GET() {
  const settings = await readSiteSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const current = await readSiteSettings();
    const updated = { ...current, ...body };
    await writeSiteSettings(updated);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
