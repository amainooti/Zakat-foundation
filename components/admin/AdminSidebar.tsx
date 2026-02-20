"use client";

import Link from "next/link";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Megaphone,
  BookOpen,
  Settings,
  HeartHandshake,
  ImageIcon,
  Mail,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  {
    section: "Content",
    items: [
      { label: "Dashboard",   href: "/admin/dashboard",  icon: LayoutDashboard },
      { label: "Campaigns",   href: "/admin/campaigns",  icon: Megaphone       },
      { label: "Blog",        href: "/admin/blog",       icon: BookOpen        },
      { label: "Media",       href: "/admin/media",      icon: ImageIcon       },
    ],
  },
  {
    section: "Giving",
    items: [
      { label: "Donations",   href: "/admin/donations",  icon: HeartHandshake  },
      { label: "Newsletter",  href: "/admin/newsletter", icon: Mail            },
    ],
  },
  {
    section: "Settings",
    items: [
      { label: "Site Editor", href: "/admin/site",       icon: Settings        },
    ],
  },
];

interface Props {
  userEmail?: string;
}

export default function AdminSidebar({ userEmail }: Props) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [open, setOpen]             = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  const SidebarContent = () => (
    <aside
      className={cn(
        "sidebar flex flex-col",
        open && "sidebar--open"
      )}
    >
      {/* ── Logo ── */}
      <div className="px-3 py-4 mb-8">
        <NextImage
          src="/zakat_logo.png"
          alt="Zakat Foundation"
          width={250}
          height={200}
          className="object-contain object-left w-auto h-auto max-w-45"
          priority
          style={{
            marginBottom: "20px"
          }}
        />
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-2">
        {NAV_ITEMS.map((group) => (
          <div key={group.section}>
            <p className="nav-section-label px-2 mb-1">{group.section}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon   = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "nav-item group",
                      active && "nav-item--active"
                    )}
                  >
                    <span className="nav-item-icon">
                      <Icon size={15} />
                    </span>
                    <span className="nav-item-label flex-1">{item.label}</span>
                    {active && (
                      <ChevronRight size={12} className="text-accent opacity-60" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User footer ── */}
      <div className="mt-auto pt-4 border-t border-bg-border mx-2">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-semibold text-accent">
              {userEmail?.[0]?.toUpperCase() ?? "A"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-text-secondary truncate leading-none mb-0.5">
              {userEmail ?? "Admin"}
            </p>
            <p className="text-[10px] text-text-muted leading-none">
              Administrator
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className={cn(
            "nav-item w-full text-left",
            "text-text-muted hover:text-urgent",
            "hover:bg-urgent/8",
          )}
        >
          <span className="nav-item-icon">
            {signingOut ? (
              <span className="w-3.5 h-3.5 border border-text-muted/40 border-t-text-muted rounded-full animate-spin block" />
            ) : (
              <LogOut size={15} />
            )}
          </span>
          <span className="nav-item-label">
            {signingOut ? "Signing out…" : "Sign out"}
          </span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      <div
        className={cn(
          "sidebar-backdrop",
          open && "sidebar-backdrop--visible"
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <SidebarContent />
    </>
  );
}