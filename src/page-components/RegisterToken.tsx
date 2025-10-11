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
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Register Token</h1>
                <ConnectWalletButton />
            </div>

            {/* Payment Success Banner */}
            {paymentSuccess && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                        </div>
                        <div>
                            <h3 className="text-green-400 font-semibold">NyaltxPro Activated!</h3>
                            <p className="text-green-300 text-sm">
                                Your payment was successful. You now have access to premium token registration
                                features.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Form */}
                <div className="lg:col-span-2">
                    <div className="bg-[#0f1923] rounded-lg shadow-lg overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-800">
                            <button
                                className={`px-6 py-3 text-sm font-medium ${activeTab === 'basic'
                                    ? 'text-[#00b8d8] border-b-2 border-[#00b8d8]'
                                    : 'text-gray-400 hover:text-gray-300'
                                    }`}
                                onClick={() => setActiveTab('basic')}
                            >
                                BASIC
                            </button>
                            <button
                                className={`px-6 py-3 text-sm font-medium ${activeTab === 'advanced'
                                    ? 'text-[#00b8d8] border-b-2 border-[#00b8d8]'
                                    : 'text-gray-400 hover:text-gray-300'
                                    }`}
                                onClick={() => setActiveTab('advanced')}
                            >
                                ADVANCED
                            </button>
                        </div>

                        {/* Progress Steps */}
                        <div className="px-6 py-4">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-[#00b8d8] flex items-center justify-center text-white text-sm">
                                        1
                                    </div>
                                    <span className="text-xs mt-2 text-[#00b8d8]">TOKEN INFO</span>
                                </div>
                                <div className="flex-1 h-0.5 bg-gray-700 mx-2">
                                    <div className="h-full bg-[#00b8d8] w-0"></div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
                                        2
                                    </div>
                                    <span className="text-xs mt-2 text-gray-400">VERIFY</span>
                                </div>
                                <div className="flex-1 h-0.5 bg-gray-700 mx-2">
                                    <div className="h-full bg-[#00b8d8] w-0"></div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
                                        3
                                    </div>
                                    <span className="text-xs mt-2 text-gray-400">SUBMIT</span>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                {!isConnected && (
                                    <div className="mb-4 text-amber-300 text-sm bg-amber-900/30 border border-amber-700 rounded p-3">
                                        Please connect your wallet to submit a token registration.
                                    </div>
                                )}
                                {error && (
                                    <div className="mb-4 text-red-400 text-sm bg-red-950/30 border border-red-700 rounded p-2">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="mb-4 text-emerald-300 text-sm bg-emerald-950/30 border border-emerald-700 rounded p-2">
                                        {success}
                                    </div>
                                )}
                                {submitted && (
                                    <div className="mb-4 p-4 bg-green-950/30 border border-green-700 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <FaCheck className="text-green-400 text-xl" />
                                            <div>
                                                <h3 className="text-green-400 font-semibold">
                                                    Token Registered Successfully!
                                                </h3>
                                                <p className="text-green-300 text-sm">
                                                    {redirectPath && paymentMethod
                                                        ? 'Your token has been saved to the database and submitted for admin approval.'
                                                        : 'Your token has been submitted for admin approval.'}
                                                </p>
                                                {redirectPath && paymentMethod && (
                                                    <p className="text-cyan-400 text-sm mt-2">
                                                        Redirecting to Pro subscription checkout in 3 seconds...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Name*</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                                        placeholder="Ethereum"
                                        value={formData.tokenName}
                                        onChange={e =>
                                            dispatch(updateFormField({ field: 'tokenName', value: e.target.value }))
                                        }
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Official token name</p>
                                </div>

                                <div className="mb-4 relative">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Symbol*</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                                            placeholder="ETH"
                                            value={formData.tokenSymbol}
                                            onChange={e =>
                                                dispatch(updateFormField({ field: 'tokenSymbol', value: e.target.value }))
                                            }
                                            required
                                            maxLength={8}
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <FaInfoCircle className="text-gray-400" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Same as used on-chain</p>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Blockchain*
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                                        value={formData.blockchain}
                                        onChange={e =>
                                            dispatch(updateFormField({ field: 'blockchain', value: e.target.value }))
                                        }
                                        required
                                    >
                                        <optgroup label="EVM Chains">
                                            <option value="ethereum">Ethereum</option>
                                            <option value="binance">BSC (Binance Smart Chain)</option>
                                            <option value="polygon">Polygon</option>
                                            <option value="avalanche">Avalanche</option>
                                            <option value="arbitrum">Arbitrum</option>
                                            <option value="optimism">Optimism</option>
                                            <option value="base">Base</option>
                                            <option value="fantom">Fantom</option>
                                        </optgroup>
                                        <optgroup label="Non-EVM Chains">
                                            <option value="solana">Solana</option>
                                            <option value="bitcoin">Bitcoin</option>
                                            <option value="cardano">Cardano</option>
                                            <option value="polkadot">Polkadot</option>
                                            <option value="cosmos">Cosmos</option>
                                        </optgroup>
                                    </select>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Contract Address*
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                                        placeholder={getExampleAddress(formData.blockchain)}
                                        value={formData.contractAddress}
                                        onChange={e =>
                                            dispatch(updateFormField({ field: 'contractAddress', value: e.target.value }))
                                        }
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {getAddressFormatDescription(formData.blockchain)}
                                    </p>
                                </div>

                                {/* Email Address (Optional) */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Email Address (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                                        placeholder="your@email.com"
                                        value={formData.userEmail}
                                        onChange={e =>
                                            dispatch(updateFormField({ field: 'userEmail', value: e.target.value }))
                                        }
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Receive email notifications about your token registration status
                                    </p>
                                </div>

                                {/* Image Upload/URI */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-300 mb-3">
                                        Token Logo (400x300 recommended)
                                    </label>

                                    {/* Upload Method Toggle */}
                                    <div className="flex space-x-1 mb-4 bg-gray-800 rounded-lg p-1">
                                        <button
                                            type="button"
                                            onClick={() => setImageUploadMethod('upload')}
                                            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${imageUploadMethod === 'upload'
                                                ? 'bg-[#00b8d8] text-white'
                                                : 'text-gray-400 hover:text-gray-300'
                                                }`}
                                        >
                                            <FaImage className="h-4 w-4" />
                                            <span>Upload Image</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setImageUploadMethod('url')}
                                            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${imageUploadMethod === 'url'
                                                ? 'bg-[#00b8d8] text-white'
                                                : 'text-gray-400 hover:text-gray-300'
                                                }`}
                                        >
                                            <FaLink className="h-4 w-4" />
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
                                        <div>
                                            <input
                                                type="url"
                                                className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                                                placeholder="https://example.com/logo.png"
                                                value={formData.imageUri}
                                                onChange={e =>
                                                    dispatch(updateFormField({ field: 'imageUri', value: e.target.value }))
                                                }
                                            />
                                            <p className="text-xs text-gray-500 mt-2">
                                                Direct URL to your token logo (PNG, JPG, SVG, WebP recommended)
                                            </p>
                                        </div>
                                    )}

                                    {/* Upload Error */}
                                    {imageUploadError && (
                                        <div className="mt-3 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                                            <p className="text-red-400 text-sm">{imageUploadError}</p>
                                        </div>
                                    )}

                                    {/* Current Image Preview for URL method */}
                                    {imageUploadMethod === 'url' && formData.imageUri && (
                                        <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                                            <p className="text-xs text-gray-400 mb-2">Preview:</p>
                                            <div className="relative w-20 h-15 mx-auto">
                                                <img
                                                    src={formData.imageUri}
                                                    alt="Token logo preview"
                                                    className="w-full h-full object-contain rounded"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Social Links (Optional) */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-300 mb-3">
                                        Social Links (Optional)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                Website
                                            </label>
                                            <input
                                                type="url"
                                                className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                                                placeholder="https://example.com"
                                                value={formData.website}
                                                onChange={e =>
                                                    dispatch(updateFormField({ field: 'website', value: e.target.value }))
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                Twitter
                                            </label>
                                            <input
                                                type="url"
                                                className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                                                placeholder="https://twitter.com/yourhandle"
                                                value={formData.twitter}
                                                onChange={e =>
                                                    dispatch(updateFormField({ field: 'twitter', value: e.target.value }))
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                Telegram
                                            </label>
                                            <input
                                                type="url"
                                                className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                                                placeholder="https://t.me/yourchannel"
                                                value={formData.telegram}
                                                onChange={e =>
                                                    dispatch(updateFormField({ field: 'telegram', value: e.target.value }))
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                Discord
                                            </label>
                                            <input
                                                type="url"
                                                className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                                                placeholder="https://discord.gg/yourinvite"
                                                value={formData.discord}
                                                onChange={e =>
                                                    dispatch(updateFormField({ field: 'discord', value: e.target.value }))
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">GitHub</label>
                                            <input
                                                type="url"
                                                className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                                                placeholder="https://github.com/org/repo"
                                                value={formData.github}
                                                onChange={e =>
                                                    dispatch(updateFormField({ field: 'github', value: e.target.value }))
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                YouTube
                                            </label>
                                            <input
                                                type="url"
                                                className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                                                placeholder="https://youtube.com/channel/..."
                                                value={youtube}
                                                onChange={e => setYoutube(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                Video Link
                                            </label>
                                            <input
                                                type="url"
                                                className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                                                placeholder="https://youtube.com/watch?v=... or other video URL"
                                                value={videoLink}
                                                onChange={e => setVideoLink(e.target.value)}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Demo video, tutorial, or promotional content
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !isConnected}
                                        className={`bg-[#00b8d8] hover:bg-[#00a6c4] text-white font-medium py-3 px-8 rounded-full transition duration-200 flex items-center justify-center gap-2 mx-auto ${isSubmitting || !isConnected ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    >
                                        {isSubmitting && (
                                            <FaSpinner className="animate-spin" />
                                        )}
                                        {isSubmitting
                                            ? 'Submitting…'
                                            : isConnected
                                                ? 'Submit Token Registration'
                                                : 'Connect wallet to submit'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Column - FAQ */}
                <div className="lg:col-span-1">
                    <div className="bg-[#0f1923] rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Helpful tips</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="border-b border-gray-800 pb-3">
                                    <button
                                        className="flex justify-between items-center w-full text-left text-gray-300 hover:text-white"
                                        onClick={() => toggleFAQ(idx)}
                                    >
                                        <span className="font-medium">{faq.question}</span>
                                        {faq.isOpen ? <FaChevronUp /> : <FaChevronDown />}
                                    </button>
                                    {faq.isOpen && <p className="mt-2 text-gray-400 text-sm">{faq.answer}</p>}
                                </div>
                            ))}
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
                        <appkit-network-button />
                        <appkit-button />
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
