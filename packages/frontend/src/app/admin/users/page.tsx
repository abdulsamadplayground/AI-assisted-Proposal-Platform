'use client'

import { API_URL } from '@/lib/api'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { showToast } from '@/lib/toast'

interface User {
  id: string
  name: string
  email: string
  role: string
  assigned_schema_id?: string
  assigned_schema_name?: string
  created_at: string
  weeklyStats?: {
    submissions: number
    accepted: number
    rejected: number
    needsEditing: number
  }
}

interface Schema {
  id: string
  name: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [schemas, setSchemas] = useState<Schema[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedSchemaId, setSelectedSchemaId] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch users
      const usersResponse = await fetch(`${API_URL}/api/users`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!usersResponse.ok) {
        throw new Error('Failed to fetch users')
      }

      const usersData = await usersResponse.json()

      // Fetch schemas
      const schemasResponse = await fetch(`${API_URL}/api/schemas`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!schemasResponse.ok) {
        throw new Error('Failed to fetch schemas')
      }

      const schemasData = await schemasResponse.json()
      
      setUsers(usersData)
      setSchemas(schemasData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data'
      setError(message)
      showToast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignSchema = (user: User) => {
    setSelectedUser(user)
    setSelectedSchemaId(user.assigned_schema_id || '')
    setShowAssignModal(true)
  }

  const handleSaveAssignment = async () => {
    if (!selectedUser || !selectedSchemaId) {
      showToast.error('Please select a schema')
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/users/${selectedUser.id}/assign-schema`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schema_id: selectedSchemaId }),
      })

      if (!response.ok) {
        throw new Error('Failed to assign schema')
      }

      const selectedSchema = schemas.find(s => s.id === selectedSchemaId)
      showToast.success(`Schema "${selectedSchema?.name}" assigned to ${selectedUser.name}`)
      setShowAssignModal(false)
      fetchData() // Refresh data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to assign schema'
      showToast.error(message)
    }
  }

  const calculateAcceptanceRate = (stats?: User['weeklyStats']) => {
    if (!stats || stats.submissions === 0) return 0
    return Math.round((stats.accepted / stats.submissions) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Users</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchData}
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage users, assign schemas, and monitor activity
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          ➕ Add New User
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Users</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{users.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Weekly Submissions</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">
            {users.reduce((sum, user) => sum + (user.weeklyStats?.submissions || 0), 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Accepted This Week</div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {users.reduce((sum, user) => sum + (user.weeklyStats?.accepted || 0), 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Avg Acceptance Rate</div>
          <div className="mt-2 text-3xl font-bold text-purple-600">
            {users.length > 0 ? Math.round(
              users.reduce((sum, user) => sum + calculateAcceptanceRate(user.weeklyStats), 0) / users.length
            ) : 0}%
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned Schema
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Weekly Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acceptance Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {user.assigned_schema_name || 'No schema assigned'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.weeklyStats ? (
                      <div className="flex items-center space-x-4">
                        <span title="Submissions">📝 {user.weeklyStats.submissions}</span>
                        <span title="Accepted" className="text-green-600">✓ {user.weeklyStats.accepted}</span>
                        <span title="Rejected" className="text-red-600">✗ {user.weeklyStats.rejected}</span>
                        <span title="Needs Editing" className="text-yellow-600">✏️ {user.weeklyStats.needsEditing}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">No data</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.weeklyStats ? (
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${calculateAcceptanceRate(user.weeklyStats)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {calculateAcceptanceRate(user.weeklyStats)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleAssignSchema(user)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Assign Schema
                  </button>
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="text-green-600 hover:text-green-900"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Schema Modal */}
      {showAssignModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Schema to {selectedUser.name}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Schema
              </label>
              <select
                value={selectedSchemaId}
                onChange={(e) => setSelectedSchemaId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="" className="text-gray-900">Select a schema</option>
                {schemas.map((schema) => (
                  <option key={schema.id} value={schema.id} className="text-gray-900">
                    {schema.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700">
                This user will use the selected schema for all their proposal submissions.
                The schema defines sections, rules, and SOPs that will be enforced.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAssignment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Assign Schema
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
