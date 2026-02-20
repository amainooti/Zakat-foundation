"use client"
import type { BlogPost, SiteSettings } from "@/lib/types/app";
import { formatDate } from "@/lib/utils";

function PostCard({ post }: { post: BlogPost }) {
  return (
    <a
      href={`/blog/${post.slug}`}
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        gap: "16px",
        transition: "opacity 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {/* Thumbnail */}
      <div style={{
        aspectRatio: "16/9",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#1F1F1F",
      }}>
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1F1F1F, #0D0D0D)" }} />
        )}
      </div>

      {/* Meta */}
      <div>
        {post.category && (
          <p style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "#7A5A1A", marginBottom: "8px",
          }}>
            {post.category}
          </p>
        )}
        <h3 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "20px", fontWeight: 600,
          color: "#F0EDE8", lineHeight: 1.25, marginBottom: "8px",
        }}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p style={{
            fontSize: "13px", color: "#706B63", lineHeight: 1.65,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {post.excerpt}
          </p>
        )}
        {post.published_at && (
          <p style={{ fontSize: "11px", color: "#4A4540", marginTop: "10px" }}>
            {formatDate(post.published_at)}
          </p>
        )}
      </div>
    </a>
  );
}

export default function BlogPreview({
  posts,
  settings,
}: {
  posts: BlogPost[];
  settings: SiteSettings;
}) {
  if (!posts.length) return null;

  return (
    <section style={{ padding: "96px clamp(24px, 6vw, 80px)", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Heading */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "48px", gap: "24px", flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C9952A", marginBottom: "10px" }}>
            News & Stories
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 600, color: "#F0EDE8", lineHeight: 1.1,
          }}>
            From the Field
          </h2>
        </div>
        <a
          href="/blog"
          style={{
            fontSize: "13px", fontWeight: 600, color: "#C9952A",
            textDecoration: "none", letterSpacing: "0.06em", whiteSpace: "nowrap",
          }}
        >
          All posts →
        </a>
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "40px",
      }}>
        {posts.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </section>
  );
}