import { NextRequest, NextResponse } from "next/server";
import { supabase, PUBLIC_BUCKET, getPublicUrl } from "@/lib/supabase";
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

    // Delete old about images
    const { data: oldFiles } = await supabase.storage
      .from(PUBLIC_BUCKET)
      .list("uploads", { search: "about-image" });
    if (oldFiles && oldFiles.length > 0) {
      await supabase.storage
        .from(PUBLIC_BUCKET)
        .remove(oldFiles.map((f) => `uploads/${f.name}`));
    }

    const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const filePath = `uploads/about-image.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage.from(PUBLIC_BUCKET).upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

    if (error) throw error;

    const publicUrl = getPublicUrl(filePath);

    // Update business config with new image URL
    const business = await readBusiness();
    business.aboutImage = publicUrl;
    await writeBusiness(business);

    return NextResponse.json({ success: true, path: publicUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
