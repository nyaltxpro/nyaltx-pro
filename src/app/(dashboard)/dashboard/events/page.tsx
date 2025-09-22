"use client";

import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaExternalLinkAlt, FaCoins, FaClock, FaFilter } from 'react-icons/fa';
import Image from 'next/image';

interface Event {
  id: number;
  title: {
    en: string;
  };
  coins: Array<{
    id: string;
    name: string;
    rank: number;
    symbol: string;
    fullname: string;
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
  };
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Crypto Events</h1>
          <p className="text-gray-400">Stay updated with the latest cryptocurrency events and announcements</p>
        </div>
        
        {/* Filter buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-cyan-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter('important')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'important' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Important
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'today' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Today
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="group bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10"
          >
            {/* Event Image */}
            {event.proof && (
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={event.proof}
                  alt={event.title.en}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
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
            )}

            <div className="p-6">
              {/* Event Header */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                  {event.title.en}
                </h3>
                
                {/* Date Display */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                  <FaCalendarAlt className="w-4 h-4 text-cyan-400" />
                  <span className="font-medium">{event.displayed_date || formatDate(event.date_event)}</span>
                </div>

                {/* Can Occur Before Indicator */}
                {event.can_occur_before && (
                  <div className="flex items-center gap-2 text-xs text-amber-400 mb-3">
                    <FaClock className="w-3 h-3" />
                    <span>Can occur before scheduled date</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description?.en && (
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {event.description.en}
                </p>
              )}

              {/* Coins Section */}
              {event.coins && event.coins.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FaCoins className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-semibold text-gray-300">Related Coins</span>
                  </div>
                  <div className="space-y-2">
                    {event.coins.slice(0, 2).map((coin) => (
                      <div key={coin.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {coin.symbol.charAt(0)}
                          </div>
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
                    {event.categories.slice(1, 3).map((category) => (
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

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  {event.source && (
                    <a
                      href={event.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <FaExternalLinkAlt className="w-3 h-3" />
                      <span>View Source</span>
                    </a>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  ID: {event.id}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && !loading && (
        <div className="text-center py-12">
          <FaCalendarAlt className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Events Found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'No events are currently available.' 
              : `No ${filter} events found. Try changing the filter.`}
          </p>
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
    </div>
  );
}
