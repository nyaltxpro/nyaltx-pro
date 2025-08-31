/**
 * Uniswap V2 DEX Integration
 */
import { DexInterface, Token, PriceQuote, SwapRoute, DexConfig, CHAIN_IDS, DEX_PROTOCOL, QuoteParams, SwapParams } from './types';
import { getCryptoIconUrl } from '../../app/utils/cryptoIcons';

// Uniswap V2 configuration
export const UniswapV2Config: DexConfig = {
  id: 'uniswap-v2',
  name: DEX_PROTOCOL.UNISWAP_V2,
  logoURI: '/exchanges/uniswap-uni-logo.png',
  supportedChains: [CHAIN_IDS.ETHEREUM, CHAIN_IDS.POLYGON, CHAIN_IDS.ARBITRUM, CHAIN_IDS.OPTIMISM],
  routerAddress: {
    [CHAIN_IDS.ETHEREUM]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    [CHAIN_IDS.POLYGON]: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff'
  },
  factoryAddress: {
    [CHAIN_IDS.ETHEREUM]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    [CHAIN_IDS.POLYGON]: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32'
  },
  version: '2.0.0'
};

export class UniswapV2 implements DexInterface {
  config: DexConfig;

  constructor() {
    this.config = UniswapV2Config;
  }

  async getQuote(params: QuoteParams): Promise<PriceQuote> {
    try {
      // Mock the output that would come from the SDK
      const outputAmount = (parseFloat(params.amountIn) * 1950 * (1 - Math.random() * 0.02)).toString();
      const fee = '0.3'; // 0.3% fee for Uniswap V2

      const routerAddress = this.config.routerAddress?.[params.chainId] || '';
      
      const swapRoute: SwapRoute = {
        protocol: this.config.name,
        routerAddress,
        path: [params.tokenIn, params.tokenOut],
        amountIn: params.amountIn,
        amountOut: outputAmount,
        priceImpact: (Math.random() * 0.5).toFixed(2),
        fee
      };
      
      return {
        protocol: this.config.name,
        inputAmount: params.amountIn,
        outputAmount,
        executionPrice: (parseFloat(outputAmount) / parseFloat(params.amountIn)).toString(),
        route: swapRoute,
        fee,
        priceImpact: (Math.random() * 0.5).toFixed(2),
      };
    } catch (error) {
      console.error('Error getting quote from Uniswap V2:', error);
      throw error;
    }
  }

  async executeSwap(params: SwapParams): Promise<string> {
    try {
      console.log(`Executing swap on ${this.config.name}:`);
      console.log(`From: ${params.tokenIn.symbol} (${params.tokenIn.address})`);
      console.log(`To: ${params.tokenOut.symbol} (${params.tokenOut.address})`);
      console.log(`Amount: ${params.amountIn}`);
      console.log(`Slippage: ${params.slippageTolerance}%`);
      console.log(`Recipient: ${params.recipient}`);
      console.log(`Deadline: ${params.deadline}`);
      console.log(`Chain ID: ${params.chainId}`);

      // Return mock transaction hash
      return `0x${Math.random().toString(16).substring(2, 42)}`;
    } catch (error) {
      console.error('Error executing swap on Uniswap V2:', error);
      throw error;
    }
  }

  isChainSupported(chainId: number): boolean {
    return this.config.supportedChains.includes(chainId);
  }
}
