"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type State = "idle" | "loading" | "sent" | "error";

export default function AdminLoginPage() {
  const [email, setEmail]   = useState("");
  const [state, setState]   = useState<State>("idle");
  const [errMsg, setErrMsg] = useState("");

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state === "loading") return;
    setState("loading");
    setErrMsg("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin/dashboard`,
        shouldCreateUser: false,
      },
    });

    if (error) {
      setState("error");
      setErrMsg(
        error.message.toLowerCase().includes("not found") ||
        error.message.toLowerCase().includes("invalid")
          ? "No admin account found for this email address."
          : "Something went wrong. Please try again."
      );
      return;
    }

    setState("sent");
  }

  return (
    <div
      style={{ background: "#0D0D0D", minHeight: "100vh" }}
      className="flex items-center justify-center px-4"
    >
      {/* Dot grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          opacity: 0.035,
          backgroundImage: "radial-gradient(circle at 1px 1px, #F0EDE8 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="w-full max-w-sm relative z-10" style={{ animation: "fadeUp 0.6s cubic-bezier(0.4,0,0.2,1) both" }}>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <Image
            src="/zakat_logo.png"
            alt="Zakat Foundation of America"
            width={200}
            height={100}
            className="object-contain"
            priority
          />
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-8"
          style={{ background: "#161616", border: "1px solid #2A2A2A" }}
        >
          {state !== "sent" ? (
            <>
              <h1
                className="mb-1.5"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", fontWeight: 600, color: "#F0EDE8", lineHeight: 1.15 }}
              >
                Sign in
              </h1>
              <p className="mb-8" style={{ fontSize: "13px", color: "#706B63", lineHeight: 1.6 }}>
                Enter your admin email to receive a sign-in link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "#B8B3AC", marginBottom: "6px" }}
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "#706B63" }}
                    />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@zakatfoundation.org"
                      required
                      autoComplete="email"
                      className="w-full rounded-lg text-sm outline-none transition-all"
                      style={{
                        paddingLeft: "34px",
                        paddingRight: "14px",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        background: "#1F1F1F",
                        border: `1px solid ${state === "error" ? "rgba(160,65,42,0.6)" : "#2A2A2A"}`,
                        color: "#F0EDE8",
                        fontFamily: "inherit",
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "rgba(201,149,42,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(201,149,42,0.08)"; }}
                      onBlur={(e)  => { e.target.style.borderColor = state === "error" ? "rgba(160,65,42,0.6)" : "#2A2A2A"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                </div>

                {/* Error */}
                {state === "error" && (
                  <div
                    className="flex items-start gap-2.5 rounded-lg p-3"
                    style={{ background: "rgba(160,65,42,0.1)", border: "1px solid rgba(160,65,42,0.2)" }}
                  >
                    <AlertCircle size={13} className="shrink-0 mt-0.5" style={{ color: "#A0412A" }} />
                    <p style={{ fontSize: "12px", color: "#A0412A", lineHeight: 1.5 }}>{errMsg}</p>
                  </div>
                )}

                {/* Button */}
                <button
                  type="submit"
                  disabled={!email || state === "loading"}
                  className="w-full flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    padding: "10px 16px",
                    background: !email || state === "loading" ? "rgba(201,149,42,0.4)" : "#C9952A",
                    color: "#0D0D0D",
                    cursor: !email || state === "loading" ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    border: "none",
                  }}
                >
                  {state === "loading" ? (
                    <>
                      <span
                        className="rounded-full animate-spin"
                        style={{ width: 14, height: 14, border: "2px solid rgba(13,13,13,0.3)", borderTopColor: "#0D0D0D", display: "inline-block" }}
                      />
                      Sending link…
                    </>
                  ) : (
                    <>
                      Send sign-in link
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Sent state */
            <div className="text-center py-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(42,122,74,0.1)", border: "1px solid rgba(42,122,74,0.2)" }}
              >
                <CheckCircle2 size={22} style={{ color: "#2A7A4A" }} />
              </div>
              <h2
                className="mb-2"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", fontWeight: 600, color: "#F0EDE8", lineHeight: 1.15 }}
              >
                Check your email
              </h2>
              <p className="mb-6" style={{ fontSize: "13px", color: "#706B63", lineHeight: 1.65 }}>
                We sent a sign-in link to{" "}
                <span style={{ color: "#B8B3AC", fontWeight: 500 }}>{email}</span>.
                Click the link to access the admin portal.
              </p>
              <button
                onClick={() => { setState("idle"); setEmail(""); }}
                style={{ fontSize: "11px", color: "#706B63", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                Use a different email
              </button>
            </div>
          )}
        </div>

        <p className="text-center mt-6" style={{ fontSize: "11px", color: "#706B63" }}>
          This portal is for authorized administrators only.
        </p>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: #706B63; }
      `}</style>
    </div>
  );
}