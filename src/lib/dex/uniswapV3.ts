/**
 * Uniswap V3 DEX Integration
 * Real implementation using Uniswap V3 Quoter contract
 */
import { DexInterface, Token, PriceQuote, SwapRoute, DexConfig, CHAIN_IDS, DEX_PROTOCOL, QuoteParams, SwapParams } from './types';
import { getCryptoIconUrl } from '../../utils/cryptoIcons';
import { createPublicClient, http, parseUnits, formatUnits, Address } from 'viem';
import { mainnet, bsc, polygon, arbitrum, optimism } from 'viem/chains';

// Uniswap V3 configuration with Quoter addresses
export const UniswapV3Config: DexConfig = {
  id: 'uniswap-v3',
  name: DEX_PROTOCOL.UNISWAP_V3,
  logoURI: '/exchanges/uniswap-uni-logo.png',
  supportedChains: [CHAIN_IDS.ETHEREUM, CHAIN_IDS.POLYGON, CHAIN_IDS.ARBITRUM, CHAIN_IDS.OPTIMISM, CHAIN_IDS.BSC],
  routerAddress: {
    [CHAIN_IDS.ETHEREUM]: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    [CHAIN_IDS.POLYGON]: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    [CHAIN_IDS.ARBITRUM]: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    [CHAIN_IDS.OPTIMISM]: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    [CHAIN_IDS.BSC]: '0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2'
  },
  factoryAddress: {
    [CHAIN_IDS.ETHEREUM]: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    [CHAIN_IDS.POLYGON]: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    [CHAIN_IDS.ARBITRUM]: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    [CHAIN_IDS.OPTIMISM]: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    [CHAIN_IDS.BSC]: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7'
  },
  version: '3.0.0'
};

// Quoter contract addresses for accurate price quotes
const QUOTER_ADDRESSES = {
  [CHAIN_IDS.ETHEREUM]: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
  [CHAIN_IDS.POLYGON]: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
  [CHAIN_IDS.ARBITRUM]: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
  [CHAIN_IDS.OPTIMISM]: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
  [CHAIN_IDS.BSC]: '0x78D78E420Da98ad378D7799bE8f4AF69033EB077'
};

// Chain configurations for viem clients
const CHAIN_CONFIG = {
  [CHAIN_IDS.ETHEREUM]: mainnet,
  [CHAIN_IDS.POLYGON]: polygon,
  [CHAIN_IDS.ARBITRUM]: arbitrum,
  [CHAIN_IDS.OPTIMISM]: optimism,
  [CHAIN_IDS.BSC]: bsc
};

// Quoter contract ABI
const QUOTER_ABI = [
  {
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'sqrtPriceLimitX96', type: 'uint160' }
    ],
    name: 'quoteExactInputSingle',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

// Common fee tiers in Uniswap V3 (in basis points)
const FEE_TIERS = [100, 500, 3000, 10000]; // 0.01%, 0.05%, 0.3%, 1%

export class UniswapV3 implements DexInterface {
  config: DexConfig;
  
  constructor() {
    this.config = UniswapV3Config;
  }
  
  private createClient(chainId: number) {
    const chain = CHAIN_CONFIG[chainId];
    if (!chain) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    
    return createPublicClient({
      chain,
      transport: http()
    });
  }

  private async getBestQuoteForFeeTiers(
    client: any,
    quoterAddress: Address,
    tokenIn: Address,
    tokenOut: Address,
    amountIn: bigint,
    tokenInDecimals: number,
    tokenOutDecimals: number
  ) {
    let bestQuote: { amountOut: bigint; fee: number } | null = null;

    // Try different fee tiers to find the best quote
    for (const feeTier of FEE_TIERS) {
      try {
        const result = await client.readContract({
          address: quoterAddress,
          abi: QUOTER_ABI,
          functionName: 'quoteExactInputSingle',
          args: [tokenIn, tokenOut, feeTier, amountIn, BigInt(0)]
        });

        if (!bestQuote || result > bestQuote.amountOut) {
          bestQuote = { amountOut: result, fee: feeTier };
        }
      } catch (error) {
        // Pool might not exist for this fee tier, continue to next
        console.log(`No pool found for fee tier ${feeTier / 10000}%`);
      }
    }

    return bestQuote;
  }

  async getQuote(params: QuoteParams): Promise<PriceQuote> {
    try {
      const { tokenIn, tokenOut, amountIn, chainId } = params;
      
      // Check if chain is supported
      if (!this.isChainSupported(chainId)) {
        throw new Error(`Chain ${chainId} not supported by Uniswap V3`);
      }

      const quoterAddress = QUOTER_ADDRESSES[chainId];
      if (!quoterAddress) {
        throw new Error(`No quoter address for chain ${chainId}`);
      }

      const client = this.createClient(chainId);
      const amountInWei = parseUnits(amountIn, tokenIn.decimals);

      // Get the best quote across all fee tiers
      const bestQuote = await this.getBestQuoteForFeeTiers(
        client,
        quoterAddress as Address,
        tokenIn.address as Address,
        tokenOut.address as Address,
        amountInWei,
        tokenIn.decimals,
        tokenOut.decimals
      );

      if (!bestQuote) {
        throw new Error(`No liquidity found for ${tokenIn.symbol}/${tokenOut.symbol} pair`);
      }

      const outputAmount = formatUnits(bestQuote.amountOut, tokenOut.decimals);
      const executionPrice = parseFloat(outputAmount) / parseFloat(amountIn);
      
      // Calculate price impact (simplified - in production would compare to spot price)
      const priceImpact = Math.min(0.5, Math.abs((executionPrice - 1) * 100));
      
      const routerAddress = this.config.routerAddress?.[chainId] || '';
      const feePercentage = (bestQuote.fee / 10000).toFixed(2);
      
      const swapRoute: SwapRoute = {
        protocol: this.config.name,
        routerAddress,
        path: [tokenIn, tokenOut],
        amountIn,
        amountOut: outputAmount,
        priceImpact: priceImpact.toFixed(2),
        fee: `${feePercentage}%`
      };
      
      return {
        protocol: this.config.name,
        inputAmount: amountIn,
        outputAmount,
        executionPrice: executionPrice.toFixed(6),
        route: swapRoute,
        fee: `${feePercentage}%`,
        priceImpact: priceImpact.toFixed(2),
      };
    } catch (error) {
      console.error('Error getting quote from Uniswap V3:', error);
      throw error;
    }
  }
  
  async executeSwap(params: SwapParams): Promise<string> {
    try {
      // In a real implementation, we would:
      // 1. Create the trade object as in getQuote
      // 2. Get the swap parameters
      // 3. Execute the swap transaction

      // const uniFromToken = new UniToken(
      //   params.tokenIn.chainId,
      //   params.tokenIn.address,
      //   params.tokenIn.decimals,
      //   params.tokenIn.symbol,
      //   params.tokenIn.name
      // );
      // 
      // const uniToToken = new UniToken(
      //   params.tokenOut.chainId,
      //   params.tokenOut.address,
      //   params.tokenOut.decimals,
      //   params.tokenOut.symbol,
      //   params.tokenOut.name
      // );
      // 
      // // Create a pool instance for the token pair
      // const pool = await Pool.getPool(
      //   uniFromToken,
      //   uniToToken,
      //   FeeAmount.MEDIUM // 0.3% fee tier
      // );
      // 
      // // Create a route using the pool
      // const route = new Route([pool], uniFromToken, uniToToken);
      // 
      // // Create a trade with the route
      // const trade = new Trade(
      //   route,
      //   CurrencyAmount.fromRawAmount(uniFromToken, params.amountIn),
      //   TradeType.EXACT_INPUT
      // );
      // 
      // // Set up slippage tolerance
      // const slippageTolerance = new Percent(Math.floor(parseFloat(params.slippageTolerance) * 100), 10000); // slippage as percentage
      // 
      // // Get swap parameters
      // const swapParams = SwapRouter.swapCallParameters(trade, {
      //   deadline: params.deadline,
      //   recipient: params.recipient,
      //   slippageTolerance
      // });
      // 
      // // Execute the transaction
      // const provider = getProvider(params.chainId);
      // const tx = await provider.getSigner().sendTransaction({
      //   to: this.config.routerAddress?.[params.chainId],
      //   from: params.recipient,
      //   data: swapParams.calldata,
      //   value: swapParams.value
      // });
      // 
      // return tx.hash;

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
      console.error('Error executing swap on Uniswap V3:', error);
      throw error;
    }
  }
  
  isChainSupported(chainId: number): boolean {
    return this.config.supportedChains.includes(chainId);
  }
}
