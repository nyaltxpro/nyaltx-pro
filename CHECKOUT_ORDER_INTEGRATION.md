# Checkout Order Integration Guide

## Overview
This guide shows how to integrate order storage into the checkout components after successful payments.

## Files Created/Updated

### 1. Order Storage API
- **`/api/admin/orders/route.ts`** - Admin endpoint for viewing orders
- **`/api/orders/create/route.ts`** - Public endpoint for creating orders
- **`/utils/orderStorage.ts`** - Utility functions for storing orders

### 2. Admin Interface
- **`/page-components/Admin/Orders.tsx`** - New comprehensive orders management page
- **`/admin/orders/page.tsx`** - Updated to use new component

### 3. Integration Required

#### RaceToLibertyCheckout.tsx
Add this import at the top:
```typescript
import { storeRaceToLibertyOrder } from '@/utils/orderStorage';
```

Update the payment handlers to store orders after successful transactions:

**For ETH Payment (around line 244):**
```typescript
console.log('ETH payment tx:', hash);

// Store order after successful payment
await storeRaceToLibertyOrder({
  paymentMethod: 'eth',
  txHash: hash,
  amount: ethAmt.toFixed(6),
  currency: 'ETH',
  chainId: PAYMENT_CHAIN_ID,
  walletAddress: address,
  email: email || undefined,
  tier: tier,
  tierInfo: tierInfo,
  selectedCoin: selectedCoin,
  coinName: coins.find(c => c.symbol === selectedCoin)?.name,
  totalPoints: totalPoints,
  promoCode: promoApplied ? promoCode : undefined,
  promoDiscount: promoApplied ? promoDiscount : undefined,
  finalAmount: finalAmount,
  boostMultiplier: selectedCoin ? coins.find(c => c.symbol === selectedCoin)?.boostMultiplier : undefined
});

// Redirect to success page
const successUrl = `/pricing/race-to-liberty/success?tier=${tier}&token=${selectedCoin}&txHash=${hash}&method=eth&points=${totalPoints}${promoApplied ? `&promo=${promoCode}` : ''}`;
router.push(successUrl);
```

**For NYAX Payment (around line 288):**
```typescript
console.log('NYAX payment tx:', hash);

// Store order after successful payment
await storeRaceToLibertyOrder({
  paymentMethod: 'nyax',
  txHash: hash,
  amount: discountedUSD.toFixed(6),
  currency: 'NYAX',
  chainId: PAYMENT_CHAIN_ID,
  walletAddress: address,
  email: email || undefined,
  tier: tier,
  tierInfo: tierInfo,
  selectedCoin: selectedCoin,
  coinName: coins.find(c => c.symbol === selectedCoin)?.name,
  totalPoints: totalPoints,
  promoCode: promoApplied ? promoCode : undefined,
  promoDiscount: promoApplied ? promoDiscount : undefined,
  finalAmount: finalAmount,
  boostMultiplier: selectedCoin ? coins.find(c => c.symbol === selectedCoin)?.boostMultiplier : undefined
});

// Redirect to success page
const successUrl = `/pricing/race-to-liberty/success?tier=${tier}&token=${selectedCoin}&txHash=${hash}&method=nyax&points=${totalPoints}${promoApplied ? `&promo=${promoCode}` : ''}`;
router.push(successUrl);
```

**For USDT Payment (around line 330):**
```typescript
console.log('USDT payment tx:', hash);

// Store order after successful payment
await storeRaceToLibertyOrder({
  paymentMethod: 'usdt',
  txHash: hash,
  amount: finalAmount.toFixed(2),
  currency: 'USDT',
  chainId: PAYMENT_CHAIN_ID,
  walletAddress: address,
  email: email || undefined,
  tier: tier,
  tierInfo: tierInfo,
  selectedCoin: selectedCoin,
  coinName: coins.find(c => c.symbol === selectedCoin)?.name,
  totalPoints: totalPoints,
  promoCode: promoApplied ? promoCode : undefined,
  promoDiscount: promoApplied ? promoDiscount : undefined,
  finalAmount: finalAmount,
  boostMultiplier: selectedCoin ? coins.find(c => c.symbol === selectedCoin)?.boostMultiplier : undefined
});

// Redirect to success page
const successUrl = `/pricing/race-to-liberty/success?tier=${tier}&token=${selectedCoin}&txHash=${hash}&method=usdt&points=${totalPoints}${promoApplied ? `&promo=${promoCode}` : ''}`;
router.push(successUrl);
```

#### PayPal Success Handler
For PayPal payments, add order storage to the `handlePayPalSuccess` function:

```typescript
const handlePayPalSuccess = async (details: any) => {
  try {
    // Store order after successful PayPal payment
    await storeRaceToLibertyOrder({
      paymentMethod: 'paypal',
      paymentId: details?.id,
      amount: finalAmount.toFixed(2),
      currency: 'USD',
      walletAddress: address,
      email: email || undefined,
      tier: tier,
      tierInfo: tierInfo,
      selectedCoin: selectedCoin,
      coinName: coins.find(c => c.symbol === selectedCoin)?.name,
      totalPoints: totalPoints,
      promoCode: promoApplied ? promoCode : undefined,
      promoDiscount: promoApplied ? promoDiscount : undefined,
      finalAmount: finalAmount,
      boostMultiplier: selectedCoin ? coins.find(c => c.symbol === selectedCoin)?.boostMultiplier : undefined
    });

    // Redirect to success page
    const successUrl = `/pricing/race-to-liberty/success?tier=${tier}&token=${selectedCoin}&paymentId=${details?.id}&method=paypal&points=${totalPoints}${promoApplied ? `&promo=${promoCode}` : ''}`;
    router.push(successUrl);
  } catch (error) {
    console.error('PayPal success handling error:', error);
    setError(`Payment successful, but processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
```

#### Free Promo Code Handler
For free promo codes, add order storage to the `handleFreePromoClaim` function:

```typescript
// Store order for free promo claim
await storeRaceToLibertyOrder({
  paymentMethod: 'free_promo',
  amount: '0.00',
  currency: 'USD',
  walletAddress: address,
  email: email || undefined,
  tier: tier,
  tierInfo: tierInfo,
  selectedCoin: selectedCoin,
  coinName: coins.find(c => c.symbol === selectedCoin)?.name,
  totalPoints: totalPoints,
  promoCode: promoCode,
  promoDiscount: promoDiscount,
  finalAmount: finalAmount,
  boostMultiplier: selectedCoin ? coins.find(c => c.symbol === selectedCoin)?.boostMultiplier : undefined
});

// Redirect to success page
const successUrl = `/pricing/race-to-liberty/success?tier=${tier}&token=${selectedCoin}&promo=${promoCode}&points=${totalPoints}&free=true`;
router.push(successUrl);
```

## Admin Features

### Orders Management
- **View All Orders**: Comprehensive table with filtering and search
- **Order Details**: Modal with complete order information
- **Transaction Links**: Direct links to blockchain explorers
- **Revenue Tracking**: Summary statistics and revenue totals
- **Status Management**: Track order status (completed, pending, failed, refunded)

### Filtering Options
- **Type**: Race to Liberty, Boost Pack, Pro Subscription, Token Registration
- **Status**: Completed, Pending, Failed, Refunded
- **Payment Method**: ETH, USDT, NYAX, PayPal, Stripe, Free Promo
- **Search**: By order ID, email, wallet address, transaction hash

### Order Information Stored
- **Payment Details**: Method, amount, currency, transaction hash
- **Customer Info**: Email, wallet address, user ID
- **Product Details**: Type, tier, token information
- **Promo Codes**: Applied codes and discount amounts
- **Metadata**: Boost points, multipliers, duration
- **Timestamps**: Created, updated, completed dates

## Benefits

1. **Complete Order Tracking**: All payments are now stored and trackable
2. **Admin Visibility**: Comprehensive admin interface for order management
3. **Revenue Analytics**: Track total revenue and payment method distribution
4. **Customer Support**: Easy lookup of customer orders and transaction details
5. **Audit Trail**: Complete history of all transactions and payments
6. **Promo Code Tracking**: Monitor promo code usage and effectiveness

## Next Steps

1. Apply the integration code to RaceToLibertyCheckout.tsx
2. Test all payment methods to ensure orders are stored correctly
3. Verify admin interface shows orders properly
4. Add similar integration to other checkout components (Web3Checkout, BoostPackSelector)
5. Consider adding order status updates and refund functionality
