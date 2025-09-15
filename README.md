This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Cryptic
# Cryptic

## Pricing and Payments Setup

This project includes a Pricing page at `src/app/pricing/page.tsx` that supports three payment methods for marketing tiers:

- Card payments via Stripe Checkout
- ETH transfer via your connected wallet (wagmi)
- NYAX ERC‑20 token transfer with a 20% discount

Additionally, users must sign up for NYALTX Pro prior to purchasing tiers. A demo Pro signup lives at `src/app/pro-signup/page.tsx` and simply sets a browser cookie.

### Environment Variables

Create a `.env.local` file in the project root and set the following variables:

```
# Base URL for Stripe redirect (defaults to request origin if not set)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Stripe secret key (required for card payments)
STRIPE_SECRET_KEY=sk_live_or_test_key

# On-chain payments configuration
NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS=0xYourUSDCOrETHReceiverAddress
NEXT_PUBLIC_PAYMENT_CHAIN_ID=1

# NYAX token address (ERC-20) on the configured chain
NEXT_PUBLIC_NYAX_TOKEN_ADDRESS=0xYourNyaxTokenAddress
```

Notes:

- `NEXT_PUBLIC_PAYMENT_CHAIN_ID` should match the chain where you accept ETH/NYAX payments (e.g., `1` for Ethereum mainnet, `8453` for Base, etc.).
- The NYAX payment assumes 18 decimals and a $1 = 1 NYAX mapping for simplicity. If your token has different decimals or a floating price, adjust logic in `src/app/pricing/page.tsx` accordingly.

### Installing Dependencies

Install Stripe SDK used in the Checkout API route:

```
npm install stripe
```

### Implemented Routes and Components

- Pricing page: `src/app/pricing/page.tsx`
- Pro signup page: `src/app/pro-signup/page.tsx`
- Stripe Checkout API route: `src/app/api/checkout/route.ts`
- Header links to Pricing added in `src/components/Header.tsx` and `src/components/HeaderUpdated.tsx`

### Usage

1. Ensure `.env.local` is set.
2. Install dependencies: `npm install`.
3. Run the app: `npm run dev`.
4. Navigate to `/pro-signup` to activate Pro (demo cookie), then go to `/pricing` to purchase a tier with your preferred method.
# nyaltx-pro
