"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface AuthFormProps {
  mode: "login" | "signup";
  /** Post-login path (validated server-side on login page). */
  redirectTo?: string;
}

export function AuthForm({ mode, redirectTo = "/history" }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setLoading(false);
      if (error) {
        setMessage(error.message);
        return;
      }
      setMessage("Check your email to confirm your account.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    window.location.href = redirectTo;
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <label className="block">
        <span className="text-sm font-medium mb-1 block">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-rect"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium mb-1 block">Password</span>
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-rect"
        />
      </label>
      {message && (
        <p className="text-sm text-[var(--text-muted)]">{message}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 squircle bg-[var(--accent)] text-white font-medium disabled:opacity-50"
      >
        {loading
          ? "Please wait..."
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </button>
      <p className="text-sm text-center text-[var(--text-muted)]">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href="/signup" className="text-[var(--accent)] font-medium">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--accent)] font-medium">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
