import { NextRequest, NextResponse } from "next/server";
import { readBusiness, writeBusiness } from "@/lib/business-storage";
import { BusinessInfo } from "@/lib/types";
import { getSessionFromRequest } from "@/lib/session";

export async function GET() {
  try {
    const config = await readBusiness();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error reading business info:", error);
    return NextResponse.json(
      { error: "Failed to load business info" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as BusinessInfo;

    if (!body.email || !body.phone || !body.socialLinks || !Array.isArray(body.aboutUs)) {
      return NextResponse.json(
        { error: "Invalid business info" },
        { status: 400 }
      );
    }

    await writeBusiness(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error writing business info:", error);
    return NextResponse.json(
      { error: "Failed to save business info" },
      { status: 500 }
    );
  }
}
