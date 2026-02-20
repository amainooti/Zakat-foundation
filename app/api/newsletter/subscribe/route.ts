import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  try {
    const { email, name, source = "footer" } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        { email, name: name ?? null, source, subscribed: true },
        { onConflict: "email", ignoreDuplicates: false }
      );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}