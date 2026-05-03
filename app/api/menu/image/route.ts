import { NextRequest, NextResponse } from "next/server";
import { uploadObject, deleteObject, getPublicUrl, extractStoragePath } from "@/lib/r2";
import { getSessionFromRequest } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image must be under 5MB" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and WebP images are allowed" },
        { status: 400 }
      );
    }

    const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const filePath = `meals/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await uploadObject(filePath, buffer, file.type);

    return NextResponse.json({ success: true, url: getPublicUrl(filePath) });
  } catch (error) {
    console.error("Error uploading meal image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    const storagePath = extractStoragePath(url);
    if (storagePath) {
      await deleteObject(storagePath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meal image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
