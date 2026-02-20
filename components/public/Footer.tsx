"use client";
import type { SiteSettings } from "@/lib/types/app";

const NAV_LINKS = [
  { label: "Campaigns", href: "/campaigns" },
  { label: "Blog",      href: "/blog"      },
  { label: "About",     href: "/about"     },
  { label: "Donate",    href: "/donate"    },
];

export default function Footer({ settings }: { settings: SiteSettings }) {
  const siteName = settings.site_name      || "Zakat Foundation of America";
  const tagline  = settings.footer_tagline || "Giving Where It's Needed Most";
  const address  = settings.footer_address;
  const email    = settings.footer_email;
  const phone    = settings.footer_phone;

  const socials = [
    { key: "twitter",   label: "X",        href: settings.footer_social_twitter },
    { key: "instagram", label: "Instagram", href: settings.footer_social_instagram },
    { key: "facebook",  label: "Facebook",  href: settings.footer_social_facebook },
    { key: "youtube",   label: "YouTube",   href: settings.footer_social_youtube },
  ].filter((s) => s.href);

  return (
    <>
      <footer style={{ background: "#0D0D0D", borderTop: "1px solid #1F1F1F", padding: "64px clamp(24px, 6vw, 80px) 32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          <div className="footer-grid">
            {/* Brand */}
            <div>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 600, color: "#F0EDE8", marginBottom: "10px" }}>
                {siteName}
              </p>
              <p style={{ fontSize: "13px", color: "#706B63", lineHeight: 1.7, maxWidth: "300px" }}>
                {tagline}
              </p>
              {socials.length > 0 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "20px" }}>
                  {socials.map((s) => (
                    <a
                      key={s.key}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em",
                        color: "#4A4540", textDecoration: "none",
                        padding: "5px 10px",
                        border: "1px solid #2A2A2A", borderRadius: "4px",
                        transition: "color 0.15s, border-color 0.15s",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#C9952A"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#7A5A1A"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#4A4540"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#2A2A2A"; }}
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#4A4540", marginBottom: "16px" }}>
                Navigation
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    style={{ fontSize: "13px", color: "#706B63", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#F0EDE8")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#706B63")}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#4A4540", marginBottom: "16px" }}>
                Contact
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {email   && <a href={`mailto:${email}`} style={{ fontSize: "13px", color: "#706B63", textDecoration: "none" }}>{email}</a>}
                {phone   && <a href={`tel:${phone}`}    style={{ fontSize: "13px", color: "#706B63", textDecoration: "none" }}>{phone}</a>}
                {address && <p style={{ fontSize: "13px", color: "#4A4540", lineHeight: 1.6, whiteSpace: "pre-line" }}>{address}</p>}
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="footer-bottom">
            <p style={{ fontSize: "11px", color: "#4A4540" }}>
              © {new Date().getFullYear()} {siteName}. All rights reserved.
            </p>
            <p style={{ fontSize: "11px", color: "#4A4540" }}>
              501(c)(3) nonprofit organisation
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 48px;
          padding-bottom: 48px;
          border-bottom: 1px solid #1F1F1F;
        }
        .footer-bottom {
          padding-top: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 36px;
          }
          .footer-grid > div:first-child {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  );
}