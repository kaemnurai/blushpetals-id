"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      toast.error(
        "Supabase belum dikonfigurasi. Tambahkan env NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Login berhasil");
    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <span className="h-10 w-10 rounded-full bg-gradient-to-br from-blush-200 to-cream-200 flex items-center justify-center text-blush-700 font-serif text-xl">
            ❀
          </span>
          <span className="font-serif text-xl text-ink-900">Blush Petals.id</span>
        </Link>

        <div className="rounded-3xl bg-white/80 backdrop-blur border border-blush-100 shadow-card p-7">
          <h1 className="font-serif text-2xl text-ink-900">Admin Login</h1>
          <p className="text-xs text-ink-500 mt-1">
            Masuk untuk mengelola produk & inventory.
          </p>

          <form onSubmit={onSubmit} className="space-y-3.5 mt-6">
            <Field label="Email" htmlFor="email" required>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  className="pl-10"
                  placeholder="admin@blushpetals.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </Field>
            <Field label="Password" htmlFor="password" required>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <Input
                  id="password"
                  type="password"
                  required
                  className="pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </Field>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <p className="text-[11px] text-ink-400 mt-4 text-center">
            Login menggunakan Supabase Auth. Tambahkan user via Supabase Dashboard.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
