'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaEye, FaExternalLinkAlt, FaFilter, FaSearch } from 'react-icons/fa';

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
        <h2 className="text-2xl font-semibold">All Orders</h2>
        <Link href="/admin" className="text-sm underline text-gray-300">
          Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
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
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading orders...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">Error: {error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700 text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-4 py-3 font-mono text-xs">
                      {order.id.slice(-8)}...
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-xs bg-gray-600 px-2 py-1 rounded">
                        {order.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{order.productName || 'N/A'}</div>
                      {order.tier && (
                        <div className="text-xs text-gray-400">Tier: {order.tier}</div>
                      )}
                      {order.tokenSymbol && (
                        <div className="text-xs text-cyan-400">Token: {order.tokenSymbol}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {order.email || order.walletAddress?.slice(0, 8) + '...' || 'N/A'}
                      </div>
                      {order.promoCode && (
                        <div className="text-xs text-green-400">Promo: {order.promoCode}</div>
                      )}
                      {order.metadata?.source && (
                        <div className="text-xs text-gray-500">
                          Source: {order.metadata.source.replace('_', ' ')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${getPaymentMethodBadge(order.paymentMethod)}`}>
                        {order.paymentMethod.toUpperCase()}
                      </span>
                      {order.txHash && (
                        <div className="text-xs text-blue-400 mt-1">
                          <a
                            href={`https://etherscan.io/tx/${order.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            TX <FaExternalLinkAlt />
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">
                        {formatAmount(order.amount, order.currency)}
                      </div>
                      {order.originalAmount && order.promoDiscount && (
                        <div className="text-xs text-gray-400 line-through">
                          ${order.originalAmount}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openOrderModal(order)}
                        className="text-cyan-400 hover:text-cyan-300 p-1"
                        title="View Details"
                      >
                        <FaEye />
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl font-bold text-white">{filteredOrders.length}</div>
          <div className="text-sm text-gray-400">Total Orders</div>
          <div className="text-xs text-cyan-400 mt-1">All Sources Combined</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl font-bold text-green-400">
            {filteredOrders.filter(o => o.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-400">Completed</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl font-bold text-yellow-400">
            {filteredOrders.filter(o => o.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-400">Pending</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl font-bold text-cyan-400">
            ${filteredOrders
              .filter(o => o.currency === 'USD')
              .reduce((sum, o) => sum + parseFloat(o.amount), 0)
              .toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Total Revenue (USD)</div>
        </div>
      </div>

      {/* Data Sources Info */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">Data Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Main Orders Collection:</span>
            <span className="text-blue-400 font-medium">
              {filteredOrders.filter(o => !o.metadata?.source || o.metadata.source === 'orders').length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Onchain Orders:</span>
            <span className="text-purple-400 font-medium">
              {filteredOrders.filter(o => o.metadata?.source === 'onchain_orders').length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Boost Points:</span>
            <span className="text-green-400 font-medium">
              {filteredOrders.filter(o => o.metadata?.source === 'boost_points').length}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          This page now shows historical orders from all database collections including legacy data.
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersComponent;
