"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LogIn } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if user already has a valid session — if so, redirect to admin
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace("/admin");
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.replace("/admin");
      } else {
        const data = await res.json();
        setLoginError(data.error || "Invalid email or password");
      }
    } catch {
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-slate-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <LogIn
            className="mx-auto text-primary mb-4"
            size={32}
            strokeWidth={1.5}
          />
          <h1 className="font-heading text-2xl font-bold text-slate-text mb-2">
            Admin Portal
          </h1>
          <p className="text-slate-muted text-sm">
            Sign in to manage your business.
          </p>
        </div>

        {error === "access_denied" && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm text-sm text-center mb-6">
            Your email is not authorized. Contact the admin.
          </div>
        )}

        {error === "auth_failed" && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm text-sm text-center mb-6">
            Authentication failed. Please try again.
          </div>
        )}

        {loginError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm text-sm text-center mb-6">
            {loginError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-text mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-sm px-3 py-2.5 text-sm text-slate-text placeholder:text-slate-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-text mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-sm px-3 py-2.5 text-sm text-slate-text placeholder:text-slate-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-heading font-bold text-xs tracking-[0.15em] uppercase px-6 py-3.5 rounded-sm transition-all hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-muted">or</span>
          </div>
        </div>

        <a
          href="/api/auth/google"
          className="w-full bg-slate-50 border border-slate-200 text-slate-text font-heading font-bold text-xs tracking-[0.15em] uppercase px-6 py-3.5 rounded-sm transition-all hover:bg-slate-100 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </a>

        <p className="text-center text-slate-muted/50 text-xs mt-6">
          Only authorized users can access the admin portal.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-pulse text-slate-muted">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
