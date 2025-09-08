"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading…</div>}>
      <AdminLoginInner />
    </Suspense>
  );
}

function AdminLoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const from = params.get("from") || "/admin";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Invalid password");
      }
      router.replace(from);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-10">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent" />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-gray-800/80 bg-black/40 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.04)] p-6 md:p-7">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-cyan-500 text-black text-sm font-bold">N</span>
            <div>
              <h1 className="text-xl font-semibold leading-tight">NYAX Admin</h1>
              <p className="text-[12px] text-gray-400">Restricted area – authentication required</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 text-red-300 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-300">Email</label>
              <input
                type="email"
                className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-300">Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute inset-y-0 right-2 my-auto text-xs text-gray-400 hover:text-gray-200"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? "Hide" : "Show"}
                </button>
              </div>
              <div className="mt-1 text-[11px] text-gray-500">Tip: defined by ADMIN_PASSWORD env</div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 px-4 py-2 font-medium transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-[12px] text-gray-500">
            By continuing you agree to the acceptable use of this dashboard.
          </div>
        </div>
      </div>
    </div>
  );
}
