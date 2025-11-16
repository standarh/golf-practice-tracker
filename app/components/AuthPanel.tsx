"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "../../lib/supabaseClient";

type User = {
  email?: string;
};

export default function AuthPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // On mount, check if there's a current user
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser({ email: data.user.email ?? undefined });
      }
    }

    loadUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ email: session.user.email ?? undefined });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setLoading(false);

    if (error) {
      console.error("Sign-in error:", error.message);
      setStatus("Error sending magic link: " + error.message);
      return;
    }

    setStatus("Check your email for a magic sign-in link.");
  }

  async function handleSignOut() {
    setLoading(true);
    setStatus(null);

    const { error } = await supabase.auth.signOut();
    setLoading(false);

    if (error) {
      console.error("Sign-out error:", error.message);
      setStatus("Error signing out: " + error.message);
      return;
    }

    setStatus("Signed out.");
  }

  return (
    <section className="border rounded-lg p-3 bg-white shadow-sm flex flex-col gap-2 text-sm">
      {user ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="font-medium">Signed in</div>
            <div className="text-xs text-gray-600">
              {user.email ?? "Authenticated user"}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="self-start px-3 py-1 border rounded text-xs"
          >
            {loading ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSignIn}
          className="flex flex-col sm:flex-row gap-2 sm:items-center"
        >
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">
              Sign in with email (magic link)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="border rounded px-2 py-1 w-full text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1 border rounded text-xs bg-black text-white disabled:bg-gray-400"
          >
            {loading ? "Sending…" : "Send magic link"}
          </button>
        </form>
      )}

      {status && <p className="text-xs text-gray-700">{status}</p>}
    </section>
  );
}
