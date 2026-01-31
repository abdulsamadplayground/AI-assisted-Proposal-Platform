'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Clock, Users, Settings, TrendingUp, Timer, FilePlus, ClipboardList, UserPlus } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface Proposal {
  id: string
  title: string
  user_name?: string
  status: string
  created_at: string
}

interface Stats {
  totalProposals: number
  awaitingApproval: number
  underReview: number
  acceptedThisWeek: number
  rejectedThisWeek: number
  totalUsers: number
  activeSchemas: number
  avgProcessingTime: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProposals: 0,
    awaitingApproval: 0,
    underReview: 0,
    acceptedThisWeek: 0,
    rejectedThisWeek: 0,
    totalUsers: 0,
    activeSchemas: 0,
    avgProcessingTime: '0 hours'
  })
  const [recentProposals, setRecentProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch proposals
      const proposalsResponse = await fetch('http://localhost:3001/api/proposals', {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!proposalsResponse.ok) {
        throw new Error('Failed to fetch proposals')
      }

      const proposals: Proposal[] = await proposalsResponse.json()

      // Fetch users count
      let usersCount = 0
      try {
        const usersResponse = await fetch('http://localhost:3001/api/users', {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (usersResponse.ok) {
          const users = await usersResponse.json()
          usersCount = users.length
        }
      } catch (err) {
        console.error('Failed to fetch users:', err)
      }

      // Fetch schemas count
      let schemasCount = 0
      try {
        const schemasResponse = await fetch('http://localhost:3001/api/schemas', {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (schemasResponse.ok) {
          const schemas = await schemasResponse.json()
          schemasCount = schemas.length
        }
      } catch (err) {
        console.error('Failed to fetch schemas:', err)
      }

      // Calculate stats from fetched data
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const calculatedStats: Stats = {
        totalProposals: proposals.length,
        awaitingApproval: proposals.filter(p => 
          p.status.toLowerCase() === 'pending_approval' || 
          p.status.toLowerCase() === 'awaiting_approval'
        ).length,
        underReview: proposals.filter(p => p.status.toLowerCase() === 'under_review').length,
        acceptedThisWeek: proposals.filter(p => 
          (p.status.toLowerCase() === 'approved' || p.status.toLowerCase() === 'accepted') &&
          new Date(p.created_at) >= oneWeekAgo
        ).length,
        rejectedThisWeek: proposals.filter(p => 
          p.status.toLowerCase() === 'rejected' &&
          new Date(p.created_at) >= oneWeekAgo
        ).length,
        totalUsers: usersCount,
        activeSchemas: schemasCount,
        avgProcessingTime: '2.5 hours' // TODO: Calculate from actual data
      }
      
      setStats(calculatedStats)
      
      // Get 3 most recent proposals
      const sorted = [...proposals].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setRecentProposals(sorted.slice(0, 3))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data'
      setError(message)
      showToast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    const styles = {
      awaiting_approval: 'bg-yellow-100 text-yellow-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      accepted: 'bg-green-100 text-green-800',
      approved: 'bg-green-100 text-green-800',
    }
    
    const labels = {
      awaiting_approval: 'Awaiting Approval',
      pending_approval: 'Pending Approval',
      under_review: 'Under Review',
      rejected: 'Rejected',
      accepted: 'Accepted',
      approved: 'Approved',
    }

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[statusLower as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[statusLower as keyof typeof labels] || status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
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
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-blue-100">
          Manage proposals, schemas, and users from this central hub
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-200 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Total Proposals</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalProposals}</div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-200 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Awaiting Approval</div>
              <div className="mt-2 text-3xl font-bold text-yellow-600">{stats.awaitingApproval}</div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <Link href="/admin/proposals" className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
            Review now →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-200 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Active Users</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <Link href="/admin/users" className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
            Manage users →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-200 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Active Schemas</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{stats.activeSchemas}</div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <Link href="/admin/schemas" className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
            Manage schemas →
          </Link>
        </div>
      </div>

      {/* Weekly Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-200 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Accepted</span>
              <span className="text-lg font-bold text-green-600">{stats.acceptedThisWeek}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rejected</span>
              <span className="text-lg font-bold text-red-600">{stats.rejectedThisWeek}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Under Review</span>
              <span className="text-lg font-bold text-blue-600">{stats.underReview}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-200 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Acceptance Rate</h3>
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-center justify-center h-24">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">
                {Math.round((stats.acceptedThisWeek / (stats.acceptedThisWeek + stats.rejectedThisWeek)) * 100)}%
              </div>
              <div className="text-sm text-gray-500 mt-1">This week</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-200 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Avg Processing Time</h3>
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
              <Timer className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center justify-center h-24">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{stats.avgProcessingTime}</div>
              <div className="text-sm text-gray-500 mt-1">Per proposal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Proposals */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Proposals</h2>
            <Link href="/admin/proposals" className="text-sm text-blue-600 hover:text-blue-800">
              View all →
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentProposals.map((proposal) => (
            <div key={proposal.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{proposal.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    By {proposal.user_name || 'Unknown'} • {new Date(proposal.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {getStatusBadge(proposal.status)}
                  <Link
                    href={`/admin/proposals/${proposal.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Review →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/schemas/create"
          className="group bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3 group-hover:bg-blue-200 transition-colors">
            <FilePlus className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Schema</h3>
          <p className="text-sm text-gray-600">
            Define sections, rules, and SOPs for proposal generation
          </p>
        </Link>

        <Link
          href="/admin/proposals"
          className="group bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3 group-hover:bg-green-200 transition-colors">
            <ClipboardList className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Proposals</h3>
          <p className="text-sm text-gray-600">
            Review, edit, accept, or reject user submissions
          </p>
        </Link>

        <Link
          href="/admin/users"
          className="group bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3 group-hover:bg-purple-200 transition-colors">
            <UserPlus className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h3>
          <p className="text-sm text-gray-600">
            Assign schemas and monitor user activity
          </p>
        </Link>
      </div>
    </div>
  )
}
