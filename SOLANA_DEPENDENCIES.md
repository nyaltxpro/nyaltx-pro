# Solana Dependencies Installation

To enable native Solana payments with Phantom wallet, install these dependencies:

```bash
npm install @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js
```

Or with yarn:

```bash
yarn add @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js
```

## Required Dependencies:

1. **@solana/wallet-adapter-base** - Base wallet adapter functionality
2. **@solana/wallet-adapter-react** - React hooks for Solana wallets
3. **@solana/wallet-adapter-react-ui** - Pre-built UI components
4. **@solana/wallet-adapter-wallets** - Wallet adapters (Phantom, Solflare, etc.)
5. **@solana/web3.js** - Solana blockchain interaction library

## Environment Variables:

Add to your `.env.local`:

```bash
# Solana Configuration
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SOLANA_RECEIVER_ADDRESS=YourSolanaWalletAddressHere
```

Replace `YourSolanaWalletAddressHere` with your actual Solana wallet address where you want to receive payments.

## Usage:

After installing dependencies, the Solana payment integration will be ready to use with:
- Native SOL payments from Phantom wallet
- Real-time SOL price conversion
- Transaction confirmation on Solana blockchain
- Integration with existing order storage system
