'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PayPalButtons } from '@paypal/react-paypal-js';
import PayPalCheckout from '@/components/PayPalCheckout';
import { useAccount, useSendTransaction, useSwitchChain } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { parseEther } from 'viem';
import ConnectWalletButton from '@/components/ConnectWalletButton';

const RECEIVER_ADDRESS = (process.env.NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS as string) || '0x81bA7b98E49014Bff22F811E9405640bC2B39cC0';
const SOLANA_RECEIVER = (process.env.NEXT_PUBLIC_SOLANA_RECEIVER_ADDRESS as string) || 'GjTfUFXFvL1wKkHQH48Q5hN9aUjR9tZ2oP6mX7y3sW';

interface Slide {
  t: string;
  d: string;
  c: string;
  g: number;
  sp: boolean;
  img?: string | null;
  link?: string;
}

interface NewsItem {
  id?: string;
  t: string;
  s: string;
  c: string;
  tm: string;
  d: string;
  g: number;
  img?: string | null;
  pend?: boolean;
  com?: boolean;
  pr?: boolean;
  link?: string;
  slug?: string;
}

const GRADS = [
  "linear-gradient(135deg,#0e7490,#06b6d4)",
  "linear-gradient(135deg,#4c1d95,#8b5cf6)",
  "linear-gradient(135deg,#9a3412,#f59e0b)",
  "linear-gradient(135deg,#14532d,#22c55e)",
  "linear-gradient(135deg,#1e293b,#475569)"
];

const INITIAL_SLIDES: Slide[] = [
  { t: "Welcome to the NYALTX News Hub", d: "Your home for NYAX updates, crypto headlines and community stories, all in one place.", c: "NYAX", g: 0, sp: false },
  { t: "Got a story? Publish it on NYALTX", d: "Reach crypto readers with a feed listing or a spot in the top banner.", c: "Submit news", g: 1, sp: false },
  { t: "NYAX Community Spotlight: Meet the builders", d: "The people and projects shaping the NYAX ecosystem this month.", c: "Community", g: 3, sp: false },
  { t: "Crypto Weekly: 5 things to watch", d: "Our quick roundup of the stories moving digital markets.", c: "Bitcoin", g: 2, sp: false }
];

const INITIAL_ITEMS: NewsItem[] = [
  { t: "What’s coming next for NYAX: our Q1 roadmap", s: "NYAX Team", c: "NYAX", tm: "Today", d: "A look at the features, listings and community programs planned for the next three months.", g: 0 },
  { t: "How to get started on NYALTX in 5 minutes", s: "NYALTX Learn", c: "NYAX", tm: "Today", d: "A beginner’s walkthrough: create an account, explore the dashboard and follow your first market.", g: 1 },
  { t: "NYAX community AMA: top questions answered", s: "NYAX Team", c: "NYAX", tm: "Yesterday", d: "Highlights from our latest live Q&A, including staking, rewards and platform security.", g: 0 },
  { t: "Bitcoin vs. Ethereum: what’s the difference?", s: "NYALTX Learn", c: "Bitcoin", tm: "Yesterday", d: "A plain-English guide for newcomers on what each network does and why people use them.", g: 2 },
  { t: "What are tokenized securities?", s: "NYALTX Learn", c: "Tokenized Stocks", tm: "2 days ago", d: "Tokenized securities put traditional assets like shares onto the blockchain. Here is how they work and what to watch out for.", g: 3 },
  { t: "Staking 101: how crypto holders earn rewards", s: "NYALTX Learn", c: "DeFi", tm: "3 days ago", d: "What staking is, how rewards work and the risks to understand first.", g: 4 },
  { t: "Five ways to spot a crypto scam", s: "NYALTX Learn", c: "DeFi", tm: "4 days ago", d: "Red flags like guaranteed returns, urgent deadlines and fake giveaways, and how to protect your wallet.", g: 1 },
  { t: "Community post: why I started trading crypto", s: "Community · @sample_member", c: "Community", tm: "5 days ago", d: "A member shares their journey, lessons learned and advice for beginners.", g: 3, com: true }
];

const CATEGORIES = ["All", "NYAX", "Bitcoin", "Ethereum", "DeFi", "Tokenized Stocks", "Community", "Press Releases"];

const PLANS_CONFIG = {
  news: [
    { id: "feed", name: "Direct Distribution", desc: "DO IT YOURSELF · $199 flat rate per release", price: 199 },
    { id: "slider", name: "Full Service", desc: "MOST POPULAR · $499 per release · Banner slider + editorial review", price: 499 }
  ],
  pr: [
    { id: "feed", name: "Direct Distribution", desc: "DO IT YOURSELF · $199 flat rate per release", price: 199 },
    { id: "slider", name: "Full Service", desc: "MOST POPULAR · $499 per release · Banner slider + editorial review", price: 499 }
  ]
};

export default function NewsHubComponent() {
  const [slides, setSlides] = useState<Slide[]>(INITIAL_SLIDES);
  const [items, setItems] = useState<NewsItem[]>(INITIAL_ITEMS);
  const [curSlide, setCurSlide] = useState(0);
  const [selectedCat, setSelectedCat] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrPricingOpen, setIsPrPricingOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [subType, setSubType] = useState<'news' | 'pr'>('news');
  const [plan, setPlan] = useState("feed");
  const [payMethod, setPayMethod] = useState<'paypal' | 'eth' | 'sol' | 'nyax'>('paypal');
  const [cryptoTxHash, setCryptoTxHash] = useState("");
  const [ethPrice, setEthPrice] = useState(3200);
  const [solPrice, setSolPrice] = useState(180);
  const [copiedReceiver, setCopiedReceiver] = useState(false);
  const [selectedSwatch, setSelectedSwatch] = useState(0);
  const [uploadedImg, setUploadedImg] = useState<string | null>(null);

  // Web3 hooks for Connect Wallet & Pay method (same as pricing page)
  const { address: walletAddress, isConnected, chain } = useAccount();
  const { open: openAppKit } = useAppKit();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const [walletPaying, setWalletPaying] = useState(false);

  // Form inputs
  const [headline, setHeadline] = useState("");
  const [category, setCategory] = useState("NYAX");
  const [sourceLink, setSourceLink] = useState("");
  const [summary, setSummary] = useState("");
  const [storyBody, setStoryBody] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [imgError, setImgError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // RSS & Newsletter states
  const [rssCopied, setRssCopied] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);

  // User's own submissions saved locally
  const [mySubmissions, setMySubmissions] = useState<NewsItem[]>([]);

  const editorRef = useRef<HTMLDivElement>(null);

  // Load backend news and local submissions on mount
  useEffect(() => {
    // Check URL query parameters to auto-open submit or PR modal
    if (typeof window !== 'undefined') {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('submit') === 'true' || searchParams.get('modal') === 'submit') {
          setIsModalOpen(true);
          if (searchParams.get('type') === 'pr') {
            setSubType('pr');
          }
        } else if (searchParams.get('pr') === 'pricing' || searchParams.get('pr') === 'true') {
          setIsPrPricingOpen(true);
        }
      } catch {}
    }

    // Load local submissions
    try {
      const stored = localStorage.getItem('nyaltx_news_submissions');
      if (stored) {
        const parsed = JSON.parse(stored);
        setMySubmissions(parsed);
        // Prepend user submissions to items feed
        setItems(prev => [...parsed, ...prev]);
      }
    } catch {}

    // Fetch published news from backend
    fetch('/api/news?limit=20&paid=all')
      .then(res => res.json())
      .then(data => {
        if (data.news && Array.isArray(data.news) && data.news.length > 0) {
          const apiItems: NewsItem[] = data.news.map((n: any, idx: number) => ({
            id: n._id,
            t: n.title,
            s: n.author || "NYALTX",
            c: n.category || (n.tags?.[0]) || "NYAX",
            tm: n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Recently",
            d: n.excerpt,
            g: (idx % GRADS.length),
            img: n.featuredImage || null,
            slug: n.slug
          }));

          // Merge with initial items (avoiding duplicates)
          setItems(prev => {
            const userMine = prev.filter(x => x.pend);
            return [...userMine, ...apiItems];
          });

          // Check if there are featured banner articles from backend
          const bannerItems = data.news.filter((n: any) => n.featuredInBanner);
          if (bannerItems.length > 0) {
            const apiSlides: Slide[] = bannerItems.map((n: any, idx: number) => ({
              t: n.title,
              d: n.excerpt,
              c: n.category || "Featured",
              g: idx % GRADS.length,
              sp: n.tags?.includes('Sponsored') || n.plan === 'prem',
              img: n.featuredImage || null,
              link: `/news/${n.slug}`
            }));
            setSlides(prev => [...apiSlides, ...prev]);
          }
        }
      })
      .catch(() => {});

    // Fetch crypto prices
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana&vs_currencies=usd')
      .then(r => r.json())
      .then(d => {
        if (d?.ethereum?.usd) setEthPrice(d.ethereum.usd);
        if (d?.solana?.usd) setSolPrice(d.solana.usd);
      })
      .catch(() => {});
  }, []);

  // Slider auto-rotate
  useEffect(() => {
    if (isModalOpen) return;
    const interval = setInterval(() => {
      setCurSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length, isModalOpen]);

  const bgStyle = (obj: { img?: string | null; g: number }, withOverlay?: boolean) => {
    if (obj.img) {
      const imgBg = `url(${obj.img}) center/cover`;
      return withOverlay ? `linear-gradient(to top, rgba(2,6,12,0.85) 0%, rgba(2,6,12,0.2) 60%), ${imgBg}` : imgBg;
    }
    return GRADS[obj.g % GRADS.length];
  };

  const copyRss = () => {
    const url = "https://www.nyaltx.pro/rss.xml";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setRssCopied(true);
        setTimeout(() => setRssCopied(false), 2500);
      }).catch(() => {
        alert("RSS URL:\n" + url);
      });
    } else {
      alert("RSS URL:\n" + url);
    }
  };

  const handleSubscribeNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
    } catch {}
    setNewsletterStatus("Subscribed! Check your inbox.");
    setNewsletterEmail("");
    setTimeout(() => setNewsletterStatus(null), 4000);
  };

  const openM = (type: 'news' | 'pr' = 'news', selectedPlan?: string) => {
    setSubType(type);
    setPlan(selectedPlan || 'feed');
    setModalStep(1);
    setIsModalOpen(true);
    setIsPrPricingOpen(false);
    setFormError("");
    setImgError("");
    setCryptoTxHash("");
  };

  const closeM = () => {
    setIsModalOpen(false);
  };

  // Image upload handling
  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2097152) {
      setImgError("File is over 2 MB. Please compress it.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 1200 || img.height < 450) {
          setImgError(`Image is ${img.width}×${img.height}. Minimum size is 1200×450 px.`);
          setUploadedImg(null);
          e.target.value = "";
          return;
        }
        setImgError("");
        setUploadedImg(reader.result as string);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Rich text actions
  const execFmt = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setStoryBody(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  const handleLinkPrompt = () => {
    const url = prompt("Enter Link URL (https://...):");
    if (url) execFmt('createLink', url);
  };

  const validateStep1 = () => {
    const titleOk = headline.trim().length >= 8;
    const summaryOk = summary.trim().length >= 10;
    const bodyContent = editorRef.current ? editorRef.current.textContent?.trim() || "" : storyBody.trim();
    const bodyOk = bodyContent.length >= 30;

    if (!titleOk || !summaryOk || !bodyOk) {
      setFormError("Please add a headline (8+ chars), a short summary (10+ chars), and at least a few sentences of story (30+ chars).");
      return;
    }
    setFormError("");
    setModalStep(2);
  };

  // Price calculation
  const currentPlans = PLANS_CONFIG[subType];
  const activePlanObj = currentPlans.find(p => p.id === plan) || currentPlans[0];
  const basePrice = activePlanObj.price;
  const finalPrice = payMethod === 'nyax' ? (basePrice * 0.9) : basePrice;

  const handlePayAndSubmit = async (paymentOverride?: {
    paymentMethod?: 'paypal' | 'eth' | 'sol' | 'nyax';
    paymentId?: string;
    txHash?: string;
    walletAddress?: string;
    paymentStatus?: string;
    amount?: number;
  }) => {
    setIsSubmitting(true);
    setFormError("");

    if (!userEmail.trim() || !userEmail.includes('@')) {
      setFormError("Please enter a valid contact email address.");
      setIsSubmitting(false);
      return;
    }

    const currentPayMethod = paymentOverride?.paymentMethod || payMethod;
    if ((currentPayMethod === 'eth' || currentPayMethod === 'sol' || currentPayMethod === 'nyax') && !paymentOverride?.txHash && !cryptoTxHash.trim()) {
      setFormError("Please paste your transaction hash / signature after sending your payment.");
      setIsSubmitting(false);
      return;
    }

    const bodyHtml = editorRef.current ? editorRef.current.innerHTML : storyBody;
    const chosenAmount = paymentOverride?.amount ?? finalPrice;

    const submissionPayload = {
      title: headline.trim(),
      type: subType,
      category,
      summary: summary.trim(),
      content: bodyHtml,
      sourceUrl: sourceLink.trim() || null,
      featuredImage: uploadedImg,
      coverColor: selectedSwatch,
      author: subType === 'pr' ? 'Press Release' : 'You',
      email: userEmail.trim(),
      plan,
      planName: activePlanObj.name,
      paymentMethod: currentPayMethod,
      amount: chosenAmount,
      txHash: paymentOverride?.txHash || (cryptoTxHash.trim() || null),
      paymentId: paymentOverride?.paymentId || null,
      walletAddress: paymentOverride?.walletAddress || null,
      paymentStatus: paymentOverride?.paymentStatus || 'completed'
    };

    try {
      const response = await fetch('/api/news/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload)
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Submission failed');
      }

      // Add to local items feed with PENDING badge
      const newLocalItem: NewsItem = {
        t: headline.trim(),
        s: subType === 'pr' ? "Press release · You" : "You · just now",
        c: category,
        tm: "Just now",
        d: summary.trim(),
        g: selectedSwatch,
        img: uploadedImg,
        pend: true,
        com: subType !== 'pr',
        pr: subType === 'pr'
      };

      const updatedMine = [newLocalItem, ...mySubmissions];
      setMySubmissions(updatedMine);
      try {
        localStorage.setItem('nyaltx_news_submissions', JSON.stringify(updatedMine));
      } catch {}

      setItems(prev => [newLocalItem, ...prev]);

      // If slider plan chosen, show in slider right away for user
      if (plan !== 'feed') {
        const newSlide: Slide = {
          t: headline.trim(),
          d: summary.trim(),
          c: category,
          g: selectedSwatch,
          img: uploadedImg,
          sp: true
        };
        setSlides(prev => [newSlide, ...prev]);
        setCurSlide(0);
      }

      setModalStep(4);
    } catch (err: any) {
      setFormError(err.message || 'Error submitting story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWalletPay = async () => {
    if (!userEmail.trim() || !userEmail.includes('@')) {
      setFormError("Please enter your contact email address above first.");
      return;
    }

    if (!isConnected) {
      if (openAppKit) {
        openAppKit({ view: 'Connect' });
      }
      return;
    }

    setWalletPaying(true);
    setFormError("");

    try {
      const MAINNET_CHAIN_ID = 1;
      if (chain?.id !== MAINNET_CHAIN_ID && switchChainAsync) {
        try {
          await switchChainAsync({ chainId: MAINNET_CHAIN_ID });
        } catch (swErr) {
          console.warn("Chain switch error or bypassed:", swErr);
        }
      }

      let calculatedEth = finalPrice / (ethPrice || 3200);
      if (calculatedEth < 0.0001) calculatedEth = 0.0001;

      const txHash = await sendTransactionAsync({
        to: RECEIVER_ADDRESS as `0x${string}`,
        value: parseEther(calculatedEth.toFixed(8)),
      });

      if (!txHash) {
        throw new Error("Transaction was rejected or failed to broadcast.");
      }

      await handlePayAndSubmit({
        paymentMethod: 'eth',
        txHash,
        walletAddress: walletAddress || undefined,
        amount: finalPrice,
        paymentStatus: 'completed'
      });
    } catch (err: any) {
      console.error("Wallet payment failed:", err);
      setFormError(err?.shortMessage || err?.message || "Wallet transaction failed or was rejected. You can also send manually and paste the tx hash below.");
    } finally {
      setWalletPaying(false);
    }
  };

  const filteredItems = items.filter(x => {
    if (selectedCat === "All") return true;
    if (selectedCat === "Community") return x.com || x.c === "Community";
    if (selectedCat === "Press Releases") return x.pr || x.c === "Press Releases";
    return x.c === selectedCat;
  });

  return (
    <div className="news-hub-root">
      <style dangerouslySetInnerHTML={{ __html: `
        .news-hub-root {
          --bg: #070b12;
          --card: #0f1623;
          --text: #e6edf6;
          --muted: #8a99ad;
          --border: #1e293b;
          --accent: #06b6d4;
          --accent-ink: #023038;
          --soft: #08222b;
          --danger: #e11d48;
          background: var(--bg);
          color: var(--text);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          min-height: 100vh;
        }
        .wrap { max-width: 1120px; margin: 0 auto; padding: 20px 16px; }
        
        /* Banner Section */
        .nyb {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          min-height: 270px;
          margin-bottom: 24px;
          color: #fff;
          background: linear-gradient(180deg, #0a2a5c 0%, #1560a6 52%, #f59e0b 150%);
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }
        .nyb svg { position: absolute; }
        .nyb .net { inset: 0; width: 100%; height: 100%; }
        .nyb .sk { right: 0; bottom: 0; height: 88%; width: auto; max-width: 78%; }
        .nyb .tk {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 32px;
          background: rgba(2,10,24,0.65);
          backdrop-filter: blur(6px);
          overflow: hidden;
          z-index: 3;
          border-bottom: 1px solid rgba(255,255,255,0.14);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          white-space: nowrap;
        }
        .nyb .tk div {
          display: inline-block;
          padding-left: 100%;
          line-height: 32px;
          animation: mq 32s linear infinite;
        }
        .nyb .tk i { color: #fbbf24; font-style: normal; margin: 0 12px; }
        @keyframes mq { to { transform: translateX(-100%); } }
        .nyb .txt {
          position: relative;
          z-index: 2;
          padding: 48px 24px 0;
          max-width: 560px;
        }
        .nyb .eyebrow {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.28em;
          color: #fde68a;
          text-transform: uppercase;
        }
        .nyb h2 {
          margin: 8px 0 8px;
          font-size: 38px;
          line-height: 1.05;
          letter-spacing: -0.01em;
          font-weight: 800;
        }
        .nyb h2 span { color: #67e8f9; }
        .nyb p {
          margin: 0;
          font-size: 15px;
          opacity: 0.94;
          max-width: 440px;
          line-height: 1.4;
        }
        .nyb .btn {
          position: absolute;
          left: 24px;
          bottom: 22px;
          z-index: 3;
          box-shadow: 0 6px 20px rgba(6,182,212,0.5);
        }
        .nyb .pl { animation: pl 2.4s ease-in-out infinite alternate; }
        .nyb .pl:nth-child(2n) { animation-delay: 0.8s; }
        .nyb .pl:nth-child(3n) { animation-delay: 1.6s; }
        @keyframes pl { from { opacity: 0.35; } to { opacity: 1; } }
        @media(max-width: 560px) {
          .nyb h2 { font-size: 27px; }
          .nyb .sk { opacity: 0.4; max-width: 100%; }
        }

        /* Generic Buttons & Rows */
        .btn {
          border: 1px solid var(--border);
          background: var(--card);
          color: var(--text);
          padding: 9px 15px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .btn:hover { border-color: var(--accent); }
        .btn.pri {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--accent-ink);
        }
        .btn.pri:hover { background: #22d3ee; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

        header.top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        header.top h1 { margin: 0; font-size: 26px; font-weight: 700; }
        header.top .sub { color: var(--muted); font-size: 14px; margin-top: 2px; }

        /* Slider */
        .slider {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--border);
          margin-bottom: 24px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .track { display: flex; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .slide {
          min-width: 100%;
          aspect-ratio: 8/3;
          min-height: 230px;
          padding: 26px 32px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          color: #fff;
          background-position: center;
          background-size: cover;
        }
        .slide h2 { margin: 6px 0; font-size: 25px; max-width: 680px; font-weight: 700; line-height: 1.2; text-shadow: 0 2px 8px rgba(0,0,0,0.6); }
        .slide p { margin: 0 0 10px; max-width: 620px; font-size: 14px; opacity: 0.92; text-shadow: 0 1px 4px rgba(0,0,0,0.6); }
        .tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 4px 9px;
          border-radius: 99px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(4px);
          width: max-content;
        }
        .tag.sp { background: #facc15; color: #422006; font-weight: 800; }
        .dots {
          position: absolute;
          right: 20px;
          bottom: 16px;
          display: flex;
          gap: 6px;
          z-index: 5;
        }
        .dot {
          width: 9px;
          height: 9px;
          border-radius: 99px;
          background: rgba(255,255,255,0.4);
          border: 0;
          padding: 0;
          cursor: pointer;
          transition: all 0.2s;
        }
        .dot.on { background: #fff; width: 22px; }
        .arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0,0,0,0.45);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.1);
          width: 40px;
          height: 40px;
          border-radius: 99px;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          z-index: 5;
        }
        .arrow:hover { background: rgba(6,182,212,0.8); }
        .arrow.l { left: 12px; }
        .arrow.r { right: 12px; }

        /* Grid Layout */
        .grid {
          display: grid;
          grid-template-columns: 1fr 310px;
          gap: 20px;
        }
        @media(max-width: 860px) {
          .grid { grid-template-columns: 1fr; }
        }

        .chips {
          display: flex;
          gap: 7px;
          overflow-x: auto;
          padding-bottom: 8px;
          margin-bottom: 14px;
        }
        .chip {
          white-space: nowrap;
          border: 1px solid var(--border);
          background: var(--card);
          color: var(--muted);
          padding: 6px 14px;
          border-radius: 99px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .chip:hover { border-color: var(--accent); color: var(--text); }
        .chip.on {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--accent-ink);
          font-weight: 700;
        }

        .item {
          display: flex;
          gap: 14px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 14px;
          margin-bottom: 12px;
          transition: transform 0.2s, border-color 0.2s;
        }
        .item:hover { transform: translateY(-1px); border-color: rgba(6,182,212,0.4); }
        .thumb {
          width: 96px;
          height: 76px;
          border-radius: 10px;
          flex: none;
          background-position: center;
          background-size: cover;
        }
        .item h3 { margin: 0 0 4px; font-size: 15px; font-weight: 600; line-height: 1.35; }
        .meta { font-size: 12px; color: var(--muted); margin-bottom: 4px; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
        .item p { margin: 0; font-size: 13px; color: var(--muted); line-height: 1.4; }
        .badge {
          font-size: 10px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 6px;
          background: var(--soft);
          color: var(--accent);
          letter-spacing: 0.04em;
        }
        .badge.pend { background: #fef3c7; color: #92400e; }
        .badge.com { background: #ede9fe; color: #6d28d9; }
        .badge.pr { background: #dcfce7; color: #15803d; }

        .side {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .side h4 { margin: 0 0 8px; font-size: 15px; font-weight: 700; }
        .side code {
          display: block;
          background: var(--bg);
          border: 1px solid var(--border);
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 12px;
          word-break: break-all;
          color: var(--accent);
          margin-bottom: 6px;
        }
        .cta {
          background: linear-gradient(135deg, #0891b2, #06b6d4 60%, #22d3ee);
          color: #023038;
          border: 0;
          box-shadow: 0 8px 20px rgba(6,182,212,0.3);
        }
        .cta h4 { color: #023038; font-size: 17px; }
        .cta p { font-size: 13px; margin: 0 0 12px; font-weight: 500; }
        .cta .btn { background: #023038; color: #fff; border: 0; width: 100%; justify-content: center; }
        .cta .btn:hover { background: #044b57; }

        /* Modal Overlay */
        .ov {
          position: fixed;
          inset: 0;
          background: rgba(2,6,12,0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 20px 14px 20px;
          overflow-y: auto;
          z-index: 1000;
        }
        .modal {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 18px;
          width: 100%;
          max-width: 680px;
          padding: 22px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
        }
        .steps { display: flex; gap: 8px; margin: 12px 0 18px; }
        .st {
          flex: 1;
          font-size: 12px;
          text-align: center;
          padding: 7px;
          border-radius: 8px;
          background: var(--bg);
          color: var(--muted);
          font-weight: 600;
        }
        .st.on { background: var(--accent); color: var(--accent-ink); font-weight: 700; }
        
        label { display: block; font-size: 12px; font-weight: 600; color: var(--muted); margin: 12px 0 5px; }
        input, select, textarea, .ed {
          width: 100%;
          background: var(--bg);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 14px;
          box-sizing: border-box;
          outline: none;
        }
        input:focus, select:focus, textarea:focus, .ed:focus { border-color: var(--accent); }
        .ed { min-height: 140px; max-height: 240px; overflow-y: auto; line-height: 1.5; }
        .tb { display: flex; gap: 5px; margin-bottom: 6px; }
        .tb button { padding: 4px 10px; font-size: 12px; }

        .two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media(max-width: 560px) { .two { grid-template-columns: 1fr; } }

        .plan {
          border: 2px solid var(--border);
          border-radius: 14px;
          padding: 14px;
          cursor: pointer;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          transition: all 0.2s;
        }
        .plan:hover { border-color: var(--accent); }
        .plan.on { border-color: var(--accent); background: var(--soft); }
        .plan b { font-size: 16px; color: var(--text); }
        .plan small { color: var(--muted); display: block; margin-top: 3px; font-size: 12px; }

        .sw { display: flex; gap: 8px; margin-top: 6px; }
        .sw i {
          width: 38px;
          height: 28px;
          border-radius: 6px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: transform 0.2s;
        }
        .sw i:hover { transform: scale(1.08); }
        .sw i.on { border-color: #fff; transform: scale(1.08); }

        .sum {
          display: flex;
          justify-content: space-between;
          border-top: 1px dashed var(--border);
          margin-top: 14px;
          padding-top: 12px;
          font-size: 16px;
          font-weight: 700;
        }
        .note { font-size: 12px; color: var(--muted); margin-top: 8px; line-height: 1.4; }
        .err { color: var(--danger); font-size: 12px; min-height: 18px; margin-top: 6px; font-weight: 500; }
        .pv {
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--bg);
          width: 100%;
          background-position: center;
          background-size: cover;
        }
        .foot { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-top: 18px; }

        .disclaimer-box {
          border-top: 1px solid var(--border);
          padding: 24px 0 32px;
          margin-top: 36px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.6;
          text-align: center;
        }
      `}} />

      <div className="wrap">
        {/* Animated New York Alt Exchange Banner */}
        <section className="nyb" aria-label="New York Alt Exchange">
          <svg className="net" viewBox="0 0 800 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs>
              <pattern id="grd" width="26" height="26" patternUnits="userSpaceOnUse">
                <path d="M26 0H0V26" fill="none" stroke="#fff" strokeOpacity={0.08} />
              </pattern>
              <g id="cube">
                <polygon points="0,-10 10,-5 0,0 -10,-5" fill="#a5f3fc" />
                <polygon points="-10,-5 0,0 0,12 -10,7" fill="#0891b2" />
                <polygon points="10,-5 0,0 0,12 10,7" fill="#0e7490" />
              </g>
            </defs>
            <rect width="800" height="260" fill="url(#grd)" />
            <g stroke="#67e8f9" strokeOpacity={0.5} strokeWidth={1.2} fill="none">
              <path d="M430 70L520 45L610 90L700 60M610 90L560 150M610 90L660 170M700 60L740 130L660 170M430 70L480 120L560 150" />
            </g>
            <g fill="#22d3ee">
              <circle className="pl" cx="430" cy="70" r="3.5" />
              <circle className="pl" cx="480" cy="120" r="3.5" />
              <circle className="pl" cx="560" cy="150" r="3.5" />
              <circle className="pl" cx="660" cy="170" r="3.5" />
              <circle className="pl" cx="740" cy="130" r="3.5" />
            </g>
            <use href="#cube" transform="translate(520 45) scale(1.3)" />
            <use href="#cube" transform="translate(610 90) scale(1.3)" />
            <use href="#cube" transform="translate(700 60) scale(1.3)" />
          </svg>

          <svg className="sk" viewBox="0 0 600 230" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
            <defs>
              <linearGradient id="gld" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fde68a" />
                <stop offset="1" stopColor="#f59e0b" />
              </linearGradient>
              <pattern id="win" width="9" height="12" patternUnits="userSpaceOnUse">
                <rect x="2" y="3" width="3" height="4" fill="#fcd34d" opacity={0.8} />
              </pattern>
              <g id="bld">
                <rect x="20" y="130" width="50" height="100" />
                <rect x="80" y="100" width="40" height="130" />
                <rect x="130" y="140" width="60" height="90" />
                <rect x="200" y="70" width="50" height="160" />
                <rect x="260" y="110" width="45" height="120" />
                <rect x="318" y="80" width="54" height="150" />
                <rect x="331" y="50" width="28" height="32" />
                <rect x="341" y="22" width="8" height="30" />
                <rect x="385" y="105" width="55" height="125" />
                <rect x="450" y="78" width="45" height="152" />
                <rect x="505" y="130" width="50" height="100" />
                <rect x="562" y="110" width="38" height="120" />
              </g>
              <clipPath id="clp">
                <use href="#bld" />
              </clipPath>
            </defs>
            <circle cx="470" cy="46" r="34" fill="url(#gld)" stroke="#b45309" strokeWidth={3} />
            <circle cx="470" cy="46" r="26" fill="none" stroke="#b45309" strokeWidth={1.5} opacity={0.6} />
            <text x="470" y="58" textAnchor="middle" fontSize={34} fontWeight={800} fill="#92400e" fontFamily="Georgia,serif">N</text>
            <g fill="#0a1a33"><use href="#bld" /></g>
            <rect width="600" height="230" fill="url(#win)" clipPath="url(#clp)" />
            <g fill="#16325c" stroke="#67e8f9" strokeOpacity={0.6}>
              <polygon points="52,170 115,140 178,170" />
              <rect x="52" y="170" width="126" height="8" />
              <rect x="48" y="214" width="134" height="16" />
            </g>
            <g fill="#e2e8f0">
              <rect x="60" y="180" width="9" height="34" />
              <rect x="80" y="180" width="9" height="34" />
              <rect x="100" y="180" width="9" height="34" />
              <rect x="121" y="180" width="9" height="34" />
              <rect x="141" y="180" width="9" height="34" />
              <rect x="161" y="180" width="9" height="34" />
            </g>
          </svg>

          {/* Marquee Stock Ticker */}
          <div className="tk" aria-hidden="true">
            <div>
              NEW YORK ALT EXCHANGE<i>●</i>NYAX<i>●</i>BTC<i>●</i>ETH<i>●</i>SOL<i>●</i>DEFI<i>●</i>TOKENIZED STOCKS<i>●</i>PRESS RELEASES<i>●</i>ALT ASSETS<i>●</i>NEW YORK ALT EXCHANGE<i>●</i>NYAX<i>●</i>BTC<i>●</i>ETH<i>●</i>TOKENIZED STOCKS<i>●</i>
            </div>
          </div>

          <div className="txt">
            <div className="eyebrow">NEW YORK ALT EXCHANGE</div>
            <h2>NYALTX <span>News Hub</span></h2>
            <p>Where Wall Street meets Web3: news, press releases and market stories for crypto and alt assets.</p>
          </div>

          <button className="btn pri" onClick={() => openM('news')}>+ Submit news</button>
        </section>

        {/* Top Action Header */}
        <header className="top">
          <div>
            <h1>News Hub</h1>
            <div className="sub">Crypto news, curated by the community.</div>
          </div>
          <div className="row">
            <button className="btn" onClick={() => setIsPrPricingOpen(true)}>
              Press releases & Pricing
            </button>
            <button className="btn" onClick={copyRss} title="Click to copy RSS feed link">
              {rssCopied ? "✓ Link Copied!" : "RSS feed"}
            </button>
            <button className="btn pri" onClick={() => openM('news')}>
              + Submit news
            </button>
          </div>
        </header>

        {/* Featured News Slider */}
        <section className="slider" aria-label="Featured news">
          <div className="track" style={{ transform: `translateX(-${curSlide * 100}%)` }}>
            {slides.map((s, idx) => (
              <div
                key={idx}
                className="slide"
                style={{ background: bgStyle(s, true) }}
              >
                <span className={`tag ${s.sp ? 'sp' : ''}`}>{s.c.toUpperCase()}</span>
                <h2>{s.t}</h2>
                <p>{s.d}</p>
              </div>
            ))}
          </div>

          <button
            className="arrow l"
            onClick={() => setCurSlide(prev => (prev - 1 + slides.length) % slides.length)}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            className="arrow r"
            onClick={() => setCurSlide(prev => (prev + 1) % slides.length)}
            aria-label="Next slide"
          >
            ›
          </button>

          <div className="dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === curSlide ? 'on' : ''}`}
                onClick={() => setCurSlide(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid">
          <main>
            {/* Category Filter Chips */}
            <div className="chips">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  className={`chip ${c === selectedCat ? 'on' : ''}`}
                  onClick={() => setSelectedCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Articles Feed */}
            <div id="feed">
              {filteredItems.length === 0 ? (
                <div className="side" style={{ textAlign: 'center', padding: '36px 16px' }}>
                  <p style={{ color: 'var(--muted)', margin: 0 }}>No stories in this category yet.</p>
                </div>
              ) : (
                filteredItems.map((item, idx) => (
                  <article key={idx} className="item">
                    <div
                      className="thumb"
                      style={{ background: bgStyle(item) }}
                    />
                    <div style={{ flex: 1 }}>
                      <div className="meta">
                        {item.pend && <span className="badge pend">PENDING REVIEW</span>}
                        {item.com && <span className="badge com">COMMUNITY</span>}
                        {item.pr && <span className="badge pr">PRESS RELEASE</span>}
                        <span className="badge">{item.c}</span>
                        <span>{item.s} · {item.tm}</span>
                      </div>
                      <h3>
                        {item.slug ? (
                          <Link href={`/news/${item.slug}`} className="hover:text-cyan-400">
                            {item.t}
                          </Link>
                        ) : (
                          item.t
                        )}
                      </h3>
                      <p>{item.d}</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside>
            <div className="side cta">
              <h4>Got news? Get seen.</h4>
              <p>Publish your story to the NYALTX feed or land a spot in the top banner slider.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="btn" onClick={() => openM('news')}>Submit a story</button>
                <button
                  className="btn"
                  style={{ background: 'rgba(2, 48, 56, 0.5)', borderColor: 'rgba(2, 48, 56, 0.8)', color: '#023038', fontWeight: 700 }}
                  onClick={() => setIsPrPricingOpen(true)}
                >
                  Press Release Pricing ($199+) →
                </button>
              </div>
            </div>

            <div className="side">
              <h4>Subscribe via RSS</h4>
              <code>https://www.nyaltx.pro/rss.xml</code>
              <div className="note">
                Filters: <span style={{ display: 'inline-block', background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px', margin: '2px' }}>?tag=nyax</span> <span style={{ display: 'inline-block', background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px', margin: '2px' }}>?tag=btc</span>
              </div>
            </div>

            <div className="side">
              <h4>Weekly newsletter</h4>
              <div className="meta" style={{ marginBottom: '8px' }}>
                Get the week’s top NYAX and crypto stories in your inbox.
              </div>
              <form onSubmit={handleSubscribeNewsletter}>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn pri" style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }}>
                  Subscribe
                </button>
              </form>
              {newsletterStatus && <div className="note" style={{ color: 'var(--accent)' }}>{newsletterStatus}</div>}
            </div>

            <div className="side">
              <h4>My submissions</h4>
              <div id="mine">
                {mySubmissions.length === 0 ? (
                  <div className="meta">No submissions yet. Your stories and their status will show here.</div>
                ) : (
                  mySubmissions.map((m, i) => (
                    <div key={i} className="meta" style={{ marginBottom: '8px', alignItems: 'flex-start' }}>
                      <span className="badge pend" style={{ flexShrink: 0 }}>PENDING</span>
                      <span style={{ color: 'var(--text)', fontSize: '13px' }}>{m.t}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="side">
              <h4>Sources</h4>
              <div className="meta">NYAX team · NYALTX Learn · Community submissions · Google News Syndication</div>
            </div>
          </aside>
        </div>

        {/* Legal Disclaimer */}
        <footer className="disclaimer-box">
          <p>
            Stories on this page are provided for general information only and are not financial, legal or investment advice.
            Community and sponsored stories are written by third parties, and NYALTX does not endorse or verify their claims.
            Always do your own research.
          </p>
        </footer>
      </div>

      {/* Press Release Pricing & Distribution Modal */}
      {isPrPricingOpen && (
        <div className="ov" role="dialog" aria-modal="true" style={{ alignItems: 'center' }}>
          <div className="modal" style={{ maxWidth: '860px', maxHeight: '92vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <button
                type="button"
                className="btn"
                onClick={() => setIsPrPricingOpen(false)}
                style={{ fontSize: '12px' }}
              >
                ← Back to News Hub
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setIsPrPricingOpen(false)}
                style={{ padding: '4px 10px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.25em', color: '#fde68a', textTransform: 'uppercase', marginBottom: '8px' }}>
                NYALTX PRESS RELEASES
              </div>
              <h2 style={{ fontSize: '30px', fontWeight: 800, margin: '0 0 10px', color: '#fff', lineHeight: 1.2 }}>
                Get your announcement in front of crypto & digital-markets readers
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '580px', margin: '0 auto', lineHeight: 1.5 }}>
                Submit a release and choose how you publish. Live on the NYALTX News Hub, featured in our rotating top banner, and distributed across Web3 channels.
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              {/* Card 1: Direct Distribution */}
              <div style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                    DO IT YOURSELF
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px', color: '#fff' }}>Direct Distribution</h3>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent)', margin: '10px 0 16px' }}>
                    $199 <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--muted)' }}>flat rate per release</span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.4 }}>
                    Ideal for teams with finished releases ready to post directly to NYALTX News Hub, RSS, and social syndication.
                  </p>

                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#e2e8f0', marginBottom: '20px' }}>
                    <div>✓ Unlimited word count</div>
                    <div>✓ Goes live on NYALTX News Hub after quick compliance</div>
                    <div>✓ Included in our RSS feed and weekly newsletter</div>
                    <div>✓ Shared on NYALTX social channels</div>
                    <div>✓ Live in under 24 hours</div>
                    <div>✓ Full editorial review and headline help</div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn"
                  onClick={() => openM('pr', 'feed')}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontWeight: 700, borderRadius: '10px' }}
                >
                  Start DIY release ($199)
                </button>
              </div>

              {/* Card 2: Full Service */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(8, 145, 178, 0.15) 0%, rgba(15, 22, 35, 0.95) 100%)',
                border: '2px solid var(--accent)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: '0 10px 30px rgba(6, 182, 212, 0.2)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  background: 'var(--accent)',
                  color: 'var(--accent-ink)',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '99px',
                  letterSpacing: '0.05em'
                }}>
                  MOST POPULAR
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#facc15', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                    MOST POPULAR
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px', color: '#fff' }}>Full Service</h3>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#38bdf8', margin: '10px 0 16px' }}>
                    $499 <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--muted)' }}>per release</span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '16px', lineHeight: 1.4 }}>
                    Publish your press release on NYALTX, in our RSS feed and newsletter, and push it out through our distribution network. Write it yourself or let our editors polish it first.
                  </p>

                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#f1f5f9', marginBottom: '20px' }}>
                    <div style={{ fontWeight: 600, color: '#67e8f9' }}>✓ Everything in Direct Distribution</div>
                    <div>✓ Pinned slot in the top banner slider for 7 days</div>
                    <div>✓ Wire and partner network delivery (when connected)</div>
                    <div>✓ Target by topic or region</div>
                    <div>✓ Support for tables and charts</div>
                    <div>✓ Priority review within 12 hours</div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn pri"
                  onClick={() => openM('pr', 'slider')}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontWeight: 700, borderRadius: '10px' }}
                >
                  Start Full Service ($499)
                </button>
              </div>
            </div>

            {/* Where your release appears */}
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#fff' }}>Where your release appears</h4>
              <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 14px' }}>
                Distribution channels for your story:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span className="badge" style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--card)', border: '1px solid var(--border)' }}>🏛️ NYALTX News Hub + Slider</span>
                <span className="badge" style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--card)', border: '1px solid var(--border)' }}>📡 RSS Feed Syndication</span>
                <span className="badge" style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--card)', border: '1px solid var(--border)' }}>✉️ Weekly Investor Newsletter</span>
                <span className="badge" style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--card)', border: '1px solid var(--border)' }}>📱 X · Telegram · LinkedIn</span>
                <span className="badge" style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--card)', border: '1px dashed var(--border)', opacity: 0.8 }}>🌐 Newswire Partner Network (TBD)</span>
                <span className="badge" style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--card)', border: '1px dashed var(--border)', opacity: 0.8 }}>📊 Crypto Aggregators (TBD)</span>
              </div>
            </div>

            {/* How it works */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '14px', marginBottom: '4px' }}>1 · Submit</div>
                <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Paste or upload your release with cover image and summary.</div>
              </div>
              <div>
                <div style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '14px', marginBottom: '4px' }}>2 · Review</div>
                <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Admin verifies payment and checks for accuracy and compliance.</div>
              </div>
              <div>
                <div style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '14px', marginBottom: '4px' }}>3 · Distribute</div>
                <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Goes live immediately on NYALTX News Hub and top banner slider!</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="ov" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: '10px' }}>
              <b style={{ fontSize: '19px', fontWeight: 700 }}>Submit your news</b>
              <button className="btn" onClick={closeM} style={{ padding: '4px 10px' }}>✕</button>
            </div>

            {/* Stepper Header */}
            <div className="steps">
              <div className={`st ${modalStep >= 1 ? 'on' : ''}`}>1 · Write</div>
              <div className={`st ${modalStep >= 2 ? 'on' : ''}`}>2 · Package</div>
              <div className={`st ${modalStep >= 3 ? 'on' : ''}`}>3 · Pay</div>
              <div className={`st ${modalStep >= 4 ? 'on' : ''}`}>4 · Done</div>
            </div>

            {/* Step 1: Write */}
            {modalStep === 1 && (
              <div>
                <label>What are you submitting?</label>
                <select
                  value={subType}
                  onChange={(e) => {
                    const t = e.target.value as 'news' | 'pr';
                    setSubType(t);
                    setPlan('feed');
                  }}
                >
                  <option value="news">News story</option>
                  <option value="pr">Press release</option>
                </select>

                <label>Headline</label>
                <input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  maxLength={110}
                  placeholder="e.g. NYAX launches staking rewards v2"
                />

                <div className="two">
                  <div>
                    <label>Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option>NYAX</option>
                      <option>Bitcoin</option>
                      <option>Ethereum</option>
                      <option>DeFi</option>
                      <option>Tokenized Stocks</option>
                      <option>Community</option>
                      <option>Press Releases</option>
                    </select>
                  </div>
                  <div>
                    <label>Source link (optional)</label>
                    <input
                      value={sourceLink}
                      onChange={(e) => setSourceLink(e.target.value)}
                      placeholder="https://original-article-or-pr.com"
                    />
                  </div>
                </div>

                <label>Short summary (shown in feed)</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  maxLength={180}
                  placeholder="One or two sentences shown in the newsfeed (max 180 characters)..."
                />

                <label>Story</label>
                <div className="tb">
                  <button type="button" className="btn" onClick={() => execFmt('bold')}><b>B</b></button>
                  <button type="button" className="btn" onClick={() => execFmt('italic')}><i>I</i></button>
                  <button type="button" className="btn" onClick={() => execFmt('insertUnorderedList')}>• List</button>
                  <button type="button" className="btn" onClick={handleLinkPrompt}>Link</button>
                </div>
                <div
                  ref={editorRef}
                  className="ed"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => setStoryBody(e.currentTarget.innerHTML)}
                  data-placeholder="Write your full story here..."
                />

                <label>Cover image (optional)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImgChange}
                />
                <div className="note">
                  <b>Slider banner:</b> 1600×600 px (minimum 1200×450, 8:3 ratio) · <b>Feed thumbnail:</b> auto-cropped to 600×450 (4:3) · JPG, PNG or WebP · max 2 MB. Keep key content centered.
                </div>

                {/* Previews */}
                <div className="two" style={{ marginTop: '10px' }}>
                  <div>
                    <div className="meta">Slider preview</div>
                    <div
                      className="pv"
                      style={{
                        aspectRatio: '8/3',
                        background: uploadedImg ? `url(${uploadedImg}) center/cover` : GRADS[selectedSwatch]
                      }}
                    />
                  </div>
                  <div>
                    <div className="meta">Feed thumbnail</div>
                    <div
                      className="pv"
                      style={{
                        aspectRatio: '4/3',
                        background: uploadedImg ? `url(${uploadedImg}) center/cover` : GRADS[selectedSwatch]
                      }}
                    />
                  </div>
                </div>
                {imgError && <div className="err">{imgError}</div>}

                <label>No image? Pick a cover color</label>
                <div className="sw">
                  {GRADS.map((g, idx) => (
                    <i
                      key={idx}
                      className={idx === selectedSwatch ? 'on' : ''}
                      style={{ background: g }}
                      onClick={() => {
                        setSelectedSwatch(idx);
                        setUploadedImg(null);
                      }}
                    />
                  ))}
                </div>

                {formError && <div className="err">{formError}</div>}

                <div className="foot">
                  <span className="note">Stories are reviewed before going live.</span>
                  <button className="btn pri" onClick={validateStep1}>Continue</button>
                </div>
              </div>
            )}

            {/* Step 2: Package */}
            {modalStep === 2 && (
              <div>
                <label style={{ fontSize: '14px', marginBottom: '10px' }}>Select your promotion package</label>
                {currentPlans.map(p => (
                  <div
                    key={p.id}
                    className={`plan ${p.id === plan ? 'on' : ''}`}
                    onClick={() => setPlan(p.id)}
                  >
                    <div>
                      <b>{p.name}</b>
                      <small>{p.desc}</small>
                    </div>
                    <b>${p.price}</b>
                  </div>
                ))}

                <div className="foot">
                  <button className="btn" onClick={() => setModalStep(1)}>Back</button>
                  <button className="btn pri" onClick={() => setModalStep(3)}>Continue to payment</button>
                </div>
              </div>
            )}

            {/* Step 3: Pay */}
            {modalStep === 3 && (
              <div>
                <label>Your Contact Email (for editorial updates & live notification) *</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                />

                <label style={{ marginTop: '14px' }}>Select Payment Method</label>
                <div className="chips">
                  <button
                    type="button"
                    className={`chip ${payMethod === 'paypal' ? 'on' : ''}`}
                    onClick={() => setPayMethod('paypal')}
                  >
                    🅿️ PayPal & Cards
                  </button>
                  <button
                    type="button"
                    className={`chip ${payMethod === 'eth' ? 'on' : ''}`}
                    onClick={() => setPayMethod('eth')}
                  >
                    ⟠ ETH / Crypto
                  </button>
                  <button
                    type="button"
                    className={`chip ${payMethod === 'sol' ? 'on' : ''}`}
                    onClick={() => setPayMethod('sol')}
                  >
                    ◎ Solana (SOL)
                  </button>
                  <button
                    type="button"
                    className={`chip ${payMethod === 'nyax' ? 'on' : ''}`}
                    onClick={() => setPayMethod('nyax')}
                  >
                    ⚡ NYAX Token (10% off)
                  </button>
                </div>

                <div className="sum" style={{ marginTop: '12px', marginBottom: '14px' }}>
                  <span>{activePlanObj.name} {payMethod === 'nyax' ? '(10% NYAX Discount applied)' : ''}</span>
                  <span style={{ color: 'var(--accent)', fontSize: '20px' }}>${finalPrice.toFixed(2)} USD</span>
                </div>

                {/* PayPal View - exact full PayPal checkout component as used on pricing checkout */}
                {payMethod === 'paypal' && (
                  <div style={{ marginTop: '10px', marginBottom: '16px' }}>
                    <div className="note" style={{ marginBottom: '12px', color: '#93c5fd' }}>
                      💳 Pay securely with PayPal balance, Credit Card, or Debit Card. Your story will be submitted for admin review immediately upon completion.
                    </div>
                    {!userEmail.trim() || !userEmail.includes('@') ? (
                      <div className="err" style={{ marginBottom: '8px' }}>
                        Please enter a valid email address above to enable PayPal checkout.
                      </div>
                    ) : (
                      <div style={{ minHeight: '110px', maxWidth: '420px', margin: '0 auto' }}>
                        <PayPalCheckout
                          amount={finalPrice.toFixed(2)}
                          tier={`${subType}_${plan}`}
                          email={userEmail.trim()}
                          onSuccess={(details: any) => {
                            handlePayAndSubmit({
                              paymentMethod: 'paypal',
                              paymentId: details.id,
                              amount: finalPrice,
                              paymentStatus: 'completed'
                            });
                          }}
                          onError={(err: any) => {
                            console.error('PayPal error:', err);
                            setFormError(err?.message || 'PayPal payment was cancelled or failed. Please try again or use crypto.');
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* ETH / Crypto View: Connect Wallet & Pay */}
                {payMethod === 'eth' && (
                  <div style={{ marginTop: '12px', marginBottom: '14px' }}>
                    <div className="note" style={{ marginBottom: '10px', color: '#67e8f9' }}>
                      ⟠ Connect your wallet to pay directly with ETH on Ethereum, or send to our official treasury.
                    </div>

                    <div style={{ padding: '10px 14px', background: 'var(--soft)', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Total to pay:</div>
                        <div style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                          ~{(finalPrice / (ethPrice || 3200)).toFixed(4)} ETH <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600 }}>(${finalPrice.toFixed(2)} USD)</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', background: 'var(--card)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border)', color: '#38bdf8' }}>
                          Ethereum Mainnet
                        </span>
                      </div>
                    </div>

                    {/* Connect Wallet & Pay Button */}
                    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                      {!isConnected ? (
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '0 0 12px' }}>
                            Connect your Web3 wallet (MetaMask, Coinbase, WalletConnect) to pay on-chain in 1 click:
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <ConnectWalletButton />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Connected Wallet:</span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#22d3ee', fontFamily: 'monospace' }}>
                              ● {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connected'}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn pri"
                            onClick={handleWalletPay}
                            disabled={walletPaying}
                            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontWeight: 700, borderRadius: '8px', fontSize: '14px' }}
                          >
                            {walletPaying ? 'Sending On-Chain Payment...' : `⚡ Pay $${finalPrice.toFixed(2)} with Connected Wallet`}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Or Manual Transfer Option */}
                    <details style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px' }}>
                      <summary style={{ cursor: 'pointer', fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
                        Or send manually to Treasury address & paste TXID ▾
                      </summary>
                      <div style={{ marginTop: '10px' }}>
                        <label>Official NYALTX Payment Address (EVM / ERC-20):</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                          <code style={{ flex: 1, padding: '10px 12px', fontSize: '12px', borderRadius: '8px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {RECEIVER_ADDRESS}
                          </code>
                          <button
                            type="button"
                            className="btn"
                            onClick={() => {
                              navigator.clipboard?.writeText(RECEIVER_ADDRESS);
                              setCopiedReceiver(true);
                              setTimeout(() => setCopiedReceiver(false), 2000);
                            }}
                          >
                            {copiedReceiver ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>

                        <label>Transaction Hash (TXID) after sending *</label>
                        <input
                          placeholder="0x... (paste your transaction hash here)"
                          value={cryptoTxHash}
                          onChange={(e) => setCryptoTxHash(e.target.value)}
                        />
                      </div>
                    </details>
                  </div>
                )}

                {/* Solana View */}
                {payMethod === 'sol' && (
                  <div style={{ marginTop: '12px', marginBottom: '14px' }}>
                    <div className="note" style={{ marginBottom: '10px', color: '#c084fc' }}>
                      ◎ Send SOL to our verified Solana Treasury.
                    </div>
                    <label>Official NYALTX Solana Treasury Address:</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                      <code style={{ flex: 1, padding: '10px 12px', fontSize: '13px', borderRadius: '8px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {SOLANA_RECEIVER}
                      </code>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => {
                          navigator.clipboard?.writeText(SOLANA_RECEIVER);
                          setCopiedReceiver(true);
                          setTimeout(() => setCopiedReceiver(false), 2000);
                        }}
                      >
                        {copiedReceiver ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>

                    <div style={{ padding: '10px 12px', background: 'var(--soft)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Equivalent Amount:</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                        ~{(finalPrice / (solPrice || 180)).toFixed(3)} SOL <span style={{ fontSize: '12px', color: 'var(--accent)' }}>(${finalPrice.toFixed(2)} USD)</span>
                      </div>
                    </div>

                    <label>Solana Transaction Signature (TXID) *</label>
                    <input
                      placeholder="Enter Solana transaction signature..."
                      value={cryptoTxHash}
                      onChange={(e) => setCryptoTxHash(e.target.value)}
                    />
                  </div>
                )}

                {/* NYAX View */}
                {payMethod === 'nyax' && (
                  <div style={{ marginTop: '12px', marginBottom: '14px' }}>
                    <div className="note" style={{ marginBottom: '10px', color: '#fbbf24' }}>
                      ⚡ 10% Discount applied when paying with NYAX tokens!
                    </div>
                    <label>NYAX Token Receiver Address:</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                      <code style={{ flex: 1, padding: '10px 12px', fontSize: '13px', borderRadius: '8px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {RECEIVER_ADDRESS}
                      </code>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => {
                          navigator.clipboard?.writeText(RECEIVER_ADDRESS);
                          setCopiedReceiver(true);
                          setTimeout(() => setCopiedReceiver(false), 2000);
                        }}
                      >
                        {copiedReceiver ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>

                    <label>Transaction Hash (TXID) *</label>
                    <input
                      placeholder="0x..."
                      value={cryptoTxHash}
                      onChange={(e) => setCryptoTxHash(e.target.value)}
                    />
                  </div>
                )}

                <div className="note" style={{ marginTop: '12px' }}>
                  Payments are non-refundable once approved and published. If rejected by compliance, you will receive a full refund.
                </div>

                {formError && <div className="err">{formError}</div>}

                <div className="foot">
                  <button className="btn" onClick={() => setModalStep(2)}>Back</button>
                  {payMethod === 'eth' ? (
                    cryptoTxHash.trim().length > 0 ? (
                      <button
                        className="btn pri"
                        onClick={() => handlePayAndSubmit()}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Story with Manual TX'}
                      </button>
                    ) : null
                  ) : payMethod !== 'paypal' ? (
                    <button
                      className="btn pri"
                      onClick={() => handlePayAndSubmit()}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Story for Review'}
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            {/* Step 4: Done */}
            {modalStep === 4 && (
              <div style={{ textAlign: 'center', padding: '24px 8px' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>✅</div>
                <h3 style={{ fontSize: '20px', margin: '0 0 6px', fontWeight: 700 }}>Story submitted</h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                  Thanks! Your story is now in our moderation queue and shows in your feed as <b>“Pending review”</b>. We usually review stories within 24 hours, and we’ll email you as soon as it goes live.
                </p>
                <button className="btn pri" onClick={closeM} style={{ padding: '10px 24px' }}>
                  Back to news
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
