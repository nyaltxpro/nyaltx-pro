"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function ProSignupPage() {
  const router = useRouter();

  const handleSignup = () => {
    // In a real app, you'd integrate auth and a true subscription check.
    // Here we simply set a cookie to gate access for the Race and purchases.
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `nyaltx_pro=1; path=/; max-age=${oneYear}`;
    router.push("/pricing");
  };

  const handleSignout = () => {
    document.cookie = `nyaltx_pro=; path=/; max-age=0`;
    router.refresh();
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">NYALTX Pro</h1>
      <p className="text-gray-300 mb-6">
        Sign up for NYALTX Pro to access the Race to Liberty marketing tiers and additional premium features.
      </p>

      <div className="flex gap-3">
        <button onClick={handleSignup} className="py-2 px-4 rounded bg-emerald-600 hover:bg-emerald-500 font-medium">
          Activate Pro (demo)
        </button>
        <button onClick={handleSignout} className="py-2 px-4 rounded bg-gray-700 hover:bg-gray-600 font-medium">
          Clear Pro
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Note: This demo sets a browser cookie (<code>nyaltx_pro</code>). Replace with real authentication and subscription validation in production.
      </p>
    </div>
  );
}
