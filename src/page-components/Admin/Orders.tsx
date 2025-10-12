'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaExternalLinkAlt, FaEye, FaFilter, FaSearch, FaShoppingCart, FaCoins, FaEthereum, FaWallet, FaCreditCard, FaGift } from 'react-icons/fa';

interface Order {
  id: string;
  type: 'race_to_liberty' | 'boost_pack' | 'pro_subscription' | 'token_registration';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'eth' | 'sol' | 'nyax' | 'paypal' | 'stripe' | 'free_promo';
  amount: string;
  currency: 'USD' | 'ETH' | 'SOL' | 'NYAX';
  txHash?: string;
  chainId?: number;
  walletAddress?: string;
  paymentId?: string;
  email?: string;
  userId?: string;
  productId?: string;
  productName?: string;
  tier?: string;
  tokenSymbol?: string;
  tokenName?: string;
  promoCode?: string;
  promoDiscount?: number;
  originalAmount?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

const AdminOrdersComponent = () => {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);
      params.append('limit', '100');

      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const result = await response.json();
      setOrders(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders?.filter(order => {
    if (paymentMethodFilter && order.paymentMethod !== paymentMethodFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(search) ||
        order.email?.toLowerCase().includes(search) ||
        order.walletAddress?.toLowerCase().includes(search) ||
        order.txHash?.toLowerCase().includes(search) ||
        order.productName?.toLowerCase().includes(search) ||
        order.tokenSymbol?.toLowerCase().includes(search)
      );
    }
    return true;
  }) || [];

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-900 text-green-300',
      pending: 'bg-yellow-900 text-yellow-300',
      failed: 'bg-red-900 text-red-300',
      refunded: 'bg-gray-900 text-gray-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-900 text-gray-300';
  };

  const getPaymentMethodBadge = (method: string) => {
    const colors = {
      eth: 'bg-blue-900 text-blue-300',
      sol: 'bg-purple-900 text-purple-300',
      nyax: 'bg-cyan-900 text-cyan-300',
      paypal: 'bg-blue-900 text-blue-300',
      stripe: 'bg-purple-900 text-purple-300',
      free_promo: 'bg-emerald-900 text-emerald-300'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-900 text-gray-300';
  };

  const getPaymentMethodName = (method: string) => {
    const names = {
      eth: 'Ethereum',
      sol: 'Solana',
      nyax: 'NYAX Token',
      paypal: 'PayPal',
      stripe: 'Stripe',
      free_promo: 'Free Promo'
    };
    return names[method as keyof typeof names] || method.toUpperCase();
  };

  const formatAmount = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    if (currency === 'USD') return `$${num.toFixed(2)}`;
    if (currency === 'ETH') return `${num.toFixed(6)} ETH`;
    if (currency === 'SOL') return `${num.toFixed(6)} SOL`;
    if (currency === 'NYAX') return `${num.toFixed(2)} NYAX`;
    return `${amount} ${currency}`;
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            All Orders
          </h2>
          <p className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            Comprehensive order management and tracking
          </p>
        </div>
        <Link href="/admin" className="text-sm text-gray-300 hover:text-white transition-colors" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
          Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
            >
              <option value="">All Types</option>
              <option value="race_to_liberty">Race to Liberty</option>
              <option value="boost_pack">Boost Pack</option>
              <option value="pro_subscription">Pro Subscription</option>
              <option value="token_registration">Token Registration</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Payment Method</label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
            >
              <option value="">All Methods</option>
              <option value="eth">ETH</option>
              <option value="sol">SOL</option>
              <option value="nyax">NYAX</option>
              <option value="paypal">PayPal</option>
              <option value="stripe">Stripe</option>
              <option value="free_promo">Free Promo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ID, email, wallet..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 pl-10 text-white text-sm"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchOrders}
              className="w-full bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded text-white font-medium flex items-center justify-center gap-2"
            >
              <FaFilter />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl shadow-xl">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShoppingCart className="w-8 h-8 text-gray-400 animate-pulse" />
            </div>
            <p className="text-gray-400 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Loading orders...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExternalLinkAlt className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 font-medium mb-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Error loading orders
            </p>
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              {error}
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400 font-medium mb-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              No orders found
            </p>
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Try adjusting your filters or check back later
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full overflow-hidden">
              <thead className="bg-gray-700/30 border-b border-gray-600/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/20">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-700/20 transition-colors duration-200">
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <code className="text-white bg-gray-700/30 px-2 py-1 rounded border border-gray-600/30 text-xs" style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}>
                        {order.id.slice(-8)}...
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 capitalize" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {order.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <div className="text-white font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {order.productName || 'N/A'}
                      </div>
                      {order.tier && (
                        <div className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                          Tier: {order.tier}
                        </div>
                      )}
                      {order.tokenSymbol && (
                        <div className="text-xs text-cyan-400 mt-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                          Token: {order.tokenSymbol}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <div className="text-white font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {order.email || (order.walletAddress ? `${order.walletAddress.slice(0, 8)}...` : 'N/A')}
                      </div>
                      {order.promoCode && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-300 border border-green-500/20 mt-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                          Promo: {order.promoCode}
                        </span>
                      )}
                      {order.metadata?.source && (
                        <div className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                          Source: {order.metadata.source.replace('_', ' ')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <div className="flex items-center gap-2">
                        {order.paymentMethod === 'eth' ? (
                          <FaEthereum className="w-4 h-4 text-blue-400" />
                        ) : order.paymentMethod === 'sol' ? (
                          <FaCoins className="w-4 h-4 text-purple-400" />
                        ) : order.paymentMethod === 'nyax' ? (
                          <FaCoins className="w-4 h-4 text-cyan-400" />
                        ) : order.paymentMethod === 'free_promo' ? (
                          <FaGift className="w-4 h-4 text-green-400" />
                        ) : (
                          <FaCreditCard className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodBadge(order.paymentMethod).replace('bg-', 'bg-').replace('text-', 'text-')} border`} style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                          {getPaymentMethodName(order.paymentMethod)}
                        </span>
                      </div>
                      {order.txHash && (
                        <div className="mt-2">
                          <a
                            href={`https://etherscan.io/tx/${order.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                            style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                          >
                            <code className="bg-gray-700/30 px-2 py-1 rounded border border-gray-600/30 text-xs">
                              {order.txHash.slice(0, 8)}...
                            </code>
                            <FaExternalLinkAlt className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <div className="text-white font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {formatAmount(order.amount, order.currency)}
                      </div>
                      {order.originalAmount && order.promoDiscount && (
                        <div className="text-xs text-gray-400 line-through mt-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                          ${order.originalAmount}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(order.status).replace('bg-', 'bg-').replace('text-', 'text-')} ${
                        order.status === 'completed' ? 'border-green-500/20' :
                        order.status === 'pending' ? 'border-yellow-500/20' :
                        order.status === 'failed' ? 'border-red-500/20' :
                        'border-gray-500/20'
                      }`} style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <span className="text-gray-300 text-xs" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => openOrderModal(order)}
                        className="flex items-center justify-center w-8 h-8 text-cyan-400 hover:text-cyan-300 hover:bg-gray-700/30 rounded-lg transition-all duration-200"
                        title="View Details"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Order Details</h3>
                <button
                  onClick={closeOrderModal}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Order ID</label>
                    <div className="text-sm text-white font-mono bg-gray-700 p-2 rounded">
                      {selectedOrder.id}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Status</label>
                    <span className={`px-3 py-1 rounded text-sm ${getStatusBadge(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Type</label>
                    <div className="text-sm text-white capitalize">
                      {selectedOrder.type.replace('_', ' ')}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Payment Method</label>
                    <span className={`px-3 py-1 rounded text-sm ${getPaymentMethodBadge(selectedOrder.paymentMethod)}`}>
                      {selectedOrder.paymentMethod.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">Product</label>
                  <div className="text-sm text-white">{selectedOrder.productName || 'N/A'}</div>
                  {selectedOrder.tier && (
                    <div className="text-sm text-gray-400">Tier: {selectedOrder.tier}</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Amount</label>
                    <div className="text-sm text-white font-medium">
                      {formatAmount(selectedOrder.amount, selectedOrder.currency)}
                    </div>
                    {selectedOrder.originalAmount && selectedOrder.promoDiscount && (
                      <div className="text-sm text-gray-400">
                        Original: ${selectedOrder.originalAmount} ({(selectedOrder.promoDiscount * 100).toFixed(0)}% off)
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Promo Code</label>
                    <div className="text-sm text-green-400">
                      {selectedOrder.promoCode || 'None'}
                    </div>
                  </div>
                </div>

                {selectedOrder.email && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Email</label>
                    <div className="text-sm text-white">{selectedOrder.email}</div>
                  </div>
                )}

                {selectedOrder.walletAddress && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Wallet Address</label>
                    <div className="text-sm text-white font-mono bg-gray-700 p-2 rounded">
                      {selectedOrder.walletAddress}
                    </div>
                  </div>
                )}

                {selectedOrder.txHash && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Transaction Hash</label>
                    <div className="text-sm text-white font-mono bg-gray-700 p-2 rounded flex items-center justify-between">
                      <span>{selectedOrder.txHash}</span>
                      <a
                        href={`https://etherscan.io/tx/${selectedOrder.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 ml-2"
                      >
                        <FaExternalLinkAlt />
                      </a>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Created</label>
                    <div className="text-sm text-white">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {selectedOrder.completedAt && (
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Completed</label>
                      <div className="text-sm text-white">
                        {new Date(selectedOrder.completedAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                {selectedOrder.metadata && Object.keys(selectedOrder.metadata).length > 0 && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Metadata</label>
                    <div className="text-sm text-white bg-gray-700 p-3 rounded">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(selectedOrder.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={closeOrderModal}
                  className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
              <FaShoppingCart className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {filteredOrders.length}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Total Orders
            </div>
            <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              All Sources Combined
            </div>
          </div>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
              <FaShoppingCart className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {filteredOrders.filter(o => o.status === 'completed').length}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Completed Orders
            </div>
            <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Successfully processed
            </div>
          </div>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
              <FaShoppingCart className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {filteredOrders.filter(o => o.status === 'pending').length}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Pending Orders
            </div>
            <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Awaiting completion
            </div>
          </div>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
              <FaWallet className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-cyan-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                ${filteredOrders
                  .filter(o => o.currency === 'USD')
                  .reduce((sum, o) => sum + parseFloat(o.amount), 0)
                  .toFixed(2)}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Total Revenue
            </div>
            <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              USD payments only
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources Info */}
      <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl shadow-xl">
        <div className="p-6 border-b border-gray-700/20">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            <FaFilter className="text-blue-400" />
            Data Sources
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg">
              <span className="text-gray-300 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Main Orders Collection:
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {filteredOrders.filter(o => !o.metadata?.source || o.metadata.source === 'orders').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg">
              <span className="text-gray-300 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Onchain Orders:
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {filteredOrders.filter(o => o.metadata?.source === 'onchain_orders').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg">
              <span className="text-gray-300 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Boost Points:
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-300 border border-green-500/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {filteredOrders.filter(o => o.metadata?.source === 'boost_points').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg">
              <span className="text-gray-300 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Subscription Orders:
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-500/10 text-orange-300 border border-orange-500/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {filteredOrders.filter(o => o.metadata?.source === 'subscription_orders').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg">
              <span className="text-gray-300 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Token Registrations:
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {filteredOrders.filter(o => o.metadata?.source === 'token_registrations').length}
              </span>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-700/20 rounded-lg border border-gray-600/20">
            <p className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              This page now shows historical orders from all database collections including legacy data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersComponent;
