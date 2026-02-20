import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/lib/types/app";

export const revalidate = 3600;

export const metadata = {
  title: "Blog — Zakat Foundation of America",
};

export default async function BlogPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image, published_at, category")
    .eq("published", true)
    .order("published_at", { ascending: false });

  const heading    = "News & Stories";
  const subheading = null;
  const emptyText  = "No posts yet. Check back soon.";

  const allPosts = (posts ?? []) as BlogPost[];

  // Separate featured (first post) from the rest
  const [featured, ...rest] = allPosts;

  return (
    <>
      <div style={{ background: "#0D0D0D", minHeight: "100vh" }}>

        {/* Hero */}
        <div className="blog-hero">
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C9952A", marginBottom: "12px" }}>
            From the Field
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 600, color: "#F0EDE8",
            lineHeight: 1.1, marginBottom: "14px",
          }}>
            {heading}
          </h1>
          {subheading && (
            <p style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "#706B63", maxWidth: "520px", lineHeight: 1.7 }}>
              {subheading}
            </p>
          )}
        </div>

        <div className="blog-body">
          {allPosts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontSize: "15px", color: "#4A4540" }}>{emptyText}</p>
            </div>
          ) : (
            <>
              {/* Featured — first post large */}
              {featured && (
                <a href={`/blog/${featured.slug}`} className="blog-featured">
                  <div className="blog-featured-img">
                    {featured.cover_image ? (
                      <img src={featured.cover_image} alt={featured.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }} className="blog-featured-img-inner" />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1F1F1F, #0D0D0D)" }} />
                    )}
                  </div>
                  <div className="blog-featured-body">
                    {featured.category && (
                      <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C9952A", marginBottom: "12px" }}>
                        {featured.category}
                      </p>
                    )}
                    <h2 style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: "clamp(24px, 3vw, 36px)",
                      fontWeight: 600, color: "#F0EDE8",
                      lineHeight: 1.2, marginBottom: "14px",
                    }}>
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p style={{ fontSize: "15px", color: "#706B63", lineHeight: 1.7, marginBottom: "20px" }}>
                        {featured.excerpt}
                      </p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      {featured.published_at && (
                        <p style={{ fontSize: "12px", color: "#4A4540" }}>{formatDate(featured.published_at)}</p>
                      )}
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#C9952A", letterSpacing: "0.04em" }}>
                        Read more →
                      </span>
                    </div>
                  </div>
                </a>
              )}

              {/* Rest — grid */}
              {rest.length > 0 && (
                <div className="blog-grid">
                  {rest.map((post) => (
                    <a key={post.id} href={`/blog/${post.slug}`} className="blog-card">
                      <div style={{ aspectRatio: "16/9", borderRadius: "10px", overflow: "hidden", background: "#1F1F1F", marginBottom: "16px" }}>
                        {post.cover_image ? (
                          <img src={post.cover_image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1F1F1F, #0D0D0D)" }} />
                        )}
                      </div>
                      {post.category && (
                        <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A5A1A", marginBottom: "8px" }}>
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
                        <p style={{ fontSize: "13px", color: "#706B63", lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "12px" }}>
                          {post.excerpt}
                        </p>
                      )}
                      {post.published_at && (
                        <p style={{ fontSize: "11px", color: "#4A4540" }}>{formatDate(post.published_at)}</p>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .blog-hero {
          background: linear-gradient(to bottom, #161616, #0D0D0D);
          border-bottom: 1px solid #1F1F1F;
          padding: 72px clamp(24px, 6vw, 80px) 56px;
        }
        .blog-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: 56px clamp(24px, 6vw, 80px) 80px;
        }
        /* Featured post */
        .blog-featured {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
          text-decoration: none;
          padding-bottom: 56px;
          margin-bottom: 56px;
          border-bottom: 1px solid #1F1F1F;
        }
        .blog-featured:hover .blog-featured-img-inner {
          transform: scale(1.03);
        }
        .blog-featured-img {
          aspect-ratio: 4/3;
          border-radius: 12px;
          overflow: hidden;
          background: #1F1F1F;
        }
        .blog-featured-body { /* no extra styles needed */ }
        /* Grid */
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 40px;
        }
        .blog-card {
          text-decoration: none;
          display: block;
          transition: opacity 0.2s;
        }
        .blog-card:hover { opacity: 0.8; }

        @media (max-width: 900px) {
          .blog-featured {
            grid-template-columns: 1fr;
            gap: 28px;
          }
        }
        @media (max-width: 768px) {
          .blog-hero { padding: 48px clamp(20px, 5vw, 48px) 40px; }
          .blog-body { padding: 40px clamp(20px, 5vw, 48px) 64px; }
          .blog-grid  { gap: 28px; }
        }
        @media (max-width: 480px) {
          .blog-hero { padding: 40px 20px 32px; }
          .blog-body { padding: 32px 20px 48px; }
          .blog-grid { grid-template-columns: 1fr; gap: 32px; }
        }
      `}</style>
    </>
  );
}