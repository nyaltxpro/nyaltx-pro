"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount, useSignMessage } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import Image from "next/image";

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
  const [wError, setWError] = useState<string | null>(null);
  const [wLoading, setWLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const { signMessageAsync } = useSignMessage();

  const from = params.get("from") || "/admin";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // API expects { identifier, password } where identifier can be email or username
        body: JSON.stringify({ identifier: email, password }),
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

  async function handleWalletLogin() {
    setWError(null);
    setWLoading(true);
    
    try {
      // Step 1: Connect wallet if not connected
      if (!isConnected || !address) {
        await open();
        // Return early and let the user try again after connection
        setWLoading(false);
        return;
      }

      // Step 2: Get nonce for signing
      const nonceRes = await fetch("/api/admin/login/nonce", { 
        method: "GET",
        credentials: 'include' // Important for cookies
      });
      if (!nonceRes.ok) {
        throw new Error("Failed to get authentication nonce");
      }
      const { nonce } = await nonceRes.json();

      // Step 3: Create and sign message
      const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || "nyax-admin";
      const ts = Date.now();
      const addrLower = address.toLowerCase();
      const message = `NYAX Admin Login\nDomain: ${domain}\nAddress: ${addrLower}\nNonce: ${nonce}\nTimestamp: ${ts}`;
      
      const signature = await signMessageAsync({ message });

      // Step 4: Verify signature and complete login
      const verifyRes = await fetch("/api/admin/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ address: addrLower, signature, nonce, timestamp: ts }),
      });
      
      if (!verifyRes.ok) {
        const data = await verifyRes.json().catch(() => ({}));
        throw new Error(data?.message || "Authentication failed");
      }

      // Success - redirect to admin dashboard
      router.replace(from);
    } catch (err: any) {
      // Handle user rejection gracefully
      if (err.message?.includes("User rejected") || err.message?.includes("rejected") || err.message?.includes("denied")) {
        setWError("Wallet signature was cancelled");
      } else if (err.message?.includes("Address not allowed")) {
        setWError("Your wallet address is not authorized for admin access");
      } else {
        setWError(err.message || "Authentication failed");
      }
    } finally {
      setWLoading(false);
    }
  }

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-10">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent" />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-gray-800/80 bg-black/40 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.04)] p-6 md:p-7">
          <div className="mb-4 flex items-center gap-2">
           <div className="h-7 w-7 relative">
                          <Image 
                            src="/logo.png" 
                            alt="NYAX Logo" 
                            width={28} 
                            height={28} 
                            className="rounded"
                          />
                        </div>
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
          {wError && (
            <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 text-red-300 px-3 py-2 text-sm">
              {wError}
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

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-800" />
            <span className="text-xs text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-800" />
          </div>

          {/* Web3 Wallet Login */}
          <div className="space-y-2">
            {isConnected && address && (
              <div className="text-xs text-gray-400 bg-gray-900/50 rounded px-3 py-2 border border-gray-800">
                <span className="text-green-400">●</span> Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            )}
            <button
              type="button"
              onClick={handleWalletLogin}
              disabled={wLoading}
              className="w-full rounded-md border border-cyan-700/60 bg-cyan-900/20 hover:bg-cyan-900/30 disabled:opacity-50 px-4 py-2 font-medium transition-colors"
            >
              {wLoading ? "Processing..." : (isConnected && address) ? "Sign Message to Authenticate" : "Connect Wallet"}
            </button>
            <div className="text-[11px] text-gray-500">
              Only pre-approved admin wallet addresses can access. Configure via <code>ADMIN_WALLET_ADDRESSES</code>.
            </div>
          </div>

          <div className="mt-4 text-[12px] text-gray-500">
            By continuing you agree to the acceptable use of this dashboard.
          </div>
        </div>
      </div>
    </div>
  );
}
