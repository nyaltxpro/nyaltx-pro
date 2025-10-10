import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/adminAuth';
import { getCollection } from '@/lib/mongodb';

export interface UserRecord {
  id: string;
  email?: string;
  walletAddress?: string;
  name?: string;
  registeredAt: string;
  lastActive?: string;
  totalOrders: number;
  totalSpent: number;
  favoriteTokens: number;
  registeredTokens: number;
  source: string;
  metadata?: Record<string, any>;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

    // Collect users from multiple sources
    const users: UserRecord[] = [];

    // 1. Get users from orders collection (emails and wallet addresses)
    const ordersCollection = await getCollection('orders');
    const orderUsers = await ordersCollection.aggregate([
      {
        $group: {
          _id: {
            email: '$email',
            walletAddress: '$walletAddress'
          },
          firstOrder: { $min: '$createdAt' },
          lastOrder: { $max: '$createdAt' },
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: { $toDouble: '$amount' } },
          orders: { $push: '$$ROOT' }
        }
      }
    ]).toArray();

    for (const user of orderUsers) {
      if (user._id.email || user._id.walletAddress) {
        users.push({
          id: user._id.email || user._id.walletAddress || `user_${Date.now()}`,
          email: user._id.email,
          walletAddress: user._id.walletAddress,
          registeredAt: user.firstOrder,
          lastActive: user.lastOrder,
          totalOrders: user.totalOrders,
          totalSpent: user.totalSpent,
          favoriteTokens: 0,
          registeredTokens: 0,
          source: 'orders',
          metadata: {
            orderHistory: user.orders.length
          }
        });
      }
    }

    // 2. Get users from onchain orders
    const onchainCollection = await getCollection('onchain_orders');
    const onchainUsers = await onchainCollection.aggregate([
      {
        $group: {
          _id: '$wallet',
          firstOrder: { $min: '$createdAt' },
          lastOrder: { $max: '$createdAt' },
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: { $toDouble: '$amount' } }
        }
      }
    ]).toArray();

    for (const user of onchainUsers) {
      if (user._id) {
        const existingUser = users.find(u => u.walletAddress === user._id);
        if (existingUser) {
          existingUser.totalOrders += user.totalOrders;
          existingUser.totalSpent += user.totalSpent;
          existingUser.source += ', onchain_orders';
        } else {
          users.push({
            id: user._id,
            walletAddress: user._id,
            registeredAt: user.firstOrder,
            lastActive: user.lastOrder,
            totalOrders: user.totalOrders,
            totalSpent: user.totalSpent,
            favoriteTokens: 0,
            registeredTokens: 0,
            source: 'onchain_orders'
          });
        }
      }
    }

    // 3. Get users from favorites
    const favoritesCollection = await getCollection('favorites');
    const favoriteUsers = await favoritesCollection.aggregate([
      {
        $group: {
          _id: '$wallet_address',
          favoriteCount: { $sum: 1 },
          firstFavorite: { $min: '$created_at' },
          lastFavorite: { $max: '$created_at' }
        }
      }
    ]).toArray();

    for (const user of favoriteUsers) {
      if (user._id) {
        const existingUser = users.find(u => u.walletAddress === user._id);
        if (existingUser) {
          existingUser.favoriteTokens = user.favoriteCount;
          existingUser.source += ', favorites';
        } else {
          users.push({
            id: user._id,
            walletAddress: user._id,
            registeredAt: user.firstFavorite,
            lastActive: user.lastFavorite,
            totalOrders: 0,
            totalSpent: 0,
            favoriteTokens: user.favoriteCount,
            registeredTokens: 0,
            source: 'favorites'
          });
        }
      }
    }

    // 4. Get users from token registrations
    const tokenRegCollection = await getCollection('token_registrations');
    const tokenRegUsers = await tokenRegCollection.aggregate([
      {
        $group: {
          _id: '$submittedByAddress',
          tokenCount: { $sum: 1 },
          firstRegistration: { $min: '$submittedAt' },
          lastRegistration: { $max: '$submittedAt' }
        }
      }
    ]).toArray();

    for (const user of tokenRegUsers) {
      if (user._id) {
        const existingUser = users.find(u => u.walletAddress === user._id);
        if (existingUser) {
          existingUser.registeredTokens = user.tokenCount;
          existingUser.source += ', token_registrations';
        } else {
          users.push({
            id: user._id,
            walletAddress: user._id,
            registeredAt: user.firstRegistration,
            lastActive: user.lastRegistration,
            totalOrders: 0,
            totalSpent: 0,
            favoriteTokens: 0,
            registeredTokens: user.tokenCount,
            source: 'token_registrations'
          });
        }
      }
    }

    // 5. Get users from newsletter subscriptions (if exists)
    try {
      const newsletterCollection = await getCollection('newsletter_subscriptions');
      const newsletterUsers = await newsletterCollection.find({}).toArray();
      
      for (const user of newsletterUsers) {
        if (user.email) {
          const existingUser = users.find(u => u.email === user.email);
          if (existingUser) {
            existingUser.source += ', newsletter';
          } else {
            users.push({
              id: user.email,
              email: user.email,
              registeredAt: user.subscribedAt || user.createdAt || new Date().toISOString(),
              lastActive: user.subscribedAt || user.createdAt || new Date().toISOString(),
              totalOrders: 0,
              totalSpent: 0,
              favoriteTokens: 0,
              registeredTokens: 0,
              source: 'newsletter'
            });
          }
        }
      }
    } catch (error) {
      // Newsletter collection might not exist
      console.log('Newsletter collection not found, skipping...');
    }

    // Apply search filter
    let filteredUsers = users;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = users.filter(user => 
        user.email?.toLowerCase().includes(searchLower) ||
        user.walletAddress?.toLowerCase().includes(searchLower) ||
        user.name?.toLowerCase().includes(searchLower) ||
        user.source.toLowerCase().includes(searchLower)
      );
    }

    // Sort by last active (newest first)
    filteredUsers.sort((a, b) => {
      const aDate = new Date(a.lastActive || a.registeredAt).getTime();
      const bDate = new Date(b.lastActive || b.registeredAt).getTime();
      return bDate - aDate;
    });

    // Apply pagination
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);
    const total = filteredUsers.length;

    return NextResponse.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      stats: {
        totalUsers: users.length,
        usersWithEmails: users.filter(u => u.email).length,
        usersWithWallets: users.filter(u => u.walletAddress).length,
        activeUsers: users.filter(u => u.totalOrders > 0).length,
        totalRevenue: users.reduce((sum, u) => sum + u.totalSpent, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
