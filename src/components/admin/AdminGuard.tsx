"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface State {
  loading: boolean;
  authed: boolean;
  email?: string;
}

export function AdminGuard({ children }: { children: (ctx: { email?: string; signOut: () => void }) => React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = React.useState<State>({ loading: true, authed: false });

  React.useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured()) {
      setState({ loading: false, authed: false });
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setState({ loading: false, authed: false });
      return;
    }

    // getSession() reads from localStorage — no network, resolves immediately.
    // getUser() makes a network round-trip that can hang and cause redirect loops.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      console.log("[AdminGuard] getSession:", session ? "session found" : "no session");
      if (!session) {
        setState({ loading: false, authed: false });
        router.replace("/admin/login");
      } else {
        setState({ loading: false, authed: true, email: session.user.email ?? undefined });
      }
    });

    // Only react to explicit auth events — not INITIAL_SESSION which can fire
    // with null before localStorage is fully read, causing a spurious redirect.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      console.log("[AdminGuard] auth event:", event, session ? "session" : "no session");
      if (event === "SIGNED_OUT") {
        setState({ loading: false, authed: false });
        router.replace("/admin/login");
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setState({ loading: false, authed: true, email: session?.user.email ?? undefined });
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center rounded-3xl bg-white border border-blush-100 p-8 shadow-card">
          <AlertTriangle className="h-8 w-8 text-blush-500 mx-auto mb-3" />
          <h2 className="font-serif text-xl text-ink-900">Supabase belum dikonfigurasi</h2>
          <p className="text-sm text-ink-500 mt-2">
            Tambahkan <code className="px-1 py-0.5 bg-blush-50 rounded">NEXT_PUBLIC_SUPABASE_URL</code> dan
            <code className="px-1 py-0.5 bg-blush-50 rounded ml-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> ke
            file <code className="px-1 py-0.5 bg-blush-50 rounded">.env.local</code>, lalu restart server.
          </p>
          <Link
            href="/"
            className="inline-flex items-center mt-5 h-10 px-5 rounded-full bg-blush-500 text-white text-sm"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blush-500" />
      </div>
    );
  }

  if (!state.authed) return null;

  return <>{children({ email: state.email, signOut })}</>;
}
