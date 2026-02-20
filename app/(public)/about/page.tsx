import { getSiteSettings } from "@/lib/settings";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `${settings.about_heading || "About"} — Zakat Foundation of America`,
  };
}

interface Value { title: string; body: string; }

export default async function AboutPage() {
  const settings = await getSiteSettings();

  const heading       = settings.about_heading        || "Who We Are";
  const subheading    = settings.about_subheading;
  const body          = settings.about_body;
  const image         = settings.about_image;
  const valuesHeading = settings.about_values_heading || "Our Values";

  let values: Value[] = [];
  if (settings.about_values) {
    try { values = JSON.parse(settings.about_values); } catch { /* empty */ }
  }

  return (
    <>
      <div style={{ background: "#0D0D0D", minHeight: "100vh" }}>

        {/* Hero */}
        <div
          className="about-hero"
          style={{
            position: "relative",
            background: "#161616",
            borderBottom: "1px solid #1F1F1F",
            overflow: "hidden",
          }}
        >
          {image && (
            <>
              <img src={image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.4)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0D0D0D 0%, transparent 60%)" }} />
            </>
          )}
          <div className="about-hero-inner" style={{ position: "relative", zIndex: 1, maxWidth: "1200px", width: "100%" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C9952A", marginBottom: "12px" }}>
              About Us
            </p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(32px, 5vw, 60px)",
              fontWeight: 600, color: "#F0EDE8",
              lineHeight: 1.1, marginBottom: subheading ? "16px" : "0",
            }}>
              {heading}
            </h1>
            {subheading && (
              <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "#B8B3AC", maxWidth: "560px", lineHeight: 1.7 }}>
                {subheading}
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        {body && (
          <div className="about-body-wrap">
            <div className="about-body" dangerouslySetInnerHTML={{ __html: body }} />
          </div>
        )}

        {/* Values */}
        {values.length > 0 && (
          <div style={{ background: "#161616", borderTop: "1px solid #1F1F1F", borderBottom: "1px solid #1F1F1F" }}>
            <div className="about-values-inner">
              <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C9952A", marginBottom: "10px" }}>
                What We Stand For
              </p>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(24px, 4vw, 44px)",
                fontWeight: 600, color: "#F0EDE8",
                marginBottom: "40px", lineHeight: 1.15,
              }}>
                {valuesHeading}
              </h2>
              <div className="values-grid">
                {values.map((v, i) => (
                  <div key={i} style={{ padding: "28px", background: "#0D0D0D", border: "1px solid #1F1F1F", borderRadius: "12px" }}>
                    <div style={{ width: "32px", height: "2px", background: "#C9952A", marginBottom: "16px" }} />
                    <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 600, color: "#F0EDE8", marginBottom: "10px" }}>
                      {v.title}
                    </h3>
                    <p style={{ fontSize: "13px", color: "#706B63", lineHeight: 1.7 }}>{v.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .about-hero {
          min-height: 360px;
          display: flex;
          align-items: flex-end;
        }
        .about-hero-inner {
          margin: 0 auto;
          padding: 72px clamp(24px, 6vw, 80px);
        }
        .about-body-wrap {
          max-width: 780px;
          margin: 0 auto;
          padding: 72px clamp(24px, 6vw, 80px);
        }
        .about-body {
          font-size: 17px;
          color: #B8B3AC;
          line-height: 1.85;
        }
        .about-body h2 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 32px; font-weight: 600;
          color: #F0EDE8; margin: 40px 0 16px; line-height: 1.2;
        }
        .about-body h3 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 24px; font-weight: 600;
          color: #F0EDE8; margin: 28px 0 12px;
        }
        .about-body p  { margin: 0 0 20px; }
        .about-body ul, .about-body ol { margin: 0 0 20px; padding-left: 24px; }
        .about-body li { margin-bottom: 8px; }
        .about-body blockquote {
          border-left: 2px solid #C9952A;
          margin: 32px 0; padding: 8px 0 8px 24px;
          color: #706B63; font-style: italic; font-size: 18px;
        }
        .about-body a      { color: #C9952A; }
        .about-body strong { color: #F0EDE8; font-weight: 600; }
        .about-values-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 72px clamp(24px, 6vw, 80px);
        }
        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }
        @media (max-width: 768px) {
          .about-hero { min-height: 280px; }
          .about-hero-inner { padding: 48px clamp(20px, 5vw, 48px); }
          .about-body-wrap  { padding: 48px clamp(20px, 5vw, 48px); }
          .about-values-inner { padding: 48px clamp(20px, 5vw, 48px); }
          .about-body { font-size: 15px; }
        }
        @media (max-width: 480px) {
          .about-hero { min-height: 220px; }
          .about-hero-inner { padding: 40px 20px; }
          .about-body-wrap  { padding: 40px 20px; }
          .about-values-inner { padding: 40px 20px; }
          .values-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}