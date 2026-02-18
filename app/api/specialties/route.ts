import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readSpecialtyImages, writeSpecialtyImages, SpecialtyImages } from "@/lib/specialty-storage";
import { getSessionFromRequest } from "@/lib/session";

export async function GET() {
  try {
    const images = await readSpecialtyImages();
    return NextResponse.json(images);
  } catch (error) {
    console.error("Error reading specialty images:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as SpecialtyImages;
    await writeSpecialtyImages(body);

    revalidatePath("/");
    revalidatePath("/services");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving specialty images:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
