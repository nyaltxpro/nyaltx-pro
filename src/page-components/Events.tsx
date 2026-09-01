'use client';

import {
    CalendarIcon,
    ChevronRightIcon,
    ClockIcon,
    Cross2Icon,
    ExternalLinkIcon,
    EyeOpenIcon,
    ImageIcon,
    TokensIcon,
} from '@radix-ui/react-icons';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Event {
    id: number;
    slug?: string;
    title: {
        en: string;
    } | string;
    coins: Array<{
        id: string;
        name: string;
        rank: number;
        symbol: string;
        fullname: string;
        image?: string;
    }>;
    date_event: string;
    can_occur_before: boolean;
    created_date: string;
    displayed_date: string;
    categories: Array<{
        id: number;
        name: string;
    }>;
    proof: string;
    source: string;
    description?: {
        en: string;
    } | string;
    percentage?: number;
    important?: boolean;
}

interface EventsResponse {
    body: Event[];
    page: number;
    totalPages: number;
    totalEvents: number;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState<'all' | 'important' | 'today'>('all');
    const [selectedImage, setSelectedImage] = useState<{ src: string; title: string } | null>(null);
    const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
    const [modalImageError, setModalImageError] = useState(false);

    const fetchEvents = async (pageNum: number = 1) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/events?page=${pageNum}&max=50`);

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const data: EventsResponse = await response.json();
            setEvents(data.body || []);
            setPage(data.page || 1);
            setTotalPages(data.totalPages || 1);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents(1);
    }, []);

    useEffect(() => {
        setModalImageError(false);
    }, [selectedImage]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isToday = (dateString: string) => {
        const eventDate = new Date(dateString);
        const today = new Date();
        return eventDate.toDateString() === today.toDateString();
    };

    const filteredEvents = events.filter(event => {
        if (filter === 'important') return event.important;
        if (filter === 'today') return isToday(event.date_event);
        return true;
    });

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchEvents(newPage);
        }
    };

    const getEventTitle = (event: Event) => {
        if (typeof event.title === 'string') return event.title;
        return event.title?.en || 'Untitled event';
    };

    const getEventDescription = (event: Event) => {
        if (typeof event.description === 'string') return event.description;
        return event.description?.en || '';
    };

    // Helper function to get proxied image URL for viewing
    const getProxiedImageUrl = (url: string) => {
        if (!url) return '/crypto-icons/color/generic.svg';

        // Check if it's a CloudFront URL that needs proxying
        if (url.includes('d32bfp67k1q0s7.cloudfront.net')) {
            return `/api/proxy-image?url=${encodeURIComponent(url)}`;
        }

        // For other URLs, return as-is
        return url;
    };

    const getEventImage = (event: Event) => {
        if (event.proof) return getProxiedImageUrl(event.proof);
        if (event.coins?.[0]?.image) return getProxiedImageUrl(event.coins[0].image);
        if (event.coins?.[0]?.symbol) {
            return `/crypto-icons/color/${event.coins[0].symbol.toLowerCase()}.svg`;
        }
        return '/crypto-icons/color/generic.svg';
    };

    const isLogoImage = (url: string) => {
        return (
            url.includes('/crypto-icons/') ||
            url.includes('coin-images.coingecko.com') ||
            url.includes('assets.coingecko.com') ||
            url.includes('coinmarketcal-share.s3.eu-west-1.amazonaws.com') ||
            url.endsWith('.svg') ||
            url.endsWith('.png')
        );
    };

    if (loading && events.length === 0) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading events...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
                    <h3 className="text-red-400 font-semibold mb-2">Error Loading Events</h3>
                    <p className="text-red-300">{error}</p>
                    <button
                        onClick={() => fetchEvents(1)}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen  px-4 py-6 md:px-6 lg:px-8">
            {/* Header Section */}
            <div className="relative mb-8">
                <div className="absolute inset-0 rounded-2xl blur-xl"></div>
                <div className="relative rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                Crypto Events Hub
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <p className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                    Live updates • Latest cryptocurrency events and announcements
                                </p>
                            </div>
                        </div>
                    </div>


                </div>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center justify-between mb-6">
                <div></div>

                {/* Filter buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        All Events
                    </button>
                    <button
                        onClick={() => setFilter('important')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'important'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        Important
                    </button>
                    <button
                        onClick={() => setFilter('today')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'today'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        Today
                    </button>
                </div>
            </div>

            {filteredEvents.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CalendarIcon className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>No Events Available</h3>
                    <p className="text-gray-500" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Please try again later. Our feeds are being updated.</p>
                </div>
            ) : (
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {filteredEvents.map(event => {
                        const imageSrc = getEventImage(event);
                        const logoStyle = isLogoImage(imageSrc);
                        const eventTitle = getEventTitle(event);
                        const eventDescription = getEventDescription(event);

                        return (
                        <div key={event.id} className="group relative">
                            {/* Glow effect */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00c3ff]/20 via-[#7c3aed]/20 to-[#f59e0b]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

                            <div className="relative bg-black/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden hover:border-gray-700/50 transition-all duration-300 group-hover:transform group-hover:scale-[1.02]">
                                {/* Event Image with fallback */}
                                <div
                                    className="relative h-48 overflow-hidden cursor-pointer group/image"
                                    onClick={() =>
                                        setSelectedImage({
                                            src: imageSrc,
                                            title: eventTitle,
                                        })
                                    }
                                >
                                    {!imageErrors[event.id] ? (
                                        <div
                                            className={`absolute inset-0 ${
                                                logoStyle
                                                    ? 'flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-cyan-950'
                                                    : ''
                                            }`}
                                        >
                                            {logoStyle ? (
                                                <Image
                                                    src={imageSrc}
                                                    alt={eventTitle}
                                                    width={96}
                                                    height={96}
                                                    className="object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                                                    unoptimized
                                                    onError={() => {
                                                        setImageErrors(prev => ({ ...prev, [event.id]: true }));
                                                    }}
                                                />
                                            ) : (
                                                <Image
                                                    src={imageSrc}
                                                    alt={eventTitle}
                                                    fill
                                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                    unoptimized
                                                    onError={() => {
                                                        setImageErrors(prev => ({ ...prev, [event.id]: true }));
                                                    }}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                            <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center">
                                                <ImageIcon className="w-7 h-7 text-gray-400" />
                                            </div>
                                            <span className="mt-2 max-w-[90%] truncate text-xs text-gray-400 px-2 text-center">
                                                {eventTitle}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                    {/* View Image Overlay */}
                                    {!imageErrors[event.id] && (
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
                                                <EyeOpenIcon className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Event Type Badge */}
                                    {event.categories && event.categories.length > 0 && (
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/20">
                                                {event.categories[0].name}
                                            </span>
                                        </div>
                                    )}

                                    {/* Important Badge */}
                                    {event.important && (
                                        <div className="absolute top-3 right-3">
                                            <div className="bg-yellow-500/90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-xs font-bold">
                                                ⭐ Important
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-[#00c3ff] rounded-full"></div>
                                            <span className="text-xs uppercase tracking-wider text-[#00c3ff] font-bold" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                {event.categories && event.categories.length > 0 ? event.categories[0].name : 'EVENT'}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            {event.displayed_date || formatDate(event.date_event)}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-white hover:text-transparent hover:bg-gradient-to-r hover:from-[#00c3ff] hover:to-[#7c3aed] hover:bg-clip-text transition-all duration-300 mb-3 line-clamp-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        {eventTitle}
                                    </h3>

                                    {eventDescription && (
                                        <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed mb-4" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            {eventDescription}
                                        </p>
                                    )}

                                    {/* Can Occur Before Indicator */}
                                    {event.can_occur_before && (
                                        <div className="flex items-center gap-2 text-xs text-amber-400 mb-3">
                                            <ClockIcon className="w-3 h-3" />
                                            <span style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Can occur before scheduled date</span>
                                        </div>
                                    )}

                                    {/* Coins Section */}
                                    {event.coins && event.coins.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <TokensIcon className="w-4 h-4 text-cyan-400" />
                                                <span className="text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Related Coins</span>
                                            </div>
                                            <div className="space-y-2">
                                                {event.coins.slice(0, 2).map(coin => (
                                                    <div
                                                        key={coin.id}
                                                        className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 border border-gray-700/50"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {coin.image ? (
                                                                <Image
                                                                    src={coin.image}
                                                                    alt={coin.symbol}
                                                                    width={32}
                                                                    height={32}
                                                                    className="rounded-full object-cover"
                                                                    unoptimized
                                                                />
                                                            ) : (
                                                            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                                {(coin.symbol || coin.name || '?').charAt(0)}
                                                            </div>
                                                            )}
                                                            <div>
                                                                <div className="text-white font-medium text-sm">{coin.symbol}</div>
                                                                <div className="text-gray-400 text-xs">{coin.name}</div>
                                                            </div>
                                                        </div>
                                                        {coin.rank && (
                                                            <div className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                                                                #{coin.rank}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {event.coins.length > 2 && (
                                                    <div className="text-center text-gray-400 text-xs py-2">
                                                        +{event.coins.length - 2} more coins
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Additional Categories */}
                                    {event.categories && event.categories.length > 1 && (
                                        <div className="mb-4">
                                            <div className="flex flex-wrap gap-2">
                                                {event.categories.slice(1, 3).map(category => (
                                                    <span
                                                        key={category.id}
                                                        className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-medium border border-indigo-500/30"
                                                    >
                                                        {category.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Read more indicator */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800/50">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            {event.source ? (
                                                <a
                                                    href={event.source}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                >
                                                    <ExternalLinkIcon className="w-4 h-4" />
                                                    View on CoinMarketCal
                                                </a>
                                            ) : (
                                                <span style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    Event #{event.id}
                                                </span>
                                            )}
                                        </div>
                                        <ChevronRightIcon className="w-4 h-4 text-[#00c3ff] transform group-hover:translate-x-1 transition-transform duration-300" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}


            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                        Previous
                    </button>

                    <span className="px-4 py-2 text-gray-300">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Loading overlay for page changes */}
            {loading && events.length > 0 && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
                        <span className="text-white">Loading events...</span>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-full w-full h-full flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-4 bg-black/50 backdrop-blur-sm rounded-t-lg p-4">
                            <h3 className="text-white font-semibold text-lg truncate pr-4">
                                {selectedImage.title}
                            </h3>
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-white/10 rounded-full"
                            >
                                <Cross2Icon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Image with fallback */}
                        <div className="relative flex-1 bg-black/30 backdrop-blur-sm rounded-b-lg overflow-hidden">
                            {!modalImageError ? (
                                <Image
                                    src={selectedImage.src}
                                    alt={selectedImage.title}
                                    fill
                                    className="object-contain"
                                    onClick={e => e.stopPropagation()}
                                    onError={() => setModalImageError(true)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                                    <div className="flex flex-col items-center text-gray-400">
                                        <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                                            <ImageIcon className="w-10 h-10 text-gray-400" />
                                        </div>
                                        <span className="mt-3 text-sm">Image unavailable</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute bottom-4 right-4 flex gap-2">
                            {/* <a
                href={selectedImage.src}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <FaExternalLinkAlt className="w-4 h-4" />
                <span>Open</span>
              </a> */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
