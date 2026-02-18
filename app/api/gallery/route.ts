import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

    // Purge cached homepage and gallery page so deleted/new images show immediately
    revalidatePath("/");
    revalidatePath("/gallery");

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error writing gallery:", message, error);
    return NextResponse.json(
      { error: `Failed to save gallery: ${message}` },
      { status: 500 }
    );
  }
}
