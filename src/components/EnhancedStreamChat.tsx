'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { ChatMessage } from '@/services/StreamIOService';
import { 
  FaComments, 
  FaPaperPlane, 
  FaCrown, 
  FaGift, 
  FaExclamationTriangle,
  FaUserPlus,
  FaUserMinus,
  FaBullhorn,
  FaCoins
} from 'react-icons/fa';

interface EnhancedStreamChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onSendAnnouncement?: (message: string, priority: 'low' | 'medium' | 'high') => void;
  isStreamer?: boolean;
  isConnected?: boolean;
  className?: string;
}

export default function EnhancedStreamChat({ 
  messages, 
  onSendMessage, 
  onSendAnnouncement,
  isStreamer = false,
  isConnected = false,
  className = "" 
}: EnhancedStreamChatProps) {
  const { address } = useAccount();
  const [chatInput, setChatInput] = useState('');
  const [showAnnouncementInput, setShowAnnouncementInput] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementPriority, setAnnouncementPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!chatInput.trim() || !isConnected) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  const handleSendAnnouncement = () => {
    if (!announcementText.trim() || !onSendAnnouncement) return;
    onSendAnnouncement(announcementText.trim(), announcementPriority);
    setAnnouncementText('');
    setShowAnnouncementInput(false);
  };

  const getMessageIcon = (message: ChatMessage) => {
    switch (message.type) {
      case 'streamer_announcement':
        return <FaBullhorn className="text-yellow-400" />;
      case 'donation':
        return <FaGift className="text-green-400" />;
      case 'viewer_joined':
        return <FaUserPlus className="text-blue-400" />;
      case 'viewer_left':
        return <FaUserMinus className="text-gray-400" />;
      case 'system':
        return <FaExclamationTriangle className="text-orange-400" />;
      default:
        return null;
    }
  };

  const getMessageStyle = (message: ChatMessage) => {
    const baseStyle = "p-3 rounded-lg mb-2 ";
    
    switch (message.type) {
      case 'streamer_announcement':
        const priority = message.metadata?.announcement?.priority || 'medium';
        if (priority === 'high') return baseStyle + "bg-red-900/30 border border-red-500/50";
        if (priority === 'medium') return baseStyle + "bg-yellow-900/30 border border-yellow-500/50";
        return baseStyle + "bg-green-900/30 border border-green-500/50";
      
      case 'donation':
        return baseStyle + "bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/30";
      
      case 'system':
      case 'viewer_joined':
      case 'viewer_left':
        return baseStyle + "bg-gray-800/50 border border-gray-600/30";
      
      default:
        return baseStyle + "bg-gray-700/30";
    }
  };

  const formatMessageText = (message: ChatMessage) => {
    if (message.type === 'donation' && message.metadata?.donation) {
      const { amount, token, txHash } = message.metadata.donation;
      return (
        <div>
          <p className="text-green-300 font-medium flex items-center gap-2">
            <FaCoins className="text-yellow-400" />
            {message.user.name} donated {amount} {token}!
          </p>
          {message.text !== `Donated ${amount} ${token}! 🎉` && (
            <p className="text-gray-300 mt-1">"{message.text}"</p>
          )}
          {txHash && (
            <p className="text-xs text-gray-500 mt-1">
              TX: {txHash.slice(0, 10)}...{txHash.slice(-6)}
            </p>
          )}
        </div>
      );
    }

    return <p className="text-gray-300">{message.text}</p>;
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <FaComments className="text-cyan-400" />
          <h3 className="text-white font-medium">Live Chat</h3>
          <span className="text-gray-400 text-sm">({messages.length})</span>
        </div>
        
        {isStreamer && (
          <button
            onClick={() => setShowAnnouncementInput(!showAnnouncementInput)}
            className="p-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
            title="Send Announcement"
          >
            <FaBullhorn className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Announcement Input (Streamer Only) */}
      {isStreamer && showAnnouncementInput && (
        <div className="p-4 bg-yellow-900/20 border-b border-yellow-500/30">
          <div className="space-y-3">
            <div className="flex gap-2">
              <select
                value={announcementPriority}
                onChange={(e) => setAnnouncementPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none text-sm"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendAnnouncement()}
                placeholder="Type announcement..."
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none text-sm"
              />
              <button
                onClick={handleSendAnnouncement}
                disabled={!announcementText.trim()}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaBullhorn className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FaComments className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={getMessageStyle(message)}>
              <div className="flex items-start gap-3">
                {/* Message Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getMessageIcon(message)}
                </div>

                {/* Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-white font-medium">
                  {message.isStreamer ? (
                    <FaCrown className="text-yellow-400" />
                  ) : (
                    message.user.name.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium truncate ${
                      message.isStreamer ? 'text-yellow-400' : 'text-cyan-400'
                    }`}>
                      {message.user.name}
                      {message.isStreamer && <FaCrown className="inline ml-1 text-xs" />}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  
                  {formatMessageText(message)}

                  {/* Wallet Address (on hover or for donations) */}
                  {message.user.walletAddress && (message.type === 'donation' || message.isStreamer) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {message.user.walletAddress.slice(0, 6)}...{message.user.walletAddress.slice(-4)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isConnected ? "Type a message..." : "Connect wallet to chat"}
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none text-sm"
            disabled={!isConnected}
          />
          <button
            onClick={handleSendMessage}
            disabled={!chatInput.trim() || !isConnected}
            className="px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPaperPlane className="w-4 h-4" />
          </button>
        </div>
        
        {!isConnected && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Connect your wallet to participate in chat
          </p>
        )}
      </div>
    </div>
  );
}
