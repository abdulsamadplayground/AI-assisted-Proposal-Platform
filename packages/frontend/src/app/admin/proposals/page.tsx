'use client'

import { API_URL } from '@/lib/api'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { showToast } from '@/lib/toast'

interface Proposal {
  id: string
  title: string
  user_name?: string
  status: string
  created_at: string
  schema_name?: string
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_URL}/api/proposals`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch proposals')
      }

      const data = await response.json()
      setProposals(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load proposals'
      setError(message)
      showToast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    const styles = {
      pending_approval: 'bg-yellow-100 text-yellow-800',
      awaiting_approval: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      accepted: 'bg-green-100 text-green-800',
      approved: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
    }
    
    const labels = {
      pending_approval: 'Pending Approval',
      awaiting_approval: 'Awaiting Approval',
      under_review: 'Under Review',
      rejected: 'Rejected',
      accepted: 'Accepted',
      approved: 'Approved',
      draft: 'Draft',
    }

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[statusLower as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[statusLower as keyof typeof labels] || status}
      </span>
    )
  }

  const filteredProposals = filterStatus === 'all' 
    ? proposals 
    : proposals.filter(p => p.status.toLowerCase() === filterStatus.toLowerCase())

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading proposals...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Proposals</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchProposals}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proposal Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review, edit, and manage user-submitted proposals
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          >
            <option value="all" className="text-gray-900">All Proposals</option>
            <option value="pending_approval" className="text-gray-900">Pending Approval</option>
            <option value="under_review" className="text-gray-900">Under Review</option>
            <option value="approved" className="text-gray-900">Approved</option>
            <option value="rejected" className="text-gray-900">Rejected</option>
            <option value="draft" className="text-gray-900">Draft</option>
          </select>
          
          <div className="flex-1"></div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredProposals.length} of {proposals.length} proposals
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proposal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Schema
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProposals.map((proposal) => (
              <tr key={proposal.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{proposal.title}</div>
                  <div className="text-sm text-gray-500">ID: {proposal.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{proposal.user_name || 'Unknown'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{proposal.schema_name || 'No schema'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(proposal.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(proposal.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/proposals/${proposal.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Pending Approval</div>
          <div className="mt-2 text-3xl font-bold text-yellow-600">
            {proposals.filter(p => p.status.toLowerCase() === 'pending_approval' || p.status.toLowerCase() === 'awaiting_approval').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Under Review</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">
            {proposals.filter(p => p.status.toLowerCase() === 'under_review').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Approved</div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {proposals.filter(p => p.status.toLowerCase() === 'approved' || p.status.toLowerCase() === 'accepted').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Rejected</div>
          <div className="mt-2 text-3xl font-bold text-red-600">
            {proposals.filter(p => p.status.toLowerCase() === 'rejected').length}
          </div>
        </div>
      </div>
    </div>
  )
}
