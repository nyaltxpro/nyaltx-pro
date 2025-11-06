/**
 * PancakeSwap DEX Integration
 */
import {
  DexInterface,
  Token as AppToken,
  PriceQuote,
  SwapRoute,
  DexConfig,
  CHAIN_IDS,
  DEX_PROTOCOL,
  QuoteParams,
  SwapParams,
} from './types';
import { getCryptoIconUrl } from '../../utils/cryptoIcons';
import { Token, TradeType, Percent, CurrencyAmount } from '@uniswap/sdk-core';
import { Pair, Route, Trade, Router } from '@uniswap/v2-sdk';
import { ethers } from 'ethers';
import { getProvider } from '../blockchain/provider';

// Uniswap V2 Pair ABI for getReserves
const PAIR_ABI = [
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)'
];

// PancakeSwap configuration
export const PancakeSwapConfig: DexConfig = {
  id: 'pancakeswap',
  name: DEX_PROTOCOL.PANCAKESWAP,
  logoURI: '/exchanges/pancakeswap-cake-logo.png',
  supportedChains: [CHAIN_IDS.BSC, CHAIN_IDS.ETHEREUM],
  routerAddress: {
    [CHAIN_IDS.BSC]: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    [CHAIN_IDS.ETHEREUM]: '0xEfF92A263d31888d860bD50809A8D171709b7b1c',
  },
  factoryAddress: {
    [CHAIN_IDS.BSC]: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    [CHAIN_IDS.ETHEREUM]: '0x1097053Fd2ea711dad45caCcc45EfF7548fCB362',
  },
  version: '2.0.0',
};

export class PancakeSwap implements DexInterface {
  config: DexConfig;

  constructor() {
    this.config = PancakeSwapConfig;
  }

  async getQuote(params: QuoteParams): Promise<PriceQuote> {
    try {
      // Convert our app's token format to Uniswap SDK token format
      const fromToken = new Token(
        params.tokenIn.chainId,
        params.tokenIn.address,
        params.tokenIn.decimals,
        params.tokenIn.symbol,
        params.tokenIn.name
      );

      const toToken = new Token(
        params.tokenOut.chainId,
        params.tokenOut.address,
        params.tokenOut.decimals,
        params.tokenOut.symbol,
        params.tokenOut.name
      );

      // Get provider for the chain
      const provider = getProvider(params.chainId);
      if (!provider) {
        throw new Error(`Provider not available for chain ${params.chainId}`);
      }

      // Get pair address
      const pairAddress = Pair.getAddress(fromToken, toToken);

      // Create pair contract
      const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);

      // Get reserves from contract
      const reserves = await pairContract.getReserves();

      // Create pair with reserves
      const pair = new Pair(
        CurrencyAmount.fromRawAmount(fromToken, reserves[0]),
        CurrencyAmount.fromRawAmount(toToken, reserves[1])
      );

      // Create route with input and output tokens
      const route = new Route([pair], fromToken, toToken);

      // Create a trade with the route
      const trade = new Trade(
        route,
        CurrencyAmount.fromRawAmount(fromToken, params.amountIn),
        TradeType.EXACT_INPUT
      );

      const outputAmount = trade.outputAmount.toExact();
      const fee = '0.25'; // 0.25% fee for PancakeSwap
      const priceImpact = trade.priceImpact.toSignificant(3);

      const routerAddress = this.config.routerAddress?.[params.chainId] || '';

      const swapRoute: SwapRoute = {
        protocol: this.config.name,
        routerAddress,
        path: [params.tokenIn, params.tokenOut],
        amountIn: params.amountIn,
        amountOut: outputAmount,
        priceImpact,
        fee,
      };

      return {
        protocol: this.config.name,
        inputAmount: params.amountIn,
        outputAmount,
        executionPrice: trade.executionPrice.toSignificant(6),
        route: swapRoute,
        fee,
        priceImpact,
      };
    } catch (error) {
      console.error('Error getting quote from PancakeSwap:', error);
      throw error;
    }
  }

  async executeSwap(params: SwapParams): Promise<string> {
    try {
      // For now, return a mock transaction hash
      // In a full implementation, we would build the actual swap transaction
      console.log(`Executing swap on ${this.config.name}:`);
      console.log(`From: ${params.tokenIn.symbol} (${params.tokenIn.address})`);
      console.log(`To: ${params.tokenOut.symbol} (${params.tokenOut.address})`);
      console.log(`Amount: ${params.amountIn}`);
      console.log(`Slippage: ${params.slippageTolerance}%`);
      console.log(`Recipient: ${params.recipient}`);
      console.log(`Deadline: ${params.deadline}`);
      console.log(`Chain ID: ${params.chainId}`);

      // Return mock transaction hash for now
      return `0x${Math.random().toString(16).substring(2, 42)}`;
    } catch (error) {
      console.error('Error executing swap on PancakeSwap:', error);
      throw error;
    }
  }

  isChainSupported(chainId: number): boolean {
    return this.config.supportedChains.includes(chainId);
  }
}
