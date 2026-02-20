// ============================================================
// lib/types/app.ts
// Custom app-level types — separate from Supabase generated types.
// Import from here, never modify database.ts (it gets regenerated).
// ============================================================

import type { Database } from "./database";

// ── Convenience row type aliases ──────────────────────────────
export type Campaign             = Database["public"]["Tables"]["campaigns"]["Row"];
export type CampaignInsert       = Database["public"]["Tables"]["campaigns"]["Insert"];
export type CampaignUpdate       = Database["public"]["Tables"]["campaigns"]["Update"];

export type CampaignContribution       = Database["public"]["Tables"]["campaign_contributions"]["Row"];
export type CampaignContributionInsert = Database["public"]["Tables"]["campaign_contributions"]["Insert"];

export type Donation       = Database["public"]["Tables"]["donations"]["Row"];
export type DonationInsert = Database["public"]["Tables"]["donations"]["Insert"];
export type DonationUpdate = Database["public"]["Tables"]["donations"]["Update"];

export type BlogPost       = Database["public"]["Tables"]["blog_posts"]["Row"];
export type BlogPostInsert = Database["public"]["Tables"]["blog_posts"]["Insert"];
export type BlogPostUpdate = Database["public"]["Tables"]["blog_posts"]["Update"];

export type SiteSetting          = Database["public"]["Tables"]["site_settings"]["Row"];
export type NewsletterSubscriber = Database["public"]["Tables"]["newsletter_subscribers"]["Row"];
export type Media                = Database["public"]["Tables"]["media"]["Row"];
export type MediaInsert          = Database["public"]["Tables"]["media"]["Insert"];

// ── Enum-style literals (mirrors CHECK constraints in schema) ──
export type CampaignStatus     = "active" | "urgent" | "completed" | "archived";
export type ContributionSource = "manual" | "paystack";
export type DonationStatus     = "pending" | "completed" | "failed" | "refunded";
export type SubscriberSource   = "donate" | "footer" | "manual";
export type SiteSettingType    = "text" | "richtext" | "image" | "boolean" | "json";

// ── Typed map for site_settings ───────────────────────────────
// All values are strings (stored as text in DB).
// JSON fields must be parsed after reading: JSON.parse(settings.home_partners_logos)
export interface SiteSettings {
  // Global
  site_name:   string;
  logo_url:    string;
  favicon_url: string;

  // Navbar
  nav_cta_label: string;
  nav_cta_href:  string;

  // Homepage
  home_campaigns_heading:    string;
  home_campaigns_subheading: string;
  home_stats_1_label:        string;
  home_stats_1_value:        string;
  home_stats_2_label:        string;
  home_stats_2_value:        string;
  home_stats_3_label:        string;
  home_stats_3_value:        string;
  home_stats_4_label:        string;
  home_stats_4_value:        string;
  home_cta_heading:          string;
  home_cta_body:             string;
  home_cta_button_label:     string;
  home_cta_button_href:      string;
  home_cta_image:            string;
  home_blog_heading:         string;
  home_partners_heading:     string;
  home_partners_logos:       string; // JSON → { name: string; logo_url: string }[]

  // About
  about_heading:        string;
  about_subheading:     string;
  about_body:           string;
  about_image:          string;
  about_values_heading: string;
  about_values:         string; // JSON → { title: string; body: string }[]

  // Donate
  donate_heading:        string;
  donate_intro:          string;
  donate_preset_amounts: string; // JSON → number[]

  // Footer
  footer_tagline:          string;
  footer_address:          string;
  footer_email:            string;
  footer_phone:            string;
  footer_social_twitter:   string;
  footer_social_instagram: string;
  footer_social_facebook:  string;
  footer_social_youtube:   string;
}