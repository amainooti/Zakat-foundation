import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import MediaClient from "@/components/admin/MediaClient";

export const metadata = { title: "Media Library — Admin" };
export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const supabase = await createClient();
  await supabase.auth.getUser();

  const service = createServiceClient();

  // List all files from storage bucket
  const { data: files } = await service.storage
    .from("zfa-media")
    .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });

  // Also pull nested folders (campaigns/, blog/, site/, misc/)
  const folders = ["campaigns", "blog", "site", "misc"];
  const folderFiles = await Promise.all(
    folders.map(async (folder) => {
      const { data } = await service.storage
        .from("zfa-media")
        .list(folder, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
      return (data ?? []).map((f) => ({ ...f, folder }));
    })
  );

  const allFiles = [
    ...(files ?? []).filter((f) => f.name !== ".emptyFolderPlaceholder").map((f) => ({ ...f, folder: "" })),
    ...folderFiles.flat().filter((f) => f.name !== ".emptyFolderPlaceholder"),
  ];

  // Build public URLs
  const filesWithUrls = allFiles.map((f) => {
    const path = f.folder ? `${f.folder}/${f.name}` : f.name;
    const { data: { publicUrl } } = service.storage.from("zfa-media").getPublicUrl(path);
    return { ...f, path, publicUrl };
  });

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh" }}>
      <div style={{ padding: "24px 32px", borderBottom: "1px solid #1F1F1F", display: "flex", alignItems: "baseline", gap: "12px" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", fontWeight: 600, color: "#F0EDE8" }}>
          Media Library
        </h1>
        <p style={{ fontSize: "13px", color: "#4A4540" }}>
          {filesWithUrls.length} file{filesWithUrls.length !== 1 ? "s" : ""}
        </p>
      </div>

      <MediaClient initialFiles={filesWithUrls} />
    </div>
  );
}