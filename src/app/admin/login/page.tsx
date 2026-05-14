"use client";

import * as React from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      toast.error("Supabase belum dikonfigurasi. Tambahkan env NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      console.error("[Login] signInWithPassword error:", error.message);
      toast.error("Email atau password salah.");
      return;
    }

    console.log("[Login] signed in:", data.user?.email);
    toast.success("Login berhasil");
    // Hard navigation ensures the new page initializes Supabase from scratch
    // with the session now stored in localStorage — avoids router cache issues.
    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fff8f9] via-[#ffe8ef] to-[#fef3ea]" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blush-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-cream-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        {/* Brand mark */}
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex flex-col items-center gap-3 group">
            <span className="h-14 w-14 rounded-full bg-gradient-to-br from-blush-200 via-blush-300 to-cream-200 flex items-center justify-center text-blush-700 text-2xl shadow-[0_4px_20px_rgba(247,107,148,0.25)] group-hover:shadow-glow transition-shadow duration-300">
              ❀
            </span>
            <span className="font-serif text-xl text-ink-900 leading-none">
              Blush Petals
              <span className="text-blush-500 font-sans font-normal text-sm">.id</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(154,70,92,0.18),0_0_0_1px_rgba(255,209,220,0.25)] p-8">
          <div className="mb-6">
            <h1 className="font-serif text-2xl text-ink-900">Selamat datang</h1>
            <p className="text-[13px] text-ink-400 mt-1">
              Masuk ke panel admin Blush Petals.id
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[11px] text-ink-600 font-medium uppercase tracking-[0.12em]">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@blushpetals.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-2xl border border-blush-100 bg-white/70 text-sm text-ink-900 placeholder:text-ink-300
                             focus:outline-none focus:border-blush-300 focus:ring-4 focus:ring-blush-100
                             transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[11px] text-ink-600 font-medium uppercase tracking-[0.12em]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-11 rounded-2xl border border-blush-100 bg-white/70 text-sm text-ink-900 placeholder:text-ink-300
                             focus:outline-none focus:border-blush-300 focus:ring-4 focus:ring-blush-100
                             transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-ink-300 hover:text-ink-500 transition-colors duration-150"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 rounded-2xl
                         bg-gradient-to-br from-blush-400 via-blush-500 to-blush-600
                         text-white text-sm font-medium
                         shadow-soft hover:shadow-glow
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-all duration-300 ease-premium
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memproses…
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <p className="text-[11px] text-ink-300 mt-5 text-center leading-relaxed">
            Akses hanya untuk admin.
            <br />
            Tambahkan user via Supabase Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
