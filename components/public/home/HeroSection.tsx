"use client";

import { useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/types/app";

export default function HeroSection({ settings }: { settings: SiteSettings }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const siteName = settings.site_name     || "Zakat Foundation of America";
  const ctaImage = settings.home_cta_image;
  const ctaLabel = settings.home_cta_button_label || "Donate Now";
  const ctaHref  = settings.home_cta_button_href  || "/donate";

  return (
    <>
      <section className="hero-section">
        {/* Background */}
        {ctaImage ? (
          <img src={ctaImage} alt="" className="hero-bg-img" />
        ) : (
          <div className="hero-bg-gradient" />
        )}

        {/* Grain */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.6, pointerEvents: "none" }} />

        {/* Bottom fade */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to top, #0D0D0D, transparent)" }} />

        {/* Gold rule — hidden on small screens */}
        <div className="hero-rule" style={{ opacity: visible ? 0.4 : 0, transition: "opacity 1.2s ease 0.6s" }} />

        {/* Content */}
        <div className="hero-content">
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9952A", marginBottom: "20px", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(12px)", transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s" }}>
            Trusted since 2001
          </p>
          <h1 className="hero-heading" style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s" }}>
            {siteName}
          </h1>
          <p className="hero-sub" style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(16px)", transition: "opacity 0.8s ease 0.35s, transform 0.8s ease 0.35s" }}>
            We deliver your generosity where it&apos;s needed most — across 40+ countries, with accountability you can trust.
          </p>
          <div className="hero-ctas" style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(12px)", transition: "opacity 0.8s ease 0.5s, transform 0.8s ease 0.5s" }}>
            <a href={ctaHref} className="hero-cta-primary"
              onMouseEnter={(e) => { e.currentTarget.style.background = "#E0A830"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#C9952A"; e.currentTarget.style.transform = "none"; }}
            >
              {ctaLabel}
            </a>
            <a href="/campaigns" className="hero-cta-secondary"
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#706B63"; e.currentTarget.style.color = "#F0EDE8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.color = "#B8B3AC"; }}
            >
              View Campaigns
            </a>
          </div>
        </div>

        {/* Scroll indicator — hidden on mobile */}
        <div className="hero-scroll" style={{ opacity: visible ? 0.35 : 0, transition: "opacity 1s ease 1s" }}>
          <span style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#706B63", writingMode: "vertical-rl" }}>Scroll</span>
          <div style={{ width: "1px", height: "40px", background: "linear-gradient(to bottom, #706B63, transparent)" }} />
        </div>
      </section>

      <style>{`
        .hero-section {
          position: relative;
          min-height: 100svh;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }
        .hero-bg-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          filter: brightness(0.4);
        }
        .hero-bg-gradient {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #0D0D0D 0%, #1a1208 50%, #0D0D0D 100%);
        }
        .hero-rule {
          position: absolute; left: 64px; top: 20%; bottom: 20%;
          width: 1px;
          background: linear-gradient(to bottom, transparent, #C9952A, transparent);
        }
        .hero-content {
          position: relative; z-index: 1;
          padding: clamp(48px, 8vw, 96px) clamp(24px, 8vw, 96px);
          max-width: 900px;
        }
        .hero-heading {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(40px, 7vw, 88px);
          font-weight: 600; color: #F0EDE8;
          line-height: 1.05; margin-bottom: 24px;
        }
        .hero-sub {
          font-size: clamp(14px, 1.5vw, 18px);
          color: #B8B3AC;
          max-width: 520px; line-height: 1.75; margin-bottom: 36px;
        }
        .hero-ctas {
          display: flex; gap: 12px; flex-wrap: wrap;
        }
        .hero-cta-primary {
          padding: 14px 32px;
          background: #C9952A; color: #0D0D0D;
          font-weight: 700; font-size: 13px;
          letter-spacing: 0.06em; text-transform: uppercase;
          text-decoration: none; border-radius: 6px;
          transition: background 0.15s, transform 0.15s;
        }
        .hero-cta-secondary {
          padding: 14px 32px;
          background: transparent; color: #B8B3AC;
          font-weight: 500; font-size: 13px;
          letter-spacing: 0.04em;
          text-decoration: none; border-radius: 6px;
          border: 1px solid #2A2A2A;
          transition: border-color 0.15s, color 0.15s;
        }
        .hero-scroll {
          position: absolute; bottom: 32px; right: 48px;
          display: flex; flex-direction: column;
          align-items: center; gap: 8px;
        }
        @media (max-width: 768px) {
          .hero-section { min-height: 90svh; }
          .hero-rule    { display: none; }
          .hero-scroll  { display: none; }
          .hero-content { padding: 40px clamp(20px, 5vw, 48px); }
        }
        @media (max-width: 480px) {
          .hero-section { min-height: 85svh; }
          .hero-content { padding: 36px 20px; }
          .hero-cta-primary, .hero-cta-secondary { padding: 12px 24px; width: 100%; text-align: center; }
          .hero-ctas { flex-direction: column; }
        }
      `}</style>
    </>
  );
}