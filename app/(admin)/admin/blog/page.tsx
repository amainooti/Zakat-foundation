import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { BlogPost } from "@/lib/types/app";

export default async function BlogAdminPage() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) console.error("Failed to fetch posts:", error.message);

  return (
    <div>
      <style>{`.admin-table-row:hover { background: #1A1A1A; }`}</style>

      <div className="admin-page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <h1 className="admin-page-title">Blog</h1>
          <p className="admin-page-subtitle">{posts?.length ?? 0} total posts</p>
        </div>
        <Link
          href="/admin/blog/new"
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", background: "#C9952A", color: "#0D0D0D", fontSize: "13px", fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}
        >
          <Plus size={15} /> New Post
        </Link>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2A2A2A" }}>
        {!posts?.length ? (
          <div className="py-20 text-center" style={{ background: "#161616" }}>
            <p style={{ fontSize: "13px", color: "#706B63" }}>
              No posts yet.{" "}
              <Link href="/admin/blog/new" style={{ color: "#C9952A" }}>Write your first post →</Link>
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#161616" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #2A2A2A" }}>
                {["Post", "Category", "Status", "Published", "Created"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#706B63", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
                <th style={{ padding: "10px 16px", width: 60 }} />
              </tr>
            </thead>
            <tbody>
              {posts.map((post: BlogPost, i) => (
                <tr
                  key={post.id}
                  className="admin-table-row"
                  style={{ borderBottom: i < posts.length - 1 ? "1px solid #1F1F1F" : "none", transition: "background 0.15s" }}
                >
                  <td style={{ padding: "14px 16px", maxWidth: 320 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {post.cover_image && (
                        <img src={post.cover_image} alt="" style={{ width: 34, height: 34, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                      )}
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "13px", fontWeight: 500, color: "#F0EDE8", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {post.title}
                        </p>
                        <p style={{ fontSize: "11px", color: "#706B63", fontFamily: "monospace" }}>/{post.slug}</p>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: "12px", color: "#B8B3AC" }}>{post.category ?? "—"}</span>
                  </td>

                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 8px", borderRadius: 99, fontSize: "11px", fontWeight: 500,
                      background: post.published ? "rgba(42,122,74,0.12)" : "rgba(112,107,99,0.12)",
                      color: post.published ? "#4AAF7A" : "#706B63",
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>

                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "12px", color: "#706B63" }}>
                      {post.published_at ? formatDate(post.published_at, { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </span>
                  </td>

                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "12px", color: "#706B63" }}>
                      {formatDate(post.created_at, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </td>

                  <td style={{ padding: "14px 16px" }}>
                    <Link href={`/admin/blog/${post.id}`} style={{ fontSize: "12px", color: "#706B63", textDecoration: "none", padding: "4px 10px", borderRadius: "6px", border: "1px solid #2A2A2A" }}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}