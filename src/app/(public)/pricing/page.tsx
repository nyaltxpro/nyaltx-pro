"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAccount, useSendTransaction, useWriteContract, useSwitchChain } from "wagmi";
import { parseEther, erc20Abi, parseUnits } from "viem";
import PublicHeader from "@/components/PublicHeader";
import { useAppKit } from "@reown/appkit/react";
import ConnectWalletButton from "@/components/ConnectWalletButton";
import { TokenETH, TokenIcon } from "@web3icons/react";

// Pricing tiers in USD (Race to Liberty tiers)
const TIERS = [
  { id: "paddle", name: "Paddle Boat", description: "1 week on Recently Updated.", priceUSD: 300 },
  { id: "motor", name: "Motor Boat", description: "1 month placement.", priceUSD: 500 },
  { id: "helicopter", name: "Helicopter", description: "3 months placement.", priceUSD: 700 },
];

// Payment configuration (with sensible defaults per request)
const DEFAULT_RECEIVER: `0x${string}` = "0x81bA7b98E49014Bff22F811E9405640bC2B39cC0";
const DEFAULT_NYAX: `0x${string}` = "0x5eed5621b92be4473f99bacac77acfa27deb57d9"; // NYAX on Ethereum
// Default USDT (Tether) on Ethereum mainnet
const DEFAULT_USDT: `0x${string}` = (process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS as `0x${string}` | undefined) ??
  ("0xdAC17F958D2ee523a2206206994597C13D831ec7" as `0x${string}`);

const RECEIVER = (process.env.NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS as `0x${string}` | undefined) ?? DEFAULT_RECEIVER;
const NYAX_TOKEN = (process.env.NEXT_PUBLIC_NYAX_TOKEN_ADDRESS as `0x${string}` | undefined) ?? DEFAULT_NYAX;
const USDT_TOKEN = DEFAULT_USDT;
const PAYMENT_CHAIN_ID = process.env.NEXT_PUBLIC_PAYMENT_CHAIN_ID ? Number(process.env.NEXT_PUBLIC_PAYMENT_CHAIN_ID) : undefined;
const FALLBACK_ETH_PRICE = process.env.NEXT_PUBLIC_FALLBACK_ETH_PRICE ? Number(process.env.NEXT_PUBLIC_FALLBACK_ETH_PRICE) : 3000; // USD per ETH fallback

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
  // Try multiple providers for robustness
  // 1) CoinGecko
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const v = data?.ethereum?.usd;
      if (typeof v === 'number' && v > 0) return v;
    }
  } catch {}

  // 2) Dexscreener (WETH token) — pick highest liquidity pair priceUsd
  try {
    const res = await fetch("https://api.dexscreener.com/latest/dex/tokens/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const pairs = Array.isArray(data?.pairs) ? data.pairs : [];
      if (pairs.length) {
        const best = pairs.reduce((a: any, b: any) => (Number(a?.liquidity?.usd || 0) > Number(b?.liquidity?.usd || 0) ? a : b));
        const price = parseFloat(best?.priceUsd);
        if (!Number.isNaN(price) && price > 0) return price;
      }
    }
  } catch {}

  // 3) Coinbase spot
  try {
    const res = await fetch("https://api.coinbase.com/v2/prices/ETH-USD/spot", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const price = parseFloat(data?.data?.amount);
      if (!Number.isNaN(price) && price > 0) return price;
    }
  } catch {}

  return 0;
}

export default function PricingPage() {
  const { isConnected, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const isPro = useIsPro();
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { open } = useAppKit();
  const router = useRouter();

  // wagmi hooks
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    fetchETHPriceUSD().then(setEthPrice).catch(() => setEthPrice(null));
  }, []);

  useEffect(() => {
    // trigger entrance transitions
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const computeEthAmount = useCallback((usd: number) => {
    const ref = ethPrice && ethPrice > 0 ? ethPrice : (FALLBACK_ETH_PRICE > 0 ? FALLBACK_ETH_PRICE : null);
    if (!ref) return null;
    return usd / ref;
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
    if (!isConnected) { try { open({ view: 'Connect' }); } catch {} return; }
    if (PAYMENT_CHAIN_ID && chain?.id !== PAYMENT_CHAIN_ID) {
      try { await switchChainAsync({ chainId: PAYMENT_CHAIN_ID }); }
      catch { setError("Please switch to the correct chain to pay"); return; }
    }
    let ethAmt = computeEthAmount(priceUSD);
    if (!ethAmt) {
      try {
        const latest = await fetchETHPriceUSD();
        setEthPrice(latest);
        ethAmt = latest > 0 ? priceUSD / latest : null;
      } catch {}
    }
    if (!ethAmt) {
      // last-resort fallback using default fallback price if everything failed
      if (FALLBACK_ETH_PRICE > 0) {
        ethAmt = priceUSD / FALLBACK_ETH_PRICE;
      } else {
        setError("Unable to compute ETH amount. Please try again in a moment.");
        return;
      }
    }

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
    if (!isConnected) { try { open({ view: 'Connect' }); } catch {} return; }
    if (PAYMENT_CHAIN_ID && chain?.id !== PAYMENT_CHAIN_ID) {
      try { await switchChainAsync({ chainId: PAYMENT_CHAIN_ID }); }
      catch { setError("Please switch to the correct chain to pay"); return; }
    }

    // 20% discount
    const discountedUSD = priceUSD * 0.8;

    // For NYAX, assume 1 NYAX = 1 USD unless otherwise specified; if you need market pricing, integrate a price feed.
    // Here we treat NYAX as a stable-like pricing unit for simplicity. Adjust if NYAX has volatility and an oracle is required.
    const nyaxAmountWhole = discountedUSD; // 1 NYAX = $1 assumption

    setError(null);
    setBusy(tierId + ":nyax");
    try {
      // Convert to token units (assume NYAX has 18 decimals)
      const value = parseUnits(discountedUSD.toFixed(6), 18);
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

  const handlePayUSDT = useCallback(async (tierId: string, priceUSD: number) => {
    if (!RECEIVER) { setError("Receiver address not configured"); return; }
    if (!USDT_TOKEN) { setError("USDT token address not configured"); return; }
    if (!isConnected) { try { open({ view: 'Connect' }); } catch {} return; }
    if (PAYMENT_CHAIN_ID && chain?.id !== PAYMENT_CHAIN_ID) {
      try { await switchChainAsync({ chainId: PAYMENT_CHAIN_ID }); }
      catch { setError("Please switch to the correct chain to pay"); return; }
    }

    setError(null);
    setBusy(tierId + ":usdt");
    try {
      // USDT uses 6 decimals on Ethereum
      const value = parseUnits(priceUSD.toFixed(2), 6);
      const hash = await writeContractAsync({
        abi: erc20Abi,
        address: USDT_TOKEN,
        functionName: "transfer",
        args: [RECEIVER, value],
      });
      console.log("USDT payment tx:", hash);
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "USDT payment failed");
    } finally {
      setBusy(null);
    }
  }, [chain?.id, isConnected, writeContractAsync]);

  return (
    <> <PublicHeader />
    <div className="relative">
      {/* Web3 aurora background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute top-40 right-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-7xl md:text-7xl font-extrabold tracking-tight bg-clip-text my-5 p-2 text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">Pricing</h1>
            <p className="text-gray-300 mt-2 max-w-2xl">Start with <strong>NyaltxPro</strong> to unlock your project profile and media. Then upgrade to the <strong>Race to Liberty</strong> campaign for broader visibility.</p>
          </div>
          <div className="flex items-center gap-2">
            {chain?.name && (
              <span className="text-xs px-2 py-1 rounded-full border border-gray-700 bg-black/30 text-gray-300">{chain.name}</span>
            )}
            {/* <ConnectWalletButton /> */}
          </div>
        </div>

      {/* NyaltxPro primary offer */}
      <section aria-labelledby="nyaltxpro" className="mb-10">
        <h2 id="nyaltxpro" className="text-2xl font-bold text-white mb-4">NyaltxPro</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`group relative border border-white/10 rounded-2xl p-5 bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md flex flex-col min-h-[360px] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.4)]`}>
            <span className="absolute -top-2 right-4 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-cyan-600 text-black font-bold shadow shadow-cyan-500/30">Start Here</span>
            <h3 className="text-xl font-semibold mb-1">NyaltxPro Membership</h3>
            <p className="text-gray-400 text-sm mb-4">Unlock your project profile on NYALTX.</p>
            <div className="mb-4">
              <div className="text-3xl font-bold">$200</div>
            </div>
            <ul className="text-sm text-gray-300 space-y-1 mb-4 list-disc pl-5">
              <li>Dedicated project profile page</li>
              <li>Social media links (Twitter/X, Telegram, Website, etc.)</li>
              <li>Embedded project video
                <span className="text-gray-400"> — default video provided if none purchased</span>
              </li>
            </ul>
            <div className="mt-auto flex flex-col gap-2">
              <button
                onClick={() => router.push(`/pricing/checkout/nyaltxpro?method=eth`)}
                className="w-full py-2 rounded-lg border border-zinc-600 text-white font-medium hover:bg-indigo-500"
              >
                <span className="inline-flex items-center gap-2"><Image src="/crypto-icons/color/eth.svg" width={16} height={16} alt="eth"/> Pay $200 with ETH</span>
              </button>
              <button
                onClick={() => router.push(`/pricing/checkout/nyaltxpro?method=usdt`)}
                className="w-full py-2 rounded-lg border border-zinc-600 text-white font-medium hover:bg-emerald-500"
              >
                <span className="inline-flex items-center gap-2"><Image src="/crypto-icons/color/usdt.svg" width={16} height={16} alt="usdt"/> Pay $200 with USDT</span>
              </button>
              <button
                onClick={() => router.push(`/pricing/checkout/nyaltxpro?method=nyax`)}
                className="w-full py-2 rounded-lg border border-zinc-600 text-white font-medium hover:bg-cyan-500"
              >
                <span className="inline-flex items-center gap-2"><Image src="/logo.png" width={16} height={16} alt="nyax"/> Pay $160 with NYAX (20% off)</span>
              </button>
            </div>
            {isPro && (
              <div className="mt-3 text-sm text-cyan-300">
                You have NyaltxPro! Ready to gain more visibility? <a href="#race" className="underline">Upgrade to Race to Liberty</a>.
              </div>
            )}
          </div>

          {/* Visual or banner teaser */}
          <div className="relative border border-white/10 rounded-2xl overflow-hidden">
            <Image src="/banner/1.png" alt="Race to Liberty" fill className="object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="text-white text-xl font-semibold">Race to Liberty</div>
              <p className="text-gray-200 text-sm">After NyaltxPro, boost your exposure with our Statue of Liberty–themed campaign.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Race to Liberty Section */}
      <section id="race" aria-labelledby="race-title" className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 id="race-title" className="text-2xl font-bold text-white">Race to Liberty</h2>
        </div>
        <div className="relative w-full h-40 rounded-xl overflow-hidden mb-6 border border-white/10">
          <Image src="/banner/2.png" alt="Race to Liberty Banner" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {!isPro && (
          <div className="p-4 mb-6 rounded-md border border-amber-400 bg-amber-950/30 text-amber-200">
            <strong>NyaltxPro required:</strong> Please purchase <strong>NyaltxPro</strong> to participate in Race to Liberty tiers.
          </div>
        )}

        {/* Cards */}

      {error && (
        <div className="mb-6 p-3 rounded-md border border-red-500 bg-red-900/30 text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((t, idx) => {
          const ethAmt = ethPrice ? computeEthAmount(t.priceUSD) : null;
          const nyaxUSD = t.priceUSD * 0.8;
          return (
            <div
              key={t.id}
              className={`group relative border border-white/10 rounded-2xl p-5 bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md flex flex-col min-h-[440px] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
              style={{ transitionDelay: mounted ? `${idx * 80}ms` as any : undefined }}
            >
              {/* Ribbon for popular */}
              {t.id === 'motor' && (
                <span className="absolute -top-2 right-4 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-cyan-600 text-black font-bold shadow shadow-cyan-500/30">Most Popular</span>
              )}
              <h2 className="text-xl font-semibold mb-1">{t.name}</h2>
              <p className="text-gray-400 text-sm mb-4">{t.description}</p>
              <div className="mb-4">
                <div className="text-3xl font-bold">${t.priceUSD.toLocaleString()}</div>
                <div className="mt-1 grid grid-cols-1 gap-1 text-xs text-gray-400">
                  <div className="flex items-center gap-2"><TokenETH/> <span>ETH est.: {ethAmt ? `${ethAmt.toFixed(5)} ETH` : "—"}</span></div>
                  <div className="flex items-center gap-2"><Image src="/crypto-icons/color/usdt.svg" alt="USDT" width={20} height={20} className="opacity-60"/> <span>USDT: ${t.priceUSD.toFixed(2)}</span></div>
                  <div className="flex items-center gap-2"><Image src="/logo.png" alt="NYAX" width={20} height={20} className="opacity-60"/> <span>NYAX discounted: ${nyaxUSD.toFixed(2)} (−20%)</span></div>
                </div>
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
                {/* <button
                  disabled={!isPro || busy !== null}
                  onClick={() => handleStripeCheckout(t.id)}
                  className="w-full py-2 rounded-lg bg-white text-black font-medium hover:opacity-90 disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-2"><Image src="/file.svg" width={16} height={16} alt="card"/> Pay with Card (Stripe)</span>
                </button> */}
                <button
                  disabled={!isPro || busy !== null}
                  onClick={() => router.push(`/pricing/checkout/${t.id}?method=eth`)}
                  className="w-full py-2 rounded-lg border border-zinc-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-2"><TokenETH  /> Pay with ETH</span>
                </button>
                <button
                  disabled={!isPro || busy !== null}
                  onClick={() => router.push(`/pricing/checkout/${t.id}?method=usdt`)}
                  className="w-full py-2 rounded-lg border border-zinc-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-2"><Image src="/crypto-icons/color/usdt.svg" width={16} height={16} alt="usdt"/>  Pay with USDT</span>
                </button>
                <button
                  disabled={!isPro || busy !== null}
                  onClick={() => router.push(`/pricing/checkout/${t.id}?method=nyax`)}
                  className="w-full py-2 rounded-lg border border-zinc-600 text-white font-medium hover:bg-cyan-500 disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-2"><Image src="/logo.png" width={16} height={16} alt="nyax"/> Pay with NYAX (20% off)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      </section>

      <div className="mt-10 text-sm text-gray-400">
        <p>Accepted payment methods: major credit cards (via Stripe), ETH, USDT, or NYAX token (with 20% discount).</p>
        <p className="mt-1">On-chain payments are sent to {RECEIVER}. Default NYAX token: {NYAX_TOKEN}. You can override via env vars.</p>
        <p className="mt-1">Note: Network fees apply to on-chain payments. Ensure you are on the correct chain. Configure receiver address, tokens, and chain via env.</p>
      </div>
      </div>
    </div>
    </>
  );
}
