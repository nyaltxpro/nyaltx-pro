#!/usr/bin/env node
/*
 Seed NYAX tokens into the token_registrations collection via the public API
 Usage:
   BASE_URL=http://localhost:3000 node scripts/seedNyaxTokens.js
 or
   npm run seed:nyax
*/

const fs = require('fs');
const path = require('path');

const FILE = path.join(process.cwd(), 'nyax-tokens-data.json');
const BASE_URL = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Map NYAX network labels to our API's blockchain slugs
const mapNetworkToChain = (network) => {
  if (!network) return null;
  const key = String(network).toLowerCase().trim();
  const mapping = {
    'ethereum': 'ethereum',
    'eth': 'ethereum',
    'erc20': 'ethereum',
    'bsc': 'binance',
    'binance': 'binance',
    'binance smart chain': 'binance',
    'polygon': 'polygon',
    'matic': 'polygon',
    'avalanche': 'avalanche',
    'avax': 'avalanche',
    'fantom': 'fantom',
    'base': 'base',
    'arbitrum': 'arbitrum',
    'arbitrum one': 'arbitrum',
    'optimism': 'optimism',
    'solana': 'solana',
  };
  return mapping[key] || key;
};

async function main() {
  console.log(`[seedNyaxTokens] Using BASE_URL=${BASE_URL}`);
  if (!fs.existsSync(FILE)) {
    console.error(`[seedNyaxTokens] File not found: ${FILE}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(FILE, 'utf-8');
  const json = JSON.parse(raw);
  const tokens = Array.isArray(json?.tokens) ? json.tokens : [];
  console.log(`[seedNyaxTokens] Found ${tokens.length} tokens in nyax file`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const t of tokens) {
    const tokenName = t.name || t.symbol || 'Unknown';
    const tokenSymbol = (t.symbol || '').toUpperCase();
    const blockchain = mapNetworkToChain(t.network);
    const contractAddress = (t.contractAddress || '').trim();

    if (!tokenSymbol || !blockchain || !contractAddress) {
      console.warn(`[skip] Missing fields for ${tokenSymbol || tokenName} — chain=${blockchain} addr=${contractAddress}`);
      skipped++;
      continue;
    }

    const body = {
      tokenName,
      tokenSymbol,
      blockchain,
      contractAddress,
      imageUri: t.logo || undefined,
      website: t.website || undefined,
      twitter: t.twitter || undefined,
      telegram: t.telegram || undefined,
      discord: t.discord || undefined,
      github: undefined,
      submittedByAddress: undefined,
    };

    try {
      const res = await fetch(`${BASE_URL}/api/tokens/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 409) {
        const d = await res.json().catch(() => ({}));
        console.log(`[dup] ${tokenSymbol} on ${blockchain} already exists`);
        skipped++;
        continue;
      }
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error(`[fail] ${tokenSymbol} on ${blockchain} — ${res.status} ${res.statusText} ${text}`);
        failed++;
        continue;
      }
      success++;
      if (success % 10 === 0) console.log(`[seed] Inserted ${success} so far...`);
      // small delay to avoid hammering
      await new Promise(r => setTimeout(r, 100));
    } catch (e) {
      console.error(`[error] ${tokenSymbol} on ${blockchain}:`, e?.message || e);
      failed++;
    }
  }

  console.log(`[seedNyaxTokens] Done. success=${success} skipped=${skipped} failed=${failed}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error('[seedNyaxTokens] Unexpected error:', e);
  process.exit(1);
});
