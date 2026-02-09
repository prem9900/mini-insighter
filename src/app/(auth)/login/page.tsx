"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white bg-grid-subtle px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md card space-y-8 animate-fade-in p-6 sm:p-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo size={64} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-zinc-900 tracking-tight">Mini Insighter</h1>
            <h2 className="text-base sm:text-lg font-medium text-zinc-600">Welcome Back</h2>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="input-field text-base sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="input-field text-base sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium animate-fade-in border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 sm:py-2"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-zinc-900 hover:text-black transition-colors block sm:inline mt-2 sm:mt-0">
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  );
}

