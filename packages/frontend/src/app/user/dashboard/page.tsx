'use client';

import { API_URL } from '@/lib/api';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, FilePlus, Clock } from 'lucide-react';
import { showToast } from '@/lib/toast';

interface Proposal {
  id: string;
  title: string;
  schema_name?: string;
  status: string;
  version: number;
  updated_at: string;
}

interface Stats {
  totalProposals: number;
  draftProposals: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
}

export default function UserDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProposals: 0,
    draftProposals: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
  });
  const [recentProposals, setRecentProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/proposals`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch proposals');
      }

      const proposals: Proposal[] = await response.json();
      
      // Calculate stats from fetched data
      const calculatedStats: Stats = {
        totalProposals: proposals.length,
        draftProposals: proposals.filter(p => p.status.toLowerCase() === 'draft').length,
        pendingApproval: proposals.filter(p => p.status.toLowerCase() === 'pending_approval').length,
        approved: proposals.filter(p => p.status.toLowerCase() === 'approved').length,
        rejected: proposals.filter(p => p.status.toLowerCase() === 'rejected').length,
      };
      
      setStats(calculatedStats);
      
      // Get 3 most recent proposals
      const sorted = [...proposals].sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      setRecentProposals(sorted.slice(0, 3));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(message);
      showToast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending_approval':
        return 'Pending Approval';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'draft':
        return 'Draft';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's an overview of your proposals.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total Proposals</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalProposals}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Drafts</div>
          <div className="mt-2 text-3xl font-bold text-gray-500">{stats.draftProposals}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Pending Approval</div>
          <div className="mt-2 text-3xl font-bold text-yellow-600">{stats.pendingApproval}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Approved</div>
          <div className="mt-2 text-3xl font-bold text-green-600">{stats.approved}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Rejected</div>
          <div className="mt-2 text-3xl font-bold text-red-600">{stats.rejected}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/user/proposals/create"
            className="group flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors">
              <FilePlus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Create New Proposal</div>
              <div className="text-sm text-gray-600">Start a new proposal from scratch</div>
            </div>
          </Link>
          <Link
            href="/user/proposals?filter=draft"
            className="group flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mr-4 group-hover:bg-gray-200 transition-colors">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Continue Draft</div>
              <div className="text-sm text-gray-600">Resume working on drafts</div>
            </div>
          </Link>
          <Link
            href="/user/proposals?filter=pending"
            className="group flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mr-4 group-hover:bg-yellow-200 transition-colors">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">View Pending</div>
              <div className="text-sm text-gray-600">Check proposals awaiting approval</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Proposals */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Proposals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schema
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{proposal.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{proposal.schema_name || 'No schema'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(proposal.status)}`}>
                      {formatStatus(proposal.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">v{proposal.version}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{new Date(proposal.updated_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/user/proposals/${proposal.id}`}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
