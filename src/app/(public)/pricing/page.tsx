"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount, useSendTransaction, useWriteContract } from "wagmi";
import { parseEther, erc20Abi, parseUnits } from "viem";
import PublicHeader from "@/components/PublicHeader";

// Pricing tiers in USD
const TIERS = [
  { id: "paddle", name: "Paddle Boat", description: "1 week on Recently Updated.", priceUSD: 300 },
  { id: "motor", name: "Motor Boat", description: "1 month placement.", priceUSD: 500 },
  { id: "helicopter", name: "Helicopter", description: "3 months placement.", priceUSD: 700 },
];

// ENV configuration
const RECEIVER = process.env.NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS as `0x${string}` | undefined;
const NYAX_TOKEN = process.env.NEXT_PUBLIC_NYAX_TOKEN_ADDRESS as `0x${string}` | undefined;
const PAYMENT_CHAIN_ID = process.env.NEXT_PUBLIC_PAYMENT_CHAIN_ID ? Number(process.env.NEXT_PUBLIC_PAYMENT_CHAIN_ID) : undefined;

function useIsPro() {
  const [isPro, setIsPro] = useState<boolean>(false);
  useEffect(() => {
    try {
      const value = document.cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("nyaltx_pro="));
      setIsPro(!!value && value.split("=")[1] === "1");
    } catch {
      setIsPro(false);
    }
  }, []);
  return isPro;
}

async function fetchETHPriceUSD(): Promise<number> {
  // Simple Coingecko fetch for ETH price in USD
  const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch ETH price");
  const data = await res.json();
  return data?.ethereum?.usd ?? 0;
}

export default function PricingPage() {
  const { isConnected, chain } = useAccount();
  const isPro = useIsPro();
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // wagmi hooks
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    fetchETHPriceUSD().then(setEthPrice).catch(() => setEthPrice(null));
  }, []);

  const computeEthAmount = useCallback((usd: number) => {
    if (!ethPrice || ethPrice <= 0) return null;
    return usd / ethPrice;
  }, [ethPrice]);

  const handleStripeCheckout = useCallback(async (tierId: string) => {
    setError(null);
    setBusy(tierId + ":stripe");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId }),
      });
      if (!res.ok) throw new Error("Checkout session failed");
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Missing checkout url");
      }
    } catch (e: any) {
      setError(e?.message || "Stripe checkout error");
    } finally {
      setBusy(null);
    }
  }, []);

  const handlePayETH = useCallback(async (tierId: string, priceUSD: number) => {
    if (!RECEIVER) { setError("Receiver address not configured"); return; }
    if (!isConnected) { setError("Connect your wallet to pay in ETH"); return; }
    if (PAYMENT_CHAIN_ID && chain?.id !== PAYMENT_CHAIN_ID) { setError("Please switch to the correct chain to pay"); return; }
    const ethAmt = computeEthAmount(priceUSD);
    if (!ethAmt) { setError("Unable to compute ETH amount. Try again later."); return; }

    setError(null);
    setBusy(tierId + ":eth");
    try {
      const hash = await sendTransactionAsync({ to: RECEIVER, value: parseEther(ethAmt.toFixed(6)) });
      // Optionally, track transaction or show toast
      console.log("ETH payment tx:", hash);
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "ETH payment failed");
    } finally {
      setBusy(null);
    }
  }, [chain?.id, computeEthAmount, isConnected, sendTransactionAsync]);

  const handlePayNYAX = useCallback(async (tierId: string, priceUSD: number) => {
    if (!RECEIVER) { setError("Receiver address not configured"); return; }
    if (!NYAX_TOKEN) { setError("NYAX token address not configured"); return; }
    if (!isConnected) { setError("Connect your wallet to pay in NYAX"); return; }
    if (PAYMENT_CHAIN_ID && chain?.id !== PAYMENT_CHAIN_ID) { setError("Please switch to the correct chain to pay"); return; }

    // 20% discount
    const discountedUSD = priceUSD * 0.8;

    // For NYAX, assume 1 NYAX = 1 USD unless otherwise specified; if you need market pricing, integrate a price feed.
    // Here we treat NYAX as a stable-like pricing unit for simplicity. Adjust if NYAX has volatility and an oracle is required.
    const nyaxAmountWhole = discountedUSD; // 1 NYAX = $1 assumption

    setError(null);
    setBusy(tierId + ":nyax");
    try {
      // Convert to token units (assume 18 decimals). If NYAX has different decimals, adjust via env or on-chain read.
      const decimals = 18;
      const amount = parseUnits(discountedUSD.toFixed(6), 6); // work around float precision, first to 6dp
      // scale from 6 to 18 decimals: multiply by 10^(12)
      const scale = parseUnits("1", 12);
      const value = amount * scale;
      const hash = await writeContractAsync({
        abi: erc20Abi,
        address: NYAX_TOKEN,
        functionName: "transfer",
        args: [RECEIVER, value],
      });
      console.log("NYAX payment tx:", hash);
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "NYAX payment failed");
    } finally {
      setBusy(null);
    }
  }, [chain?.id, isConnected, writeContractAsync]);

  return (
    <> <PublicHeader />
    <div className="max-w-6xl mx-auto px-4 py-10">
     
     <h1 className="text-3xl font-bold mb-2">Race to Liberty — Enhanced Marketing</h1>
      <p className="text-gray-300 mb-6">A Statue of Liberty–themed campaign where crypto projects compete in the "Race to Liberty" to gain visibility. All participants are eligible to appear on the popular podcast Off Road.</p>

      {!isPro && (
        <div className="p-4 mb-6 rounded-md border border-amber-400 bg-amber-950/30 text-amber-200">
          <strong>NYALTX Pro required:</strong> You must sign up for <strong>NYALTX Pro</strong> before joining the Race or purchasing a tier.
          <div className="mt-2">
            <Link className="underline text-amber-300" href="/pro-signup">Sign up for NYALTX Pro</Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((t) => {
          const ethAmt = ethPrice ? computeEthAmount(t.priceUSD) : null;
          const nyaxUSD = t.priceUSD * 0.8;
          return (
            <div key={t.id} className="border border-gray-800 rounded-xl p-5 bg-gray-900/50 flex flex-col min-h-[420px]">
              <h2 className="text-xl font-semibold mb-1">{t.name}</h2>
              <p className="text-gray-400 text-sm mb-4">{t.description}</p>
              <div className="mb-4">
                <div className="text-3xl font-bold">${t.priceUSD.toLocaleString()}</div>
                <div className="text-xs text-gray-400">ETH est.: {ethAmt ? `${ethAmt.toFixed(5)} ETH` : "—"}</div>
                <div className="text-xs text-gray-400">NYAX discounted: ${nyaxUSD.toFixed(2)} (−20%)</div>
              </div>
              {/* Features */}
              <ul className="text-sm text-gray-300 space-y-1 mb-4 list-disc pl-5">
                {t.id === 'paddle' && (
                  <>
                    <li>Placement on Recently Updated for 1 week</li>
                    <li>Eligible for Off Road podcast mention</li>
                    <li>Project logo showcased in Race to Liberty rollup</li>
                    <li>Basic socials link-out</li>
                  </>
                )}
                {t.id === 'motor' && (
                  <>
                    <li>Homepage placement for 1 month</li>
                    <li>Priority slot in Race to Liberty carousel</li>
                    <li>Podcast Off Road shout-out (scheduled)</li>
                    <li>Enhanced socials and website spotlight</li>
                  </>
                )}
                {t.id === 'helicopter' && (
                  <>
                    <li>Premium placement for 3 months</li>
                    <li>Featured in Race to Liberty highlights</li>
                    <li>Podcast Off Road guest eligibility</li>
                    <li>Priority support and promo coordination</li>
                  </>
                )}
              </ul>

              {error && busy?.startsWith(t.id) && (
                <div className="text-red-400 text-sm mb-2">{error}</div>
              )}

              <div className="mt-auto flex flex-col gap-2">
                <button
                  disabled={!isPro || busy !== null}
                  onClick={() => handleStripeCheckout(t.id)}
                  className="w-full py-2 rounded bg-white text-black font-medium hover:opacity-90 disabled:opacity-50"
                >
                  Pay with Card (Stripe)
                </button>
                <button
                  disabled={!isPro || !isConnected || busy !== null}
                  onClick={() => handlePayETH(t.id, t.priceUSD)}
                  className="w-full py-2 rounded bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-50"
                >
                  Pay with ETH
                </button>
                <button
                  disabled={!isPro || !isConnected || busy !== null}
                  onClick={() => handlePayNYAX(t.id, t.priceUSD)}
                  className="w-full py-2 rounded bg-cyan-600 text-white font-medium hover:bg-cyan-500 disabled:opacity-50"
                >
                  Pay with NYAX (20% off)
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-sm text-gray-400">
        <p>Accepted payment methods: major credit cards (via Stripe), ETH, or NYAX token (with 20% discount).</p>
        <p className="mt-1">Note: Network fees apply to on-chain payments. Ensure you are on the correct chain. Configure receiver address and chain via env.</p>
      </div>
    </div>
    </>
  );
}
