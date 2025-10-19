'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  FaChevronDown,
  FaCog,
  FaExchangeAlt,
  FaFire,
  FaInfoCircle,
  FaSearch,
  FaSync,
  FaTimes,
} from 'react-icons/fa';

import { getTrendingCoins } from '@/api/coingecko/client';
import ExchangeSelector from '@/components/ExchangeSelector';
import NetworkSelector from '@/components/NetworkSelector';
import { dexManager } from '@/lib/dex/dexManager';
import { CHAIN_IDS, DEX_PROTOCOL, DexInterface, PriceQuote, Token } from '@/lib/dex/types';
import { getCryptoIconUrl } from '@/utils/cryptoIcons';
import { useAppKit } from '@reown/appkit/react';
import toast from 'react-hot-toast';
import { erc20Abi, isAddress, parseUnits, type Address } from 'viem';
import {
  useAccount,
  usePublicClient,
  useSwitchChain,
  useChainId as useWagmiChainId,
  useWriteContract,
} from 'wagmi';

// Network definitions for UI display
const networks = [
  { id: CHAIN_IDS.ETHEREUM, name: 'Ethereum', icon: '/ethereum.svg', color: '#627EEA' },
  { id: CHAIN_IDS.POLYGON, name: 'Polygon', icon: '/polygon.svg', color: '#8247E5' },
  { id: CHAIN_IDS.ARBITRUM, name: 'Arbitrum', icon: '/arbitrum.svg', color: '#28A0F0' },
  { id: CHAIN_IDS.OPTIMISM, name: 'Optimism', icon: '/optimism.svg', color: '#FF0420' },
  { id: CHAIN_IDS.BSC, name: 'BNB Chain', icon: '/bnb.svg', color: '#F0B90B' },
  { id: CHAIN_IDS.AVALANCHE, name: 'Avalanche', icon: '/avalanche.svg', color: '#E84142' },
  { id: CHAIN_IDS.SOLANA, name: 'Solana', icon: '/solana.svg', color: '#14F195' },
];

// Native placeholder used in this component to denote native coin
const NATIVE_PLACEHOLDER = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

// PancakeSwap routers (subset matching the user's example + common deployments)
const PANCAKE_ROUTERS: Record<number, Address> = {
  1: '0xEfF92A263d31888d860bD50809A8D171709b7b1c', // Ethereum
  56: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // BSC
  42161: '0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb', // Arbitrum
};

// Wrapped native tokens per chain
const WETH_BY_CHAIN: Record<number, Address> = {
  1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  56: '0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095C', // WBNB
  42161: '0x82aF49447D8a07e3bd95BD0d56f35241523FBab1', // WETH (Arbitrum)
};

// Common tokens per supported chain (symbol -> address/decimals)
const TOKEN_MAP: Record<number, Record<string, { address: Address; decimals: number }>> = {
  1: {
    ETH: { address: WETH_BY_CHAIN[1], decimals: 18 },
    USDT: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
    USDC: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
    DAI: { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
    WBTC: { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
    LINK: { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18 },
    UNI: { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18 },
    AAVE: { address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', decimals: 18 },
    BNB: { address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52', decimals: 18 },
  },
  56: {
    BNB: { address: WETH_BY_CHAIN[56], decimals: 18 },
    USDT: { address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
    USDC: { address: '0x8AC76a51cc950d9822D68b83Fe1Ad97B32Cd580d', decimals: 18 },
    DAI: { address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', decimals: 18 },
    WBTC: { address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', decimals: 18 },
  },
  42161: {
    ETH: { address: WETH_BY_CHAIN[42161], decimals: 18 },
    USDT: { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6 },
    USDC: { address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831', decimals: 6 },
    DAI: { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', decimals: 18 },
    WBTC: { address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', decimals: 8 },
  },
};

// Minimal router ABI for required calls
const routerAbi = [
  {
    type: 'function',
    name: 'getAmountsOut',
    stateMutability: 'view',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'path', type: 'address[]' },
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
  },
  {
    type: 'function',
    name: 'swapExactTokensForTokens',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
  },
  {
    type: 'function',
    name: 'swapExactETHForTokens',
    stateMutability: 'payable',
    inputs: [
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
  },
  {
    type: 'function',
    name: 'swapExactTokensForETH',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
  },
] as const;

interface SwapPageProps {
  inTradeView?: boolean;
  baseToken?: string;
  quoteToken?: string;
}

export default function SwapPage({ inTradeView = false, baseToken, quoteToken }: SwapPageProps) {
  const { open } = useAppKit();
  const router = useRouter();
  const [darkMode] = useState(true);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectingToken, setSelectingToken] = useState<'from' | 'to'>('from');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExchange, setSelectedExchange] = useState<DexInterface | null>(null);
  const [availableExchanges, setAvailableExchanges] = useState<DexInterface[]>([]);
  const [chainId, setChainId] = useState<number>(CHAIN_IDS.ETHEREUM);
  const [quotes, setQuotes] = useState<PriceQuote[]>([]);
  const [bestQuote, setBestQuote] = useState<PriceQuote | null>(null);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [trendingCoins, setTrendingCoins] = useState<any[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const [trendingError, setTrendingError] = useState<string | null>(null);
  const account = useAccount();
  const walletChainId = useWagmiChainId();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [isSwapping, setIsSwapping] = useState(false);


  // Token selection state
  const [fromToken, setFromToken] = useState<Token>({
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: baseToken || 'ETH',
    name: baseToken ? baseToken : 'Ethereum',
    decimals: 18,
    chainId: CHAIN_IDS.ETHEREUM,
    logoURI: getCryptoIconUrl(baseToken?.toLowerCase() || 'eth'),
  });

  const [toToken, setToToken] = useState<Token>({
    address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
    symbol: quoteToken || 'BNB',
    name: quoteToken ? quoteToken : 'BNB',
    decimals: 18,
    chainId: CHAIN_IDS.ETHEREUM,
    logoURI: getCryptoIconUrl(quoteToken?.toLowerCase() || 'bnb'),
  });

  // Token list with proper Token interface
  const tokenList: Token[] = [
    {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      chainId: chainId,
      logoURI: getCryptoIconUrl('eth'),
    },
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      name: 'Tether',
      decimals: 6,
      chainId: chainId,
      logoURI: getCryptoIconUrl('usdt'),
    },
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: chainId,
      logoURI: getCryptoIconUrl('usdc'),
    },
    {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      chainId: chainId,
      logoURI: getCryptoIconUrl('btc'),
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      name: 'Dai',
      decimals: 18,
      chainId: chainId,
      logoURI: getCryptoIconUrl('dai'),
    },
    {
      address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      symbol: 'LINK',
      name: 'Chainlink',
      decimals: 18,
      chainId: chainId,
      logoURI: getCryptoIconUrl('link'),
    },
    {
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      symbol: 'UNI',
      name: 'Uniswap',
      decimals: 18,
      chainId: chainId,
      logoURI: getCryptoIconUrl('uni'),
    },
    {
      address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
      symbol: 'AAVE',
      name: 'Aave',
      decimals: 18,
      chainId: chainId,
      logoURI: getCryptoIconUrl('aave'),
    },
  ];

  // Initialize available exchanges and select default exchange
  useEffect(() => {
    const exchanges = dexManager.getDexList();
    setAvailableExchanges(exchanges);

    // Set default exchange to Uniswap V3 if available
    const defaultExchange = exchanges.find(ex => ex.config.name === DEX_PROTOCOL.UNISWAP_V3);
    if (defaultExchange) {
      setSelectedExchange(defaultExchange);
    } else if (exchanges.length > 0) {
      setSelectedExchange(exchanges[0]);
    }
  }, []);

  // Fetch trending coins
  useEffect(() => {
    const fetchTrendingCoins = async () => {
      try {
        setIsLoadingTrending(true);
        setTrendingError(null);
        const data = await getTrendingCoins();
        if (data && data.coins) {
          setTrendingCoins(data.coins.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching trending coins:', error);
        setTrendingError('Failed to load trending coins');
      } finally {
        setIsLoadingTrending(false);
      }
    };

    fetchTrendingCoins();
  }, []);

  // Get quotes when inputs change
  useEffect(() => {
    const getQuotes = async () => {
      if (
        !fromAmount ||
        parseFloat(fromAmount) <= 0 ||
        !fromToken ||
        !toToken ||
        !selectedExchange
      ) {
        setQuotes([]);
        setBestQuote(null);
        return;
      }

      setIsLoadingQuotes(true);

      try {
        const allQuotes = await dexManager.getAllQuotes({
          tokenIn: fromToken,
          tokenOut: toToken,
          amountIn: fromAmount,
          slippageTolerance: slippage,
          chainId: chainId,
        });

        setQuotes(allQuotes);

        // Find best quote
        const best = allQuotes.reduce(
          (best, current) => {
            if (!best || parseFloat(current.outputAmount) > parseFloat(best.outputAmount)) {
              return current;
            }
            return best;
          },
          null as PriceQuote | null
        );

        setBestQuote(best);

        // Update to amount based on selected exchange
        if (selectedExchange) {
          const selectedQuote = allQuotes.find(q => q.protocol === selectedExchange.config.name);
          if (selectedQuote) {
            setToAmount(selectedQuote.outputAmount);
          }
        }
      } catch (error) {
        console.error('Error getting quotes:', error);
      } finally {
        setIsLoadingQuotes(false);
      }
    };

    getQuotes();
  }, [fromAmount, fromToken, toToken, selectedExchange, slippage, chainId]);

  // Handle input changes
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromAmount(value);
    // To amount will be updated by the useEffect that fetches quotes
  };

  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setToAmount(value);
    // This is just for UI feedback, actual swaps are always based on exact input
  };

  // --- Swap helpers (Pancake style) ---
  const getRouterAddress = (chain: number): Address | null => PANCAKE_ROUTERS[chain] || null;

  const resolveTokenMeta = (
    token: Token,
    chain: number
  ): { address: Address; decimals: number; isNative: boolean } | null => {
    const isNative = token.address?.toLowerCase() === NATIVE_PLACEHOLDER.toLowerCase();
    if (isNative) {
      const wrapped = WETH_BY_CHAIN[chain];
      if (!wrapped) return null;
      return { address: wrapped, decimals: 18, isNative: true };
    }
    const symbol = (token.symbol || '').toUpperCase();
    const tokenMap = TOKEN_MAP[chain] || {};
    if (tokenMap[symbol]) {
      return { address: tokenMap[symbol].address, decimals: tokenMap[symbol].decimals, isNative: false };
    }
    if (isAddress(token.address as Address)) {
      return { address: token.address as Address, decimals: token.decimals || 18, isNative: false };
    }
    return null;
  };

  const getAmountOutMin = async (
    routerAddr: Address,
    amountIn: bigint,
    path: Address[],
    slipPercent: number
  ): Promise<bigint> => {
    const amounts = (await publicClient?.readContract({
      address: routerAddr,
      abi: routerAbi,
      functionName: 'getAmountsOut',
      args: [amountIn, path],
    })) as readonly bigint[] | undefined;
    if (!amounts || amounts.length < 2) throw new Error('Failed to fetch amounts');
    const out = amounts[amounts.length - 1];
    const bps = Math.floor(slipPercent * 100); // 1% = 100 bps
    return (out * BigInt(10000 - bps)) / BigInt(10000);
  };

  const minOutFromUiQuote = (toDecimals: number, slipPercent: number): bigint => {
    if (!toAmount || Number(toAmount) <= 0) throw new Error('missing_ui_quote');
    const out = parseUnits(toAmount, toDecimals);
    const bps = Math.floor(slipPercent * 100);
    return (out * BigInt(10000 - bps)) / BigInt(10000);
  };

  const approveIfNeeded = async (
    tokenAddr: Address,
    owner: Address,
    spender: Address,
    amount: bigint
  ) => {
    const allowance = (await publicClient?.readContract({
      address: tokenAddr,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [owner, spender],
    })) as bigint | undefined;
    if (!allowance || allowance < amount) {
      const txHash = await writeContractAsync({
        address: tokenAddr,
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender, amount],
      });
      await publicClient?.waitForTransactionReceipt({ hash: txHash });
    }
  };

  const executeSwap = async () => {
    try {
      if (chainId === CHAIN_IDS.SOLANA) {
        toast.error('Solana swaps are not supported in this widget.');
        return;
      }
      const routerAddr = getRouterAddress(chainId);
      if (!routerAddr) {
        toast.error('Selected network not supported by PancakeSwap in this widget.');
        return;
      }
      const user = account?.address as Address | undefined;
      if (!user) {
        toast.error('Please connect your wallet first.');
        return;
      }
      if (!fromAmount || Number(fromAmount) <= 0) {
        toast.error('Enter a valid amount.');
        return;
      }

      // Ensure wallet on correct chain
      if (walletChainId !== chainId) {
        await switchChainAsync({ chainId });
      }

      const fromMeta = resolveTokenMeta(fromToken, chainId);
      const toMeta = resolveTokenMeta(toToken, chainId);
      if (!fromMeta || !toMeta) {
        toast.error('Unsupported token on selected network.');
        return;
      }

      const amountIn = parseUnits(fromAmount, fromMeta.decimals);
      const slip = Math.max(0, Math.min(50, parseFloat(slippage || '0.5'))); // clamp 0-50%
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

      setIsSwapping(true);

      // Native -> Token
      if (fromMeta.isNative && !toMeta.isNative) {
        const path: Address[] = [WETH_BY_CHAIN[chainId], toMeta.address];
        let minOut: bigint;
        try {
          minOut = await getAmountOutMin(routerAddr, amountIn, path, slip);
        } catch {
          minOut = minOutFromUiQuote(toMeta.decimals, slip);
        }
        const txHash = await writeContractAsync({
          address: routerAddr,
          abi: routerAbi,
          functionName: 'swapExactETHForTokens',
          args: [minOut, path, user, BigInt(deadline)],
          value: amountIn,
        });
        await publicClient?.waitForTransactionReceipt({ hash: txHash });
        toast.success('Swap submitted');
        return;
      }

      // Token -> Native
      if (!fromMeta.isNative && toMeta.isNative) {
        await approveIfNeeded(fromMeta.address, user, routerAddr, amountIn);
        const path: Address[] = [fromMeta.address, WETH_BY_CHAIN[chainId]];
        let minOut: bigint;
        try {
          minOut = await getAmountOutMin(routerAddr, amountIn, path, slip);
        } catch {
          minOut = minOutFromUiQuote(18, slip);
        }
        const txHash = await writeContractAsync({
          address: routerAddr,
          abi: routerAbi,
          functionName: 'swapExactTokensForETH',
          args: [amountIn, minOut, path, user, BigInt(deadline)],
        });
        await publicClient?.waitForTransactionReceipt({ hash: txHash });
        toast.success('Swap submitted');
        return;
      }

      // Token -> Token (try direct, fallback via WETH)
      if (!fromMeta.isNative && !toMeta.isNative) {
        await approveIfNeeded(fromMeta.address, user, routerAddr, amountIn);
        let path: Address[] = [fromMeta.address, toMeta.address];
        let minOut: bigint;
        try {
          minOut = await getAmountOutMin(routerAddr, amountIn, path, slip);
        } catch {
          path = [fromMeta.address, WETH_BY_CHAIN[chainId], toMeta.address];
          try {
            minOut = await getAmountOutMin(routerAddr, amountIn, path, slip);
          } catch {
            minOut = minOutFromUiQuote(toMeta.decimals, slip);
          }
        }
        const txHash = await writeContractAsync({
          address: routerAddr,
          abi: routerAbi,
          functionName: 'swapExactTokensForTokens',
          args: [amountIn, minOut, path, user, BigInt(deadline)],
        });
        await publicClient?.waitForTransactionReceipt({ hash: txHash });
        toast.success('Swap submitted');
        return;
      }

      toast.error('Unsupported swap combination.');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.shortMessage || err?.message || 'Swap failed');
    } finally {
      setIsSwapping(false);
    }
  };

  const handlePrimaryAction = async () => {
    if (!account?.address) {
      try {
        await open({ view: 'Connect' });
      } catch (e) {
        // ignore
      }
      return;
    }
    await executeSwap();
  };

  // Swap tokens
  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // Handle exchange selection
  const handleExchangeSelect = (exchange: DexInterface) => {
    setSelectedExchange(exchange);

    // Update the to amount based on the selected exchange's quote
    const selectedQuote = quotes.find(q => q.protocol === exchange.config.name);
    if (selectedQuote) {
      setToAmount(selectedQuote.outputAmount);
    }
  };

  // Handle trending coin selection
  const handleTrendingCoinClick = (coin: any) => {
    const symbol = coin.item.symbol.toUpperCase();

    // Update the from token with the selected trending coin
    setFromToken({
      address: '0x' + Math.random().toString(16).slice(2, 14), // Placeholder address
      symbol: symbol,
      name: coin.item.name,
      decimals: 18,
      chainId: chainId,
      logoURI: coin.item.large || getCryptoIconUrl(symbol.toLowerCase()),
    });

    // Set USDT as the to token if it's not already
    if (toToken.symbol !== 'USDT') {
      setToToken({
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        symbol: 'USDT',
        name: 'Tether',
        decimals: 6,
        chainId: chainId,
        logoURI: getCryptoIconUrl('usdt'),
      });
    }

    // Navigate to the trade page with the selected pair
    if (!inTradeView) {
      router.push(`/trade?base=${symbol}&quote=USDT`);
    }
  };

  // Toggle settings
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Handle slippage change
  const handleSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlippage(e.target.value);
  };

  // Dark mode effect
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`w-full ${inTradeView ? 'h-full' : ''}`}>
      {/* Banner - Only show if not in trade view */}
      {!inTradeView && <div className="mb-4"></div>}

      {/* Main Content */}
      <div className={`${inTradeView ? 'h-full' : 'container mx-auto  py-8'}`}>
        {/* Swap Card */}
        <div className={`${inTradeView ? 'h-full' : 'max-w-md mx-auto'}`}>
          <div
            className={`bg-[#222227] rounded-xl shadow-lg py-3 px-2 ${inTradeView ? 'h-full' : ''}`}
          >
            <div className="flex justify-between px-2 items-center mb-4">
              <h3 className="text-lg font-medium">Swap</h3>
              <div className="flex space-x-2">
                <button
                  onClick={toggleSettings}
                  className="p-2 rounded-full hover:bg-[#111116] transition-colors"
                >
                  <FaCog className="text-gray-400" />
                </button>
                <button className="p-2 rounded-full hover:bg-[#111116] transition-colors">
                  <FaSync className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="mb-4 p-4 bg-[#111116] rounded-lg">
                <h3 className="text-sm font-medium mb-2">Transaction Settings</h3>
                <div className="mb-3">
                  <label className="flex justify-between text-sm mb-1">
                    <span>Slippage Tolerance</span>
                    <span>{slippage}%</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={slippage}
                    onChange={handleSlippageChange}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0.1%</span>
                    <span>5%</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm mb-1 block">Transaction Deadline</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      className="bg-gray-700 rounded-lg p-2 w-20 text-sm"
                      defaultValue={20}
                      min={1}
                    />
                    <span className="ml-2 text-sm text-gray-400">minutes</span>
                  </div>
                </div>
              </div>
            )}

            {/* From Token */}
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>From</span>
                <span>Balance: 0.0</span>
              </div>
              <div className="bg-[#111116] rounded-lg p-4">
                <div className="flex justify-between">
                  <input
                    type="text"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={handleFromAmountChange}
                    className="bg-transparent text-2xl w-full focus:outline-none"
                  />
                  <button
                    className="flex items-center bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 transition-colors"
                    onClick={() => {
                      setSelectingToken('from');
                      setShowTokenModal(true);
                    }}
                  >
                    {fromToken.logoURI && (
                      <div className="w-6 h-6 mr-2 relative">
                        <Image
                          src={fromToken.logoURI}
                          alt={fromToken.symbol}
                          width={24}
                          height={24}
                        />
                      </div>
                    )}
                    <span>{fromToken.symbol}</span>
                    <FaChevronDown className="ml-2 text-sm" />
                  </button>
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-3 z-10 relative">
              <button
                onClick={swapTokens}
                className="bg-[#111116] hover:bg-gray-700 rounded-full p-2 border border-gray-700"
              >
                <FaExchangeAlt className="text-blue-400" />
              </button>
            </div>

            {/* To Token */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>To</span>
                <span>Balance: 0.0</span>
              </div>
              <div className="bg-[#111116] rounded-lg p-4">
                <div className="flex justify-between">
                  <input
                    type="text"
                    placeholder="0.0"
                    value={toAmount}
                    onChange={handleToAmountChange}
                    className="bg-transparent text-2xl w-full focus:outline-none"
                  />
                  <button
                    className="flex items-center bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 transition-colors"
                    onClick={() => {
                      setSelectingToken('to');
                      setShowTokenModal(true);
                    }}
                  >
                    {toToken.logoURI ? (
                      <div className="w-6 h-6 mr-2 relative">
                        <Image src={toToken.logoURI} alt={toToken.symbol} width={24} height={24} />
                      </div>
                    ) : null}
                    <span>{toToken.symbol}</span>
                    <FaChevronDown className="ml-2 text-sm" />
                  </button>
                </div>
              </div>
            </div>

            {/* Price Info */}
            {fromAmount && toAmount && (
              <div className="bg-[#111116] rounded-lg p-3 mb-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Price</span>
                  <span>
                    1 {fromToken.symbol} = 1950 {toToken.symbol || '...'}
                  </span>
                </div>
              </div>
            )}

            {/* Network Selector - Hide in trade view if needed */}
            {(!inTradeView || true) && (
              <div className="mb-4">
                <div className="text-sm mb-2">Select Network</div>
                <NetworkSelector
                  selectedChainId={chainId}
                  onSelectNetwork={newChainId => {
                    setChainId(newChainId);
                    // Update token chainIds
                    setFromToken(prev => ({ ...prev, chainId: newChainId }));
                    setToToken(prev => ({ ...prev, chainId: newChainId }));
                  }}
                />
              </div>
            )}

            {/* Primary Action Button (keeps same design/label) */}
            <button
              onClick={handlePrimaryAction}
              disabled={isSwapping}
              className="w-full bg-[#fffff1]/40 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-60"
            >
              Connect wallet
            </button>

            {/* Trending Coins Section */}
            <div className="mt-6">
              <div className="flex items-center mb-3">
                <FaFire className="text-orange-500 mr-2" />
                <h3 className="text-md font-medium">Trending Coins</h3>
              </div>

              {isLoadingTrending ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : trendingError ? (
                <div className="text-red-500 text-center py-2 text-sm">{trendingError}</div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="flex space-x-2 pb-2">
                    {trendingCoins.map((coin, index) => (
                      <div
                        key={coin.item.id}
                        onClick={() => handleTrendingCoinClick(coin)}
                        className="flex-shrink-0 bg-[#111116] hover:bg-gray-700 rounded-lg p-2 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <Image
                                src={
                                  coin.item.small ||
                                  getCryptoIconUrl(coin.item.symbol.toLowerCase())
                                }
                                alt={coin.item.name}
                                width={32}
                                height={32}
                                unoptimized
                              />
                            </div>
                            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                              {index + 1}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {coin.item.symbol.toUpperCase()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {coin.item.name.length > 10
                                ? coin.item.name.substring(0, 10) + '...'
                                : coin.item.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Exchange Selector */}
            {(!inTradeView || true) && (
              <div className="mt-4 mb-4">
                <div className="text-sm mb-2">Select Exchange</div>
                <ExchangeSelector
                  exchanges={availableExchanges}
                  selectedExchange={selectedExchange}
                  onSelectExchange={handleExchangeSelect}
                  chainId={chainId}
                />
              </div>
            )}

            {/* Available Quotes */}
            {quotes.length > 0 && (
              <div className="mt-4 mb-4 bg-[#111116] rounded-lg p-3">
                <div className="text-sm font-medium mb-2">Available Routes</div>
                {quotes.map((quote, index) => {
                  const exchange = availableExchanges.find(ex => ex.config.name === quote.protocol);
                  const isSelected = selectedExchange?.config.name === quote.protocol;

                  return (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-2 rounded-lg mb-1 cursor-pointer ${isSelected ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                      onClick={() => {
                        if (exchange) {
                          handleExchangeSelect(exchange);
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-5 h-5 mr-2 bg-white rounded-full flex items-center justify-center">
                          <Image
                            src={exchange?.config.logoURI || '/placeholder.svg'}
                            alt={quote.protocol}
                            width={20}
                            height={20}
                          />
                        </div>
                        <div>
                          <span>{quote.protocol}</span>
                          <div className="flex mt-1">
                            {exchange?.config.supportedChains.map(supportedChain => (
                              <div
                                key={supportedChain}
                                className={`w-2 h-2 rounded-full mr-1 ${supportedChain === chainId ? 'bg-green-500' : 'bg-gray-500'}`}
                                title={`${networks.find(n => n.id === supportedChain)?.name || 'Unknown'} ${supportedChain === chainId ? '(active)' : ''}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div>{parseFloat(quote.outputAmount).toFixed(6)}</div>
                        <div className="text-xs text-gray-400">Fee: {quote.fee}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Provider Info */}
            <div className="mt-4">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Slippage Tolerance</span>
                <span>{slippage}%</span>
              </div>

              {selectedExchange && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-400">Provider</span>
                  <div className="flex items-center">
                    <div className=" p-1 mr-1 bg-white rounded-full ">
                      <Image
                        src={selectedExchange.config.logoURI}
                        alt={selectedExchange.config.name}
                        width={20}
                        height={20}
                      />
                    </div>
                    <span className="text-sm">{selectedExchange.config.name}</span>
                  </div>
                </div>
              )}

              {bestQuote &&
                selectedExchange &&
                bestQuote.protocol !== selectedExchange.config.name && (
                  <div className="flex items-center mt-2 p-2 bg-yellow-800 bg-opacity-30 rounded-lg text-xs">
                    <FaInfoCircle className="text-yellow-500 mr-2" />
                    <span>Better rate available on {bestQuote.protocol}</span>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Token Selection Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1923] rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-medium">Select a token</h3>
              <button
                onClick={() => setShowTokenModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-4 border-b border-gray-800">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search token name or symbol"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-[#111116] text-white px-4 py-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

            <div className="overflow-y-auto max-h-[50vh]">
              {tokenList
                .filter(
                  token =>
                    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(token => (
                  <div
                    key={token.symbol}
                    className="flex items-center p-3 hover:bg-[#111116] cursor-pointer border-b border-gray-800"
                    onClick={() => {
                      if (selectingToken === 'from') {
                        setFromToken(token);
                      } else {
                        setToToken(token);
                      }
                      setShowTokenModal(false);
                    }}
                  >
                    <div className="w-8 h-8 mr-3 relative">
                      <Image
                        src={token.logoURI || '/placeholder.svg'}
                        alt={token.symbol}
                        width={32}
                        height={32}
                      />
                    </div>
                    <div>
                      <div className="font-medium">{token.name}</div>
                      <div className="text-sm text-gray-400">{token.symbol}</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div>0.0</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
