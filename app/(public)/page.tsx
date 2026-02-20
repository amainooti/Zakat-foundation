import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import HeroSection from "@/components/public/home/HeroSection";
import StatsBar from "@/components/public/home/StatsBar";
import FeaturedCampaigns from "@/components/public/home/FeaturedCampaigns";
import MissionSection from "@/components/public/home/MissionSection";
import BlogPreview from "@/components/public/home/BlogPreview";
import NewsletterCTA from "@/components/public/home/NewsLetterCTA";
import type { Campaign, BlogPost } from "@/lib/types/app";

export const revalidate = 3600;

export default async function HomePage() {
  const supabase = await createClient();
  const settings = await getSiteSettings();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, slug, description, cover_image, status, target_amount, raised_amount, donor_count, is_featured, category")
    .in("status", ["active", "urgent"])
    .order("is_featured", { ascending: false })
    .order("created_at",  { ascending: false })
    .limit(3);

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image, published_at, category")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(3);

  return (
    <main style={{ background: "#0D0D0D", minHeight: "100vh" }}>
      <HeroSection settings={settings} />
      <StatsBar settings={settings} />
      <FeaturedCampaigns campaigns={(campaigns ?? []) as Campaign[]} settings={settings} />
      <MissionSection settings={settings} />
      <BlogPreview posts={(posts ?? []) as BlogPost[]} settings={settings} />
      <NewsletterCTA />
    </main>
  );
}