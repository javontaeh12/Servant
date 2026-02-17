import { NextRequest, NextResponse } from "next/server";
import { put, del, list } from "@vercel/blob";
import { getSessionFromRequest } from "@/lib/session";
import { readBusiness, writeBusiness } from "@/lib/business-storage";

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

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
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

    // Delete old about images from Blob
    const { blobs } = await list({ prefix: "uploads/about-image" });
    for (const blob of blobs) {
      await del(blob.url);
    }

    const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const filename = `about-image.${ext}`;
    const blobPath = `uploads/${filename}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const blob = await put(blobPath, buffer, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    // Update business config with new image URL
    const business = await readBusiness();
    business.aboutImage = blob.url;
    await writeBusiness(business);

    return NextResponse.json({ success: true, path: blob.url });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
