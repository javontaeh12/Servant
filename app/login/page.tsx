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
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        router.replace("/admin");
      } else {
        const data = await res.json();
        setLoginError(data.error || "This email is not authorized.");
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
              placeholder="you@example.com"
              autoComplete="email"
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
