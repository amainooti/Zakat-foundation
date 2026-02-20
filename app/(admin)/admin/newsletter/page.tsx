import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import NewsletterClient from "@/components/admin/NewsletterClient";

export const metadata = { title: "Newsletter — Admin" };
export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  // Auth check with regular client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Data fetch with service client — bypasses RLS on newsletter_subscribers
  const service = createServiceClient();

  const { data: subscribers, count } = await service
    .from("newsletter_subscribers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const activeCount = subscribers?.filter((s) => s.subscribed).length ?? 0;

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh" }}>
      <div style={{ padding: "24px 32px", borderBottom: "1px solid #1F1F1F", display: "flex", alignItems: "baseline", gap: "12px" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", fontWeight: 600, color: "#F0EDE8" }}>
          Newsletter
        </h1>
        <p style={{ fontSize: "13px", color: "#4A4540" }}>
          {activeCount.toLocaleString()} active subscriber{activeCount !== 1 ? "s" : ""}
        </p>
      </div>

      <NewsletterClient subscribers={subscribers ?? []} totalCount={count ?? 0} />
    </div>
  );
}