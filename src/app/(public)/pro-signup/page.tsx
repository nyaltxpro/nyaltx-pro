"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PublicHeader from "@/components/PublicHeader";

export default function ProSignupPage() {
  const router = useRouter();
  const [active, setActive] = useState<boolean>(false);

  const handleSignup = () => {
    // In a real app, you'd integrate auth and a true subscription check.
    // Here we simply set a cookie to gate access for the Race and purchases.
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `nyaltx_pro=1; path=/; max-age=${oneYear}`;
    setActive(true);
    router.push("/pricing");
  };

  const handleSignout = () => {
    document.cookie = `nyaltx_pro=; path=/; max-age=0`;
    setActive(false);
    router.refresh();
  };

  useEffect(() => {
    const isActive = document.cookie.split(";").some((c) => c.trim().startsWith("nyaltx_pro="));
    setActive(isActive);
  }, []);

  return (
    <div className="relative">
      <PublicHeader />
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6 py-12 md:py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-800 bg-black/40 px-3 py-1 text-xs text-gray-300">
              <span className={`h-2 w-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-500'}`} />
              {active ? 'Pro Active' : 'Pro Inactive'}
            </div>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">NYALTX Pro</h1>
            <p className="mt-2 text-gray-300 max-w-2xl">
              Unlock advanced visibility and growth tools. Gain access to Race to Liberty placements, enhanced listings, and more.
            </p>
          </div>
          <div className="shrink-0 flex gap-3">
            {!active ? (
              <button onClick={handleSignup} className="rounded-lg bg-cyan-500 px-5 py-2.5 font-medium text-black hover:bg-cyan-400">
                Activate Pro (demo)
              </button>
            ) : (
              <button onClick={handleSignout} className="rounded-lg border border-gray-700 px-5 py-2.5 font-medium hover:bg-gray-800">
                Deactivate Pro
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900/60 to-black/20 p-5">
            <div className="text-lg font-semibold">Race to Liberty</div>
            <p className="mt-1 text-gray-300 text-sm">Statue of Liberty–themed promotional placements across NYALTX surfaces to boost discovery.</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900/60 to-black/20 p-5">
            <div className="text-lg font-semibold">Enhanced Listings</div>
            <p className="mt-1 text-gray-300 text-sm">Priority placement, richer metadata, and visual emphasis for your token profile.</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900/60 to-black/20 p-5">
            <div className="text-lg font-semibold">Flexible Payments</div>
            <p className="mt-1 text-gray-300 text-sm">Pay with cards (Stripe), ETH, or NYAX with a 20% discount for token payments.</p>
          </div>
        </div>

        {/* Next steps card */}
        <div className="mt-8 rounded-xl border border-gray-800 bg-black/30 p-6">
          <h2 className="text-xl font-semibold">Next steps</h2>
          <ol className="mt-3 list-decimal pl-5 text-gray-300 space-y-1 text-sm">
            <li>Activate Pro (demo) above to set your browser flag.</li>
            <li>Head to Pricing to choose a marketing tier.</li>
            <li>Contact our team for custom placements or partnerships.</li>
          </ol>
          <p className="mt-3 text-xs text-gray-500">This page uses a demo cookie (<code>nyaltx_pro</code>). Replace with real auth + subscription checks in production.</p>
        </div>
      </div>
    </div>
  );
}
