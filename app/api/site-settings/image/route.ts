import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { getSessionFromRequest } from "@/lib/session";
import { readSiteSettings, writeSiteSettings } from "@/lib/site-settings-storage";

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
      return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, and WebP images are allowed" }, { status: 400 });
    }

    // Delete old featured image if exists
    const settings = await readSiteSettings();
    if (settings.featuredImage) {
      try {
        await del(settings.featuredImage);
      } catch {}
    }

    const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const filename = `featured/${Date.now()}.${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    // Save to settings
    await writeSiteSettings({ ...settings, featuredImage: blob.url, featuredImageActive: true });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error("Error uploading featured image:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await readSiteSettings();
    if (settings.featuredImage) {
      try {
        await del(settings.featuredImage);
      } catch {}
    }

    await writeSiteSettings({ ...settings, featuredImage: "", featuredImageActive: false });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting featured image:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
