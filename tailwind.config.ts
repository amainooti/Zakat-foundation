import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Colors (mirror CSS variables) ──────────────────────────
      colors: {
        bg: {
          base:     "var(--bg-base)",
          surface:  "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
          border:   "var(--bg-border)",
          hover:    "var(--bg-hover)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          muted:   "var(--accent-muted)",
          subtle:  "var(--accent-subtle)",
        },
        urgent: "var(--urgent)",
        text: {
          primary:   "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted:     "var(--text-muted)",
          inverse:   "var(--text-inverse)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        error:   "var(--error)",
      },

      // ── Typography ─────────────────────────────────────────────
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans:    ["var(--font-sans)",    "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)",    "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
      },

      // ── Spacing extras ─────────────────────────────────────────
      spacing: {
        18:  "4.5rem",
        22:  "5.5rem",
        30:  "7.5rem",
        sidebar: "var(--sidebar-width)",
      },

      // ── Border radius ──────────────────────────────────────────
      borderRadius: {
        "4xl": "2rem",
      },

      // ── Animations ─────────────────────────────────────────────
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "progress-fill": {
          "0%":   { width: "0%" },
          "100%": { width: "var(--progress-width)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up":       "fade-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) both",
        "fade-up-slow":  "fade-up 0.9s cubic-bezier(0.4, 0, 0.2, 1) both",
        "fade-in":       "fade-in 0.4s ease both",
        "progress-fill": "progress-fill 1.2s cubic-bezier(0.4, 0, 0.2, 1) both",
        shimmer:         "shimmer 2s linear infinite",
      },

      // ── Shadows ────────────────────────────────────────────────
      boxShadow: {
        "card":    "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.6)",
        "card-lg": "0 10px 40px rgba(0,0,0,0.5)",
        "glow":    "0 0 30px rgba(201,149,42,0.15)",
        "glow-lg": "0 0 60px rgba(201,149,42,0.2)",
      },

      // ── Backdrop blur ──────────────────────────────────────────
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;