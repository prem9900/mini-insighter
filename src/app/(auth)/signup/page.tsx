"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import Logo from "@/components/shared/Logo";

export default function SignupPage() {

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Skip email confirmation for development
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      // Email confirmation required
      setLoading(false);
      return;
    }

    // If we have a session, user is auto-logged in (email confirmation disabled)
    if (data.session) {
      router.push("/dashboard");
    } else {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md card space-y-8 p-6 sm:p-8 border-gray-200 shadow-xl">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo size={64} />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 tracking-tight">Mini Insighter</h1>
            <h2 className="text-base sm:text-lg font-medium text-gray-600">Create your free account</h2>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Email Address</label>
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
            <label className="text-sm font-bold text-gray-700">Password</label>
            <input
              type="password"
              placeholder="Create a strong password"
              className="input-field text-base sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium animate-fade-in border border-red-100 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 sm:py-2 shadow-lg shadow-blue-600/20"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors block sm:inline mt-2 sm:mt-0">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
