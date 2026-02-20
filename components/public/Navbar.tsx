"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { SiteSettings } from "@/lib/types/app";

const NAV_LINKS = [
  { label: "Campaigns", href: "/campaigns" },
  { label: "Blog",      href: "/blog"      },
  { label: "About",     href: "/about"     },
  { label: "Donate",    href: "/donate"    },
];

export default function Navbar({ settings }: { settings: SiteSettings }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // A link is active if the current path starts with its href
  const isActive = (href: string) => pathname.startsWith(href);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const ctaLabel = settings.nav_cta_label || "Donate Now";
  const ctaHref  = settings.nav_cta_href  || "/donate";
  const siteName = settings.site_name     || "Zakat Foundation";
  const logoUrl  = settings.logo_url;

  return (
    <>
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          height: "64px",
          background: scrolled ? "rgba(13,13,13,0.96)" : "transparent",
          borderBottom: scrolled ? "1px solid #1F1F1F" : "1px solid transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          transition: "background 0.3s, border-color 0.3s, backdrop-filter 0.3s",
          display: "flex", alignItems: "center",
          padding: "0 clamp(20px, 5vw, 64px)",
        }}
      >
        {/* Logo / wordmark */}
        <a
          href="/"
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", marginRight: "auto" }}
        >
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} style={{ height: "32px", width: "auto" }} />
          ) : (
            <span
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "18px", fontWeight: 600,
                color: "#F0EDE8", letterSpacing: "0.01em",
              }}
            >
              {siteName}
            </span>
          )}
        </a>

        {/* Desktop nav */}
        <nav
          style={{
            display: "flex", alignItems: "center", gap: "32px",
            marginRight: "32px",
          }}
          className="desktop-nav"
        >
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <a
                key={link.href}
                href={link.href}
                style={{
                  fontSize: "13px", fontWeight: active ? 600 : 500,
                  color: active ? "#F0EDE8" : "#B8B3AC",
                  textDecoration: "none",
                  letterSpacing: "0.03em",
                  transition: "color 0.15s",
                  position: "relative",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F0EDE8")}
                onMouseLeave={(e) => (e.currentTarget.style.color = active ? "#F0EDE8" : "#B8B3AC")}
              >
                {link.label}
                {/* Active underline dot */}
                {active && (
                  <span style={{
                    position: "absolute", bottom: "-4px", left: "50%",
                    transform: "translateX(-50%)",
                    width: "4px", height: "4px",
                    borderRadius: "50%", background: "#C9952A",
                  }} />
                )}
              </a>
            );
          })}
        </nav>

        {/* CTA — desktop only, mobile version lives in the drawer */}
        <a
          href={ctaHref}
          className="nav-cta"
          style={{
            padding: "8px 20px",
            background: "#C9952A", color: "#0D0D0D",
            fontWeight: 700, fontSize: "12px",
            letterSpacing: "0.07em", textTransform: "uppercase",
            textDecoration: "none", borderRadius: "6px",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#E0A830")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#C9952A")}
        >
          {ctaLabel}
        </a>

        {/* Hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          style={{
            display: "none",
            marginLeft: "16px",
            background: "none", border: "none", cursor: "pointer",
            color: "#F0EDE8", fontSize: "20px", padding: "4px",
          }}
          className="mobile-hamburger"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* Mobile drawer — always mounted, animates via max-height */}
      <div
        style={{
          position: "fixed", top: "64px", left: 0, right: 0, zIndex: 49,
          background: "#0D0D0D",
          borderBottom: mobileOpen ? "1px solid #1F1F1F" : "none",
          overflow: "hidden",
          maxHeight: mobileOpen ? "500px" : "0px",
          transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.35s ease",
        }}
      >
        <div style={{ padding: "20px clamp(20px, 5vw, 64px) 28px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                fontSize: "16px",
                fontWeight: isActive(link.href) ? 600 : 500,
                color: isActive(link.href) ? "#F0EDE8" : "#B8B3AC",
                textDecoration: "none", padding: "10px 0",
                borderBottom: "1px solid #1F1F1F",
                display: "flex", alignItems: "center", gap: "8px",
              }}
            >
              {isActive(link.href) && (
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#C9952A", flexShrink: 0 }} />
              )}
              {link.label}
            </a>
          ))}
          {/* CTA inside drawer on mobile */}
          <a
            href={ctaHref}
            onClick={() => setMobileOpen(false)}
            style={{
              marginTop: "16px",
              padding: "13px 20px",
              textAlign: "center",
              background: "#C9952A", color: "#0D0D0D",
              fontWeight: 700, fontSize: "13px",
              letterSpacing: "0.06em", textTransform: "uppercase",
              textDecoration: "none", borderRadius: "6px",
              transition: "background 0.15s",
            }}
          >
            {ctaLabel}
          </a>
        </div>
      </div>

      {/* Responsive styles injected via style tag */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: block !important; }
          .nav-cta { display: none !important; }
        }
      `}</style>
    </>
  );
}