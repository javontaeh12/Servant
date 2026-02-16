import { NextRequest, NextResponse } from "next/server";
import { readGallery, writeGallery } from "@/lib/gallery-storage";
import { GalleryConfig } from "@/lib/types";
import { getSessionFromRequest } from "@/lib/session";

export async function GET() {
  try {
    const config = await readGallery();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error reading gallery:", error);
    return NextResponse.json(
      { error: "Failed to load gallery" },
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

    const body = (await request.json()) as GalleryConfig;

    if (!Array.isArray(body.images)) {
      return NextResponse.json(
        { error: "Invalid gallery data" },
        { status: 400 }
      );
    }

    if (body.images.length > 20) {
      return NextResponse.json(
        { error: "Maximum of 20 images allowed" },
        { status: 400 }
      );
    }

    await writeGallery(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error writing gallery:", error);
    return NextResponse.json(
      { error: "Failed to save gallery" },
      { status: 500 }
    );
  }
}
