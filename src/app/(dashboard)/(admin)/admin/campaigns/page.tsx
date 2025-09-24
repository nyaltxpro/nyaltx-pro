"use client";

import React, { useEffect, useState } from "react";

type Campaign = {
  id: string;
  name: string;
  description: string;
  status: "draft" | "active" | "paused" | "completed";
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  createdAt: string;
  updatedAt: string;
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Mock data for now - replace with actual API call
  const mockCampaigns: Campaign[] = [
    {
      id: "1",
      name: "Q4 Token Launch Campaign",
      description: "Promotional campaign for new token launches in Q4",
      status: "active",
      startDate: "2024-10-01",
      endDate: "2024-12-31",
      budget: 50000,
      spent: 12500,
      impressions: 125000,
      clicks: 2500,
      conversions: 125,
      createdAt: "2024-09-15T10:00:00Z",
      updatedAt: "2024-09-16T15:30:00Z"
    },
    {
      id: "2",
      name: "Airdrop Awareness Campaign",
      description: "Increase awareness for upcoming airdrops",
      status: "paused",
      startDate: "2024-09-01",
      endDate: "2024-11-30",
      budget: 25000,
      spent: 8750,
      impressions: 87500,
      clicks: 1750,
      conversions: 87,
      createdAt: "2024-08-20T14:00:00Z",
      updatedAt: "2024-09-10T09:15:00Z"
    },
    {
      id: "3",
      name: "Trading Platform Promotion",
      description: "Drive traffic to trading platform features",
      status: "completed",
      startDate: "2024-07-01",
      endDate: "2024-08-31",
      budget: 30000,
      spent: 29800,
      impressions: 298000,
      clicks: 5960,
      conversions: 298,
      createdAt: "2024-06-15T12:00:00Z",
      updatedAt: "2024-09-01T10:00:00Z"
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filter campaigns based on status
        let filteredCampaigns = mockCampaigns;
        if (statusFilter !== "all") {
          filteredCampaigns = mockCampaigns.filter(c => c.status === statusFilter);
        }
        
        // Simulate pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);
        
        setCampaigns(paginatedCampaigns);
        setTotal(filteredCampaigns.length);
      } catch (err) {
        setError("Failed to load campaigns");
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, [page, limit, statusFilter]);

  const updateCampaignStatus = async (id: string, newStatus: Campaign["status"]) => {
    try {
      setBusyId(id);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setCampaigns(prev => 
        prev?.map(campaign => 
          campaign.id === id 
            ? { ...campaign, status: newStatus, updatedAt: new Date().toISOString() }
            : campaign
        ) || null
      );
    } catch (err) {
      setError("Failed to update campaign status");
    } finally {
      setBusyId(null);
    }
  };

  const getStatusBadge = (status: Campaign["status"]) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "active":
        return `${baseClasses} bg-green-900 text-green-300`;
      case "paused":
        return `${baseClasses} bg-yellow-900 text-yellow-300`;
      case "completed":
        return `${baseClasses} bg-blue-900 text-blue-300`;
      case "draft":
        return `${baseClasses} bg-gray-900 text-gray-300`;
      default:
        return `${baseClasses} bg-gray-900 text-gray-300`;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return "0%";
    return ((clicks / impressions) * 100).toFixed(2) + "%";
  };

  const calculateConversionRate = (conversions: number, clicks: number) => {
    if (clicks === 0) return "0%";
    return ((conversions / clicks) * 100).toFixed(2) + "%";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Campaign Management</h2>
        <button className="rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-sm font-medium transition-colors">
          Create Campaign
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-sm">Total Campaigns</div>
          <div className="text-3xl font-bold">{mockCampaigns.length}</div>
        </div>
        <div className="rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-sm">Active Campaigns</div>
          <div className="text-3xl font-bold">{mockCampaigns.filter(c => c.status === 'active').length}</div>
        </div>
        <div className="rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-sm">Total Budget</div>
          <div className="text-3xl font-bold">{formatCurrency(mockCampaigns.reduce((sum, c) => sum + c.budget, 0))}</div>
        </div>
        <div className="rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-sm">Total Spent</div>
          <div className="text-3xl font-bold">{formatCurrency(mockCampaigns.reduce((sum, c) => sum + c.spent, 0))}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm text-gray-400">Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-gray-700 bg-gray-900 px-3 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Campaigns</h3>
        </div>

        {error && (
          <div className="text-sm text-red-400 mb-4 p-3 rounded bg-red-900/20 border border-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-400 py-8 text-center">Loading campaigns...</div>
        ) : !campaigns || campaigns.length === 0 ? (
          <div className="text-gray-400 py-8 text-center">No campaigns found.</div>
        ) : (
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Campaign</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Duration</th>
                  <th scope="col" className="px-6 py-3">Budget</th>
                  <th scope="col" className="px-6 py-3">Performance</th>
                  <th scope="col" className="px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                          {campaign.description}
                        </div>
                      </div>
                    </th>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(campaign.status)}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <div>{new Date(campaign.startDate).toLocaleDateString()}</div>
                        <div className="text-gray-400">to {new Date(campaign.endDate).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <div>{formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}</div>
                        <div className="text-gray-400">
                          {((campaign.spent / campaign.budget) * 100).toFixed(1)}% spent
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <div>{formatNumber(campaign.impressions)} impressions</div>
                        <div>{formatNumber(campaign.clicks)} clicks ({calculateCTR(campaign.clicks, campaign.impressions)})</div>
                        <div>{formatNumber(campaign.conversions)} conversions ({calculateConversionRate(campaign.conversions, campaign.clicks)})</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2">
                        {campaign.status === "active" && (
                          <button
                            disabled={busyId === campaign.id}
                            onClick={() => updateCampaignStatus(campaign.id, "paused")}
                            className="rounded bg-yellow-600 hover:bg-yellow-500 px-2 py-1 text-xs disabled:opacity-50"
                          >
                            Pause
                          </button>
                        )}
                        {campaign.status === "paused" && (
                          <button
                            disabled={busyId === campaign.id}
                            onClick={() => updateCampaignStatus(campaign.id, "active")}
                            className="rounded bg-green-600 hover:bg-green-500 px-2 py-1 text-xs disabled:opacity-50"
                          >
                            Resume
                          </button>
                        )}
                        <button className="rounded border border-gray-700 px-2 py-1 text-xs hover:bg-gray-800">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 text-sm text-gray-300">
              <div>
                Page {page} of {Math.max(1, Math.ceil(total / limit))} • Total {total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded border border-gray-700 px-3 py-1 disabled:opacity-50 hover:bg-gray-800"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <button
                  className="rounded border border-gray-700 px-3 py-1 disabled:opacity-50 hover:bg-gray-800"
                  disabled={page >= Math.max(1, Math.ceil(total / limit))}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
