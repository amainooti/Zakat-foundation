import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/* ── Class name merger ───────────────────────────────────────── */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ── Currency formatter ──────────────────────────────────────── */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/* ── Slugify ─────────────────────────────────────────────────── */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ── Progress percentage ─────────────────────────────────────── */
export function calcProgress(raised: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(Math.round((raised / target) * 100), 100);
}

/* ── Truncate text ───────────────────────────────────────────── */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "…";
}

/* ── Format date ─────────────────────────────────────────────── */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
}

/* ── Relative time ───────────────────────────────────────────── */
export function timeAgo(date: string | Date): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  const intervals: [number, string][] = [
    [31536000, "year"],
    [2592000,  "month"],
    [86400,    "day"],
    [3600,     "hour"],
    [60,       "minute"],
  ];
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}