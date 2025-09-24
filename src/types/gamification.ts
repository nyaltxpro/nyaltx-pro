export interface BoostPoints {
  id: string;
  tokenId: string;
  points: number;
  originalPoints: number;
  createdAt: Date;
  expiresAt: Date;
  decayRate: number; // Points lost per hour
  isActive: boolean;
  transactionHash?: string;
  boostPackType: 'paddle' | 'motor' | 'helicopter';
}

export interface WeeklyWinner {
  id: string;
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  tokenLogo: string;
  weekStartDate: Date;
  weekEndDate: Date;
  totalPoints: number;
  crownBadgeAwarded: boolean;
  socialAnnouncementSent: boolean;
  crossPromotionActive: boolean;
}

export interface LeaderboardEntry {
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  tokenLogo: string;
  currentPoints: number;
  weeklyPoints: number;
  position: number;
  previousPosition?: number;
  hasCrownBadge: boolean;
  isTopThree: boolean;
  lastBoostTime: Date;
  decayingPoints: BoostPoints[];
}

export interface BoostPack {
  id: 'paddle' | 'motor' | 'helicopter';
  name: string;
  basePoints: number;
  duration: string;
  price: {
    usd: number;
    eth: number;
    usdc: number;
    nyax: number; // 20% discount
  };
  features: string[];
  decayHours: number; // 24, 36, or 48 hours
}

export interface SocialAnnouncement {
  id: string;
  tokenId: string;
  platform: 'twitter' | 'telegram';
  message: string;
  scheduledAt: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed';
  engagementMetrics?: {
    likes?: number;
    retweets?: number;
    replies?: number;
    views?: number;
  };
}

export interface CrossPromotion {
  id: string;
  tokenId: string;
  weeklyWinnerId: string;
  podcastEpisode?: string;
  adSlot: 'opening' | 'mid-roll' | 'closing';
  scheduledDate: Date;
  status: 'scheduled' | 'aired' | 'cancelled';
  tier: 'top1' | 'top2' | 'top3';
}
