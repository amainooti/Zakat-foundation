// import { redirect } from "next/navigation";
// import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ── DEV BYPASS — re-enable before deploying ──
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) redirect("/admin/login");

  return (
    <div className="admin-layout">
      <AdminSidebar userEmail="dev@localhost" />
      <main className="admin-main">{children}</main>
    </div>
  );
}