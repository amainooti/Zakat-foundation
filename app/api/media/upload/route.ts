import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
    }

    const supabase  = createServiceClient();
    const ext       = file.name.split(".").pop();
    const filename  = `misc/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer    = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("zfa-media")
      .upload(filename, buffer, { contentType: file.type, upsert: false });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("zfa-media")
      .getPublicUrl(filename);

    // Record in media table
    await supabase.from("media").insert({
      filename:     file.name,
      storage_path: filename,
      url:          publicUrl,
      mime_type:    file.type,
      size_bytes:   file.size,
      folder:       "misc",
    });

    return NextResponse.json({ url: publicUrl, path: filename });
  } catch (err: unknown) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}