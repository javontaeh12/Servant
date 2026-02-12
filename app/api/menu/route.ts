import { NextRequest, NextResponse } from "next/server";
import { readMenu, writeMenu } from "@/lib/menu-storage";
import { MenuConfig } from "@/lib/types";
import { getSessionFromRequest } from "@/lib/session";

export async function GET() {
  try {
    const config = await readMenu();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error reading menu:", error);
    return NextResponse.json(
      { error: "Failed to load menu" },
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

    const body = (await request.json()) as MenuConfig;

    if (!body.categories || !body.items || !body.presetMeals) {
      return NextResponse.json(
        { error: "Invalid menu config" },
        { status: 400 }
      );
    }

    await writeMenu(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error writing menu:", error);
    return NextResponse.json(
      { error: "Failed to save menu" },
      { status: 500 }
    );
  }
}
