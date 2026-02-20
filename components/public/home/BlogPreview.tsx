"use client";

import type { BlogPost, SiteSettings } from "@/lib/types/app";
import { formatDate } from "@/lib/utils";

function PostCard({ post }: { post: BlogPost }) {
  return (
    <a
      href={`/blog/${post.slug}`}
      style={{ display: "flex", flexDirection: "column", textDecoration: "none", gap: "16px", transition: "opacity 0.2s" }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      <div style={{ aspectRatio: "16/9", borderRadius: "10px", overflow: "hidden", background: "#1F1F1F" }}>
        {post.cover_image
          ? <img src={post.cover_image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1F1F1F, #0D0D0D)" }} />
        }
      </div>
      <div>
        {post.category && <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A5A1A", marginBottom: "8px" }}>{post.category}</p>}
        <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 600, color: "#F0EDE8", lineHeight: 1.25, marginBottom: "8px" }}>{post.title}</h3>
        {post.excerpt && <p style={{ fontSize: "13px", color: "#706B63", lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.excerpt}</p>}
        {post.published_at && <p style={{ fontSize: "11px", color: "#4A4540", marginTop: "10px" }}>{formatDate(post.published_at)}</p>}
      </div>
    </a>
  );
}

export default function BlogPreview({ posts, settings }: { posts: BlogPost[]; settings: SiteSettings }) {
  if (!posts.length) return null;

  const heading = settings.home_blog_heading || "From the Field";

  return (
    <>
      <section className="bp-section">
        <div className="bp-header">
          <div>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C9952A", marginBottom: "10px" }}>News & Stories</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 600, color: "#F0EDE8", lineHeight: 1.1 }}>{heading}</h2>
          </div>
          <a href="/blog" style={{ fontSize: "13px", fontWeight: 600, color: "#C9952A", textDecoration: "none", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>All posts →</a>
        </div>
        <div className="bp-grid">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      </section>

      <style>{`
        .bp-section { padding: 80px clamp(24px, 6vw, 80px); max-width: 1200px; margin: 0 auto; }
        .bp-header  { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 40px; gap: 20px; flex-wrap: wrap; }
        .bp-grid    { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 36px; }
        @media (max-width: 768px) {
          .bp-section { padding: 56px clamp(20px, 5vw, 48px); }
          .bp-grid    { grid-template-columns: 1fr; gap: 32px; }
        }
        @media (max-width: 480px) {
          .bp-section { padding: 48px 20px; }
          .bp-grid    { gap: 24px; }
        }
      `}</style>
    </>
  );
}