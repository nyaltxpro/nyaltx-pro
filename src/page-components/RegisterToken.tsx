'use client';

import ConnectWalletButton from '@/components/ConnectWalletButton';
import ImageUpload from '@/components/ImageUpload';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    clearError,
    registerToken,
    resetForm,
    updateFormField
} from '@/store/slices/tokenSlice';
import { getAddressFormatDescription, getExampleAddress, validateContractAddress } from '@/utils/addressValidation';
import { useAppKitAccount } from '@reown/appkit/react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useState } from 'react';
import toast from 'react-hot-toast';
import {
    FaCheck,
    FaChevronDown,
    FaChevronUp,
    FaImage,
    FaInfoCircle,
    FaLink,
    FaSpinner
} from 'react-icons/fa';


interface FAQ {
    question: string;
    answer: string;
    isOpen: boolean;
}

function RegisterTokenContent() {

    const { isConnected, address } = useAppKitAccount();
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();

    // Redux state
    const { formData, isSubmitting, error, success } = useAppSelector(state => state.tokens);

    // Redirect parameters
    const redirectPath = searchParams?.get('redirect');
    const paymentMethod = searchParams?.get('method');

    // Local UI state (not managed by Redux)
    const [submitted, setSubmitted] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [youtube, setYoutube] = useState('');
    const [videoLink, setVideoLink] = useState('');
    const [imageUploadMethod, setImageUploadMethod] = useState<'upload' | 'url'>('upload');
    const [imageUploadError, setImageUploadError] = useState<string | null>(null);
    const [hasPendingRegistration, setHasPendingRegistration] = useState(false);

    // Handle image upload success
    const handleImageUploaded = (ipfsUrl: string) => {
        dispatch(updateFormField({ field: 'imageUri', value: ipfsUrl }));
        setImageUploadError(null);
    };

    // Handle image upload error
    const handleImageUploadError = (error: string) => {
        setImageUploadError(error);
    };

    // Clear any pending token registration on component mount (in case user navigated back without completing payment)
    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');

        // If no payment success status and user is on the register page, check for pending registration
        if (!paymentStatus && !paymentSuccess) {
            const pendingData = localStorage.getItem('pendingTokenRegistration');
            if (pendingData) {
                setHasPendingRegistration(true);
                // Ask user if they want to clear the pending registration
                const shouldClear = window.confirm(
                    'You have a pending token registration from an incomplete payment. Would you like to clear it and start fresh?'
                );
                if (shouldClear) {
                    localStorage.removeItem('pendingTokenRegistration');
                    setHasPendingRegistration(false);
                }
            }
        }
    }, [paymentSuccess]);

    // Check for payment success from URL params and register token if payment was successful
    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');

        if (paymentStatus === 'success' || paymentStatus === 'paypal_success') {
            setPaymentSuccess(true);

            // Register the token after successful payment
            const handlePostPaymentRegistration = async () => {
                const postPaymentToast = toast.loading('🔄 Processing post-payment token registration...');

                try {
                    const pendingTokenData = localStorage.getItem('pendingTokenRegistration');
                    if (pendingTokenData) {
                        const tokenData = JSON.parse(pendingTokenData);

                        // Update toast for database registration
                        toast.dismiss(postPaymentToast);
                        const registeringToast = toast.loading('📤 Registering token in database...');

                        // Register the token in the database now that payment is successful
                        await dispatch(registerToken(tokenData)).unwrap();

                        toast.dismiss(registeringToast);

                        // Clear the pending registration data
                        localStorage.removeItem('pendingTokenRegistration');

                        toast.success('🎉 Payment successful! Token registered with NyaltxPro benefits!');
                        toast.success('✨ Your token now has premium features enabled', {
                            duration: 4000,
                            style: {
                                background: '#065f46',
                                color: '#d1fae5',
                                border: '1px solid #10b981',
                            }
                        });

                        dispatch({
                            type: 'tokens/setSuccess',
                            payload: '🎉 Payment successful! Your token has been registered with NyaltxPro benefits.',
                        });
                    } else {
                        toast.dismiss(postPaymentToast);
                        toast.success('🎉 Payment successful! You can now register tokens with NyaltxPro benefits.');

                        dispatch({
                            type: 'tokens/setSuccess',
                            payload: '🎉 Payment successful! You can now register your token with NyaltxPro benefits.',
                        });
                    }
                } catch (error) {
                    toast.dismiss(postPaymentToast);
                    console.error('Post-payment token registration failed:', error);
                    toast.error('❌ Payment successful, but token registration failed. Please try again.');

                    dispatch({
                        type: 'tokens/setError',
                        payload: 'Payment successful, but token registration failed. Please try registering again.',
                    });
                }
            };

            handlePostPaymentRegistration();
        } else if (paymentStatus === 'free') {
            setPaymentSuccess(true);
            toast.success('🎉 Free registration successful! Your token has been registered.');
            dispatch({
                type: 'tokens/setSuccess',
                payload: '🎉 Free registration successful! Your token has been registered.',
            });
        }
    }, [dispatch]);

    const [faqs, setFaqs] = useState<FAQ[]>([
        {
            question: 'What is token registration?',
            answer:
                'Registering a token lets users discover your asset in search, charts, and analytics across supported chains including Ethereum, Solana, BSC, Polygon, and more.',
            isOpen: false,
        },
        {
            question: 'What blockchains are supported?',
            answer:
                'We support EVM chains (Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Fantom, Avalanche) and non-EVM chains (Solana, Bitcoin, Cardano, Polkadot, Cosmos). Each blockchain has its own address format.',
            isOpen: false,
        },
        {
            question: 'What information is required?',
            answer:
                'Provide your token name, symbol, the blockchain, and the contract address. The address format varies by blockchain - EVM chains use 0x addresses, Solana uses Base58, etc.',
            isOpen: false,
        },
        {
            question: 'How long does it take to appear?',
            answer: 'Tokens typically appear within 24-48 hours after admin approval.',
            isOpen: false,
        },
    ]);

    const toggleFAQ = (index: number) => {
        const updated = faqs.map((faq, idx) =>
            idx === index ? { ...faq, isOpen: !faq.isOpen } : faq
        );
        setFaqs(updated);
    };

    // Check if contract address already exists
    const checkContractExists = async (contractAddress: string, blockchain: string): Promise<boolean> => {
        try {
            // Validate contract address format
            if (!contractAddress || contractAddress.trim() === '') {
                console.warn('Empty contract address provided');
                return false;
            }

            const cleanAddress = contractAddress.trim();

            // Validate address format for the specific blockchain
            const validation = validateContractAddress(cleanAddress, blockchain);
            if (!validation.isValid) {
                console.warn('Invalid contract address format:', cleanAddress, validation.error);
                return false;
            }

            console.log('Checking contract address:', cleanAddress, 'on blockchain:', blockchain, 'format:', validation.format);

            const response = await fetch(`/api/tokens/by-address/${encodeURIComponent(cleanAddress)}?blockchain=${blockchain}&checkExists=true`);
            if (response.ok) {
                const data = await response.json();
                console.log('Contract check result:', data);
                return data.exists || false;
            }
            console.warn('Contract check failed with status:', response.status);
            return false;
        } catch (error) {
            console.error('Error checking contract address:', error);
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(clearError());

        // Start loading state
        dispatch({ type: 'tokens/setSubmitting', payload: true });

        // Show initial validation toast
        const initialToast = toast.loading('🔍 Validating form data...');

        try {
            // Validate required fields
            if (!formData.tokenName || !formData.tokenSymbol || !formData.contractAddress) {
                const errorMsg = 'Please fill in all required fields.';
                toast.dismiss(initialToast);
                dispatch({
                    type: 'tokens/setError',
                    payload: errorMsg,
                });
                toast.error('❌ ' + errorMsg);
                return;
            }

            // Validate contract address format for the selected blockchain
            const cleanAddress = formData.contractAddress.trim();
            const validation = validateContractAddress(cleanAddress, formData.blockchain);

            if (!validation.isValid) {
                const errorMsg = validation.error || `Please enter a valid ${formData.blockchain} contract address.`;
                toast.dismiss(initialToast);
                dispatch({
                    type: 'tokens/setError',
                    payload: errorMsg,
                });
                toast.error('❌ ' + errorMsg);
                return;
            }

            // Update toast for contract checking
            toast.dismiss(initialToast);
            const checkingToast = toast.loading('🔍 Checking contract address uniqueness...');

            // Check if contract address already exists
            const contractExists = await checkContractExists(formData.contractAddress, formData.blockchain);
            toast.dismiss(checkingToast);

            if (contractExists) {
                const errorMsg = 'Contract address already exists in the database. Please use a different contract address.';
                dispatch({
                    type: 'tokens/setError',
                    payload: errorMsg,
                });
                toast.error('❌ ' + errorMsg);
                return;
            }

            toast.success('✅ Contract address is unique and valid!');

            // If redirecting to checkout, store token data temporarily in localStorage for registration after payment
            if (redirectPath && paymentMethod) {
                const savingToast = toast.loading('💾 Saving token data for checkout...');

                // Store token data temporarily in localStorage (not in database yet)
                const tokenData = {
                    tokenName: formData.tokenName,
                    tokenSymbol: formData.tokenSymbol,
                    blockchain: formData.blockchain,
                    contractAddress: formData.contractAddress,
                    imageUri: formData.imageUri,
                    website: formData.website,
                    twitter: formData.twitter,
                    telegram: formData.telegram,
                    discord: formData.discord,
                    github: formData.github,
                    youtube: youtube,
                    submittedByAddress: address,
                    userEmail: formData.userEmail || '',
                };

                // Store in localStorage for post-payment registration
                localStorage.setItem('pendingTokenRegistration', JSON.stringify(tokenData));

                toast.dismiss(savingToast);
                toast.success('💾 Token data saved! Redirecting to checkout...');

                // Show redirect toast
                toast.loading('🔄 Redirecting to checkout page...');

                // Redirect to checkout immediately (no database registration yet)
                setTimeout(() => {
                    router.push(`/${redirectPath}?method=${paymentMethod}`);
                }, 1000);
            } else {
                // Show submitting toast
                const submittingToast = toast.loading('📤 Submitting token registration to database...');

                // Submit to API for immediate registration
                const result = await dispatch(registerToken({
                    tokenName: formData.tokenName,
                    tokenSymbol: formData.tokenSymbol,
                    blockchain: formData.blockchain,
                    contractAddress: formData.contractAddress,
                    imageUri: formData.imageUri,
                    website: formData.website,
                    twitter: formData.twitter,
                    telegram: formData.telegram,
                    discord: formData.discord,
                    github: formData.github,
                    submittedByAddress: address,
                    userEmail: formData.userEmail || '',
                }));

                toast.dismiss(submittingToast);

                if (registerToken.fulfilled.match(result)) {
                    toast.success('🎉 Token registration submitted successfully!');
                    toast.success('📋 Our team will review your submission shortly', {
                        duration: 4000,
                        style: {
                            background: '#065f46',
                            color: '#d1fae5',
                            border: '1px solid #10b981',
                        }
                    });
                    setSubmitted(true);
                    dispatch(resetForm());
                } else {
                    const errorMsg = result.payload as string || 'Failed to submit token registration';
                    toast.error('❌ ' + errorMsg);
                    dispatch({
                        type: 'tokens/setError',
                        payload: errorMsg,
                    });
                }
            }
        } catch (err: any) {
            toast.dismiss(initialToast);
            console.error('Token registration error:', err);
            const errorMsg = err.message || 'An unexpected error occurred';
            toast.error('❌ ' + errorMsg);
            dispatch({
                type: 'tokens/setError',
                payload: errorMsg,
            });
        } finally {
            // Always stop loading state
            dispatch({ type: 'tokens/setSubmitting', payload: false });
        }
    };

    return (
        <div className="min-h-screen  p-6">
            <div className="max-w-7xl mx-auto">
                {/* Enhanced Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        {/* <div className="w-16 h-16 bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] rounded-3xl flex items-center justify-center shadow-2xl">
                            <FaLink className="w-8 h-8 text-white" />
                        </div> */}
                        <div>
                            <h1 className="text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                Register Token
                            </h1>
                            <p className="text-xl text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                Submit your token for approval and unlock powerful features
                            </p>
                        </div>
                    </div>

                    {/* Connect Wallet Button */}
                    <div className="flex justify-center mb-8">
                        <ConnectWalletButton />
                    </div>
                </div>

                {/* Payment Success Banner */}
                {paymentSuccess && (
                    <div className="mb-8 p-6 bg-green-500/10 border border-green-500/30 rounded-3xl backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                                <FaCheck className="text-white text-lg" />
                            </div>
                            <div>
                                <h3 className="text-green-400 font-bold text-xl mb-2" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                    NyaltxPro Activated!
                                </h3>
                                <p className="text-green-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                    Your payment was successful. You now have access to premium token registration features.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-black/40 backdrop-blur-xl border border-gray-800/60 rounded-3xl shadow-2xl overflow-hidden">
                            {/* Enhanced Tabs */}
                            <div className="flex border-b border-gray-800/50 bg-gray-900/30">
                                <button
                                    className={`px-8 py-4 text-sm font-bold transition-all duration-300 ${activeTab === 'basic'
                                        ? 'text-[#00d4aa] border-b-3 border-[#00d4aa] bg-[#00d4aa]/10'
                                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
                                        }`}
                                    onClick={() => setActiveTab('basic')}
                                    style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                >
                                    <FaInfoCircle className="inline mr-2" />
                                    BASIC INFO
                                </button>
                                <button
                                    className={`px-8 py-4 text-sm font-bold transition-all duration-300 ${activeTab === 'advanced'
                                        ? 'text-[#3b82f6] border-b-3 border-[#3b82f6] bg-[#3b82f6]/10'
                                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
                                        }`}
                                    onClick={() => setActiveTab('advanced')}
                                    style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                >
                                    <FaLink className="inline mr-2" />
                                    SOCIAL LINKS
                                </button>
                            </div>

                            {/* Enhanced Progress Steps */}
                            <div className="px-8 py-6 bg-gray-900/20">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b8d8] flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                            <FaInfoCircle />
                                        </div>
                                        <span className="text-xs mt-3 text-[#00d4aa] font-semibold" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            TOKEN INFO
                                        </span>
                                    </div>
                                    <div className="flex-1 h-1 bg-gray-700/50 mx-4 rounded-full">
                                        <div className="h-full bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] w-1/3 rounded-full"></div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-400 text-sm border-2 border-gray-600">
                                            <FaCheck />
                                        </div>
                                        <span className="text-xs mt-3 text-gray-400 font-semibold" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            VERIFY
                                        </span>
                                    </div>
                                    <div className="flex-1 h-1 bg-gray-700/50 mx-4 rounded-full">
                                        <div className="h-full bg-gray-600 w-0 rounded-full"></div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-400 text-sm border-2 border-gray-600">
                                            <FaSpinner />
                                        </div>
                                        <span className="text-xs mt-3 text-gray-400 font-semibold" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            SUBMIT
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Form */}
                            <div className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Status Messages */}
                                    {!isConnected && (
                                        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl backdrop-blur-sm">
                                            <div className="flex items-center gap-3">
                                                <FaInfoCircle className="text-amber-400 text-lg" />
                                                <p className="text-amber-300 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    Please connect your wallet to submit a token registration.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm">
                                            <div className="flex items-center gap-3">
                                                <FaInfoCircle className="text-red-400 text-lg" />
                                                <p className="text-red-300 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    {error}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {success && (
                                        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl backdrop-blur-sm">
                                            <div className="flex items-center gap-3">
                                                <FaCheck className="text-green-400 text-lg" />
                                                <p className="text-green-300 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    {success}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {submitted && (
                                        <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-2xl backdrop-blur-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                                                    <FaCheck className="text-white text-lg" />
                                                </div>
                                                <div>
                                                    <h3 className="text-green-400 font-bold text-xl mb-2" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                        Token Registered Successfully!
                                                    </h3>
                                                    <p className="text-green-300 mb-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                        {redirectPath && paymentMethod
                                                            ? 'Your token has been saved to the database and submitted for admin approval.'
                                                            : 'Your token has been submitted for admin approval.'}
                                                    </p>
                                                    {redirectPath && paymentMethod && (
                                                        <p className="text-cyan-400 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                            Redirecting to Pro subscription checkout in 3 seconds...
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Basic Token Information Section */}
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            <div className="w-8 h-8 bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] rounded-lg flex items-center justify-center">
                                                <FaInfoCircle className="w-4 h-4 text-white" />
                                            </div>
                                            Token Information
                                        </h3>
                                        {/* Token Name & Symbol Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    <span className="w-2 h-2 bg-[#00d4aa] rounded-full"></span>
                                                    Token Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa]/60 focus:ring-2 focus:ring-[#00d4aa]/20 transition-all duration-300 backdrop-blur-sm"
                                                    placeholder="e.g., Ethereum"
                                                    value={formData.tokenName}
                                                    onChange={e =>
                                                        dispatch(updateFormField({ field: 'tokenName', value: e.target.value }))
                                                    }
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                    required
                                                />
                                                <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    Official token name
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    <span className="w-2 h-2 bg-[#3b82f6] rounded-full"></span>
                                                    Token Symbol *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6]/60 focus:ring-2 focus:ring-[#3b82f6]/20 transition-all duration-300 backdrop-blur-sm uppercase"
                                                        placeholder="e.g., ETH"
                                                        value={formData.tokenSymbol}
                                                        onChange={e =>
                                                            dispatch(updateFormField({ field: 'tokenSymbol', value: e.target.value }))
                                                        }
                                                        style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                        required
                                                        maxLength={8}
                                                    />
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                                        <FaInfoCircle className="text-gray-400" />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    Same as used on-chain
                                                </p>
                                            </div>
                                        </div>

                                        {/* Blockchain Selection */}
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                                Blockchain *
                                            </label>
                                            <select
                                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 backdrop-blur-sm"
                                                value={formData.blockchain}
                                                onChange={e =>
                                                    dispatch(updateFormField({ field: 'blockchain', value: e.target.value }))
                                                }
                                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                required
                                            >
                                                <optgroup label="EVM Chains" className="bg-gray-800">
                                                    <option value="ethereum" className="bg-gray-800">Ethereum</option>
                                                    <option value="binance" className="bg-gray-800">BSC (Binance Smart Chain)</option>
                                                    <option value="polygon" className="bg-gray-800">Polygon</option>
                                                    <option value="avalanche" className="bg-gray-800">Avalanche</option>
                                                    <option value="arbitrum" className="bg-gray-800">Arbitrum</option>
                                                    <option value="optimism" className="bg-gray-800">Optimism</option>
                                                    <option value="base" className="bg-gray-800">Base</option>
                                                    <option value="fantom" className="bg-gray-800">Fantom</option>
                                                </optgroup>
                                                <optgroup label="Non-EVM Chains" className="bg-gray-800">
                                                    <option value="solana" className="bg-gray-800">Solana</option>
                                                    <option value="bitcoin" className="bg-gray-800">Bitcoin</option>
                                                    <option value="cardano" className="bg-gray-800">Cardano</option>
                                                    <option value="polkadot" className="bg-gray-800">Polkadot</option>
                                                    <option value="cosmos" className="bg-gray-800">Cosmos</option>
                                                </optgroup>
                                            </select>
                                        </div>

                                        {/* Contract Address */}
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                                                Contract Address *
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-400/60 focus:ring-2 focus:ring-orange-400/20 transition-all duration-300 backdrop-blur-sm font-mono"
                                                placeholder={getExampleAddress(formData.blockchain)}
                                                value={formData.contractAddress}
                                                onChange={e =>
                                                    dispatch(updateFormField({ field: 'contractAddress', value: e.target.value }))
                                                }
                                                style={{ fontFamily: 'SF Mono, Monaco, monospace' }}
                                                required
                                            />
                                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                {getAddressFormatDescription(formData.blockchain)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Email Address (Optional) */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                                            Email Address (Optional)
                                        </label>
                                        <input
                                            type="email"
                                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 backdrop-blur-sm"
                                            placeholder="your@email.com"
                                            value={formData.userEmail}
                                            onChange={e =>
                                                dispatch(updateFormField({ field: 'userEmail', value: e.target.value }))
                                            }
                                            style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                        />
                                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            Receive email notifications about your token registration status
                                        </p>
                                    </div>

                                    {/* Enhanced Image Upload Section */}
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                                                <FaImage className="w-4 h-4 text-white" />
                                            </div>
                                            Token Logo
                                        </h3>

                                        {/* Enhanced Upload Method Toggle */}
                                        <div className="flex space-x-2 mb-6 bg-gray-900/50 rounded-2xl p-2 backdrop-blur-sm border border-gray-700/30">
                                            <button
                                                type="button"
                                                onClick={() => setImageUploadMethod('upload')}
                                                className={`flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${imageUploadMethod === 'upload'
                                                    ? 'bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] text-white shadow-lg'
                                                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
                                                    }`}
                                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                            >
                                                <FaImage className="w-4 h-4" />
                                                <span>Upload Image</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setImageUploadMethod('url')}
                                                className={`flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${imageUploadMethod === 'url'
                                                    ? 'bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] text-white shadow-lg'
                                                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
                                                    }`}
                                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                            >
                                                <FaLink className="w-4 h-4" />
                                                <span>Image URL</span>
                                            </button>
                                        </div>

                                        {/* Upload Interface */}
                                        {imageUploadMethod === 'upload' ? (
                                            <ImageUpload
                                                onImageUploaded={handleImageUploaded}
                                                onError={handleImageUploadError}
                                                currentImageUrl={formData.imageUri}
                                                disabled={isSubmitting}
                                            />
                                        ) : (
                                            <div className="space-y-2">
                                                <input
                                                    type="url"
                                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-400/60 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 backdrop-blur-sm"
                                                    placeholder="https://example.com/logo.png"
                                                    value={formData.imageUri}
                                                    onChange={e =>
                                                        dispatch(updateFormField({ field: 'imageUri', value: e.target.value }))
                                                    }
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                />
                                                <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    Direct URL to your token logo (PNG, JPG, SVG, WebP recommended)
                                                </p>
                                            </div>
                                        )}

                                        {/* Enhanced Upload Error */}
                                        {imageUploadError && (
                                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm">
                                                <div className="flex items-center gap-3">
                                                    <FaInfoCircle className="text-red-400 text-lg flex-shrink-0" />
                                                    <p className="text-red-300 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                        {imageUploadError}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Enhanced Image Preview for URL method */}
                                        {imageUploadMethod === 'url' && formData.imageUri && (
                                            <div className="p-6 bg-gray-900/30 border border-gray-700/30 rounded-2xl backdrop-blur-sm">
                                                <p className="text-sm text-gray-300 mb-4 font-semibold" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    Logo Preview:
                                                </p>
                                                <div className="flex justify-center">
                                                    <div className="relative w-24 h-24 bg-gray-800/50 rounded-2xl p-2 border border-gray-600/30">
                                                        <img
                                                            src={formData.imageUri}
                                                            alt="Token logo preview"
                                                            className="w-full h-full object-contain rounded-xl"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Enhanced Social Links Section */}
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                                <FaLink className="w-4 h-4 text-white" />
                                            </div>
                                            Social Links
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Website */}
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                                    Website
                                                </label>
                                                <input
                                                    type="url"
                                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 backdrop-blur-sm"
                                                    placeholder="https://example.com"
                                                    value={formData.website}
                                                    onChange={e =>
                                                        dispatch(updateFormField({ field: 'website', value: e.target.value }))
                                                    }
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                />
                                            </div>

                                            {/* Twitter */}
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    <span className="w-2 h-2 bg-sky-400 rounded-full"></span>
                                                    Twitter
                                                </label>
                                                <input
                                                    type="url"
                                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300 backdrop-blur-sm"
                                                    placeholder="https://twitter.com/yourhandle"
                                                    value={formData.twitter}
                                                    onChange={e =>
                                                        dispatch(updateFormField({ field: 'twitter', value: e.target.value }))
                                                    }
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                />
                                            </div>

                                            {/* Telegram */}
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                                                    Telegram
                                                </label>
                                                <input
                                                    type="url"
                                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 backdrop-blur-sm"
                                                    placeholder="https://t.me/yourchannel"
                                                    value={formData.telegram}
                                                    onChange={e =>
                                                        dispatch(updateFormField({ field: 'telegram', value: e.target.value }))
                                                    }
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                />
                                            </div>

                                            {/* Discord */}
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                                                    Discord
                                                </label>
                                                <input
                                                    type="url"
                                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20 transition-all duration-300 backdrop-blur-sm"
                                                    placeholder="https://discord.gg/yourinvite"
                                                    value={formData.discord}
                                                    onChange={e =>
                                                        dispatch(updateFormField({ field: 'discord', value: e.target.value }))
                                                    }
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                />
                                            </div>

                                            {/* GitHub */}
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                                    GitHub
                                                </label>
                                                <input
                                                    type="url"
                                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-400/60 focus:ring-2 focus:ring-gray-400/20 transition-all duration-300 backdrop-blur-sm"
                                                    placeholder="https://github.com/org/repo"
                                                    value={formData.github}
                                                    onChange={e =>
                                                        dispatch(updateFormField({ field: 'github', value: e.target.value }))
                                                    }
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                />
                                            </div>

                                            {/* YouTube */}
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                                    YouTube
                                                </label>
                                                <input
                                                    type="url"
                                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-400/60 focus:ring-2 focus:ring-red-400/20 transition-all duration-300 backdrop-blur-sm"
                                                    placeholder="https://youtube.com/channel/..."
                                                    value={youtube}
                                                    onChange={e => setYoutube(e.target.value)}
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                />
                                            </div>
                                            {/* Video Link */}
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                                    Video Link
                                                </label>
                                                <input
                                                    type="url"
                                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 backdrop-blur-sm"
                                                    placeholder="https://youtube.com/watch?v=... or other video URL"
                                                    value={videoLink}
                                                    onChange={e => setVideoLink(e.target.value)}
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                />
                                                <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    Demo video, tutorial, or promotional content
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced Submit Button */}
                                    <div className="flex justify-center pt-8">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !isConnected}
                                            className={`flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-[#00d4aa]/30 hover:scale-105 ${isSubmitting || !isConnected ? 'opacity-60 cursor-not-allowed' : 'hover:from-[#00b894] hover:to-[#2563eb]'}`}
                                            style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                        >
                                            {isSubmitting ? (
                                                <FaSpinner className="animate-spin text-lg" />
                                            ) : (
                                                <FaCheck className="text-lg" />
                                            )}
                                            <span className="text-lg">
                                                {isSubmitting
                                                    ? 'Submitting Token...'
                                                    : isConnected
                                                        ? 'Submit Token Registration'
                                                        : 'Connect Wallet to Submit'}
                                            </span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Enhanced FAQ */}
                    <div className="lg:col-span-1">
                        <div className="bg-black/40 backdrop-blur-xl border border-gray-800/60 rounded-3xl shadow-2xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                <div className="w-8 h-8 bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] rounded-lg flex items-center justify-center">
                                    <FaInfoCircle className="w-4 h-4 text-white" />
                                </div>
                                Helpful Tips
                            </h2>
                            <div className="space-y-4">
                                {faqs.map((faq, idx) => (
                                    <div key={idx} className="bg-gray-900/30 rounded-2xl p-4 border border-gray-700/30 backdrop-blur-sm">
                                        <button
                                            className="flex justify-between items-center w-full text-left text-gray-300 hover:text-white transition-colors duration-200"
                                            onClick={() => toggleFAQ(idx)}
                                        >
                                            <span className="font-semibold text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                {faq.question}
                                            </span>
                                            <div className="flex-shrink-0 ml-4">
                                                {faq.isOpen ? (
                                                    <FaChevronUp className="text-[#00d4aa]" />
                                                ) : (
                                                    <FaChevronDown className="text-gray-400" />
                                                )}
                                            </div>
                                        </button>
                                        {faq.isOpen && (
                                            <div className="mt-3 pt-3 border-t border-gray-700/30">
                                                <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RegisterTokenPage() {
    return (
        <Suspense
            fallback={
                <div className="p-6 max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-white">Register Token</h1>
                        <ConnectWalletButton />

                    </div>
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
                        <div className="h-32 bg-gray-700 rounded mb-4"></div>
                    </div>
                </div>
            }
        >
            <RegisterTokenContent />
        </Suspense>
    );
}
