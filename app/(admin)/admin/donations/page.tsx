import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import DonationsClient from "@/components/admin/DonationsClient";

export const metadata = { title: "Donations — Admin" };
export const dynamic = "force-dynamic";

export default async function DonationsPage() {
  const supabase = await createClient();
  await supabase.auth.getUser(); // auth check

  const service = createServiceClient();

  const { data: donations, count } = await service
    .from("donations")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Aggregate stats
  const completed = donations?.filter((d) => d.status === "completed") ?? [];
  const totalRaised   = completed.reduce((sum, d) => sum + (d.amount ?? 0), 0);
  const recurringCount = completed.filter((d) => d.is_recurring).length;

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh" }}>
      <div style={{ padding: "24px 32px", borderBottom: "1px solid #1F1F1F", display: "flex", alignItems: "baseline", gap: "12px" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", fontWeight: 600, color: "#F0EDE8" }}>
          Donations
        </h1>
        <p style={{ fontSize: "13px", color: "#4A4540" }}>
          {(count ?? 0).toLocaleString()} total records
        </p>
      </div>

      <DonationsClient
        donations={donations ?? []}
        totalRaised={totalRaised}
        recurringCount={recurringCount}
        totalCount={count ?? 0}
      />
    </div>
  );
}