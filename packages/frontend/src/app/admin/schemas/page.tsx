'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import showToast from '@/lib/toast'

interface Schema {
  id: string
  name: string
  version: string
  description: string
  sections: any[]
  global_rules: any[]
  created_at: string
}

export default function SchemasPage() {
  const [schemas, setSchemas] = useState<Schema[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSchemas()
  }, [])

  const fetchSchemas = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/schemas', {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch schemas')
      }

      const data = await response.json()
      setSchemas(data)
    } catch (error) {
      showToast.error('Failed to load schemas')
      console.error('Error fetching schemas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSchema = async (schemaId: string) => {
    if (!window.confirm('Are you sure you want to delete this schema?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/schemas/${schemaId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete schema')
      }

      setSchemas(schemas.filter(schema => schema.id !== schemaId))
      showToast.success('Schema deleted successfully')
    } catch (error) {
      showToast.error('Failed to delete schema')
      console.error('Error deleting schema:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schemas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schema Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage proposal schemas with sections and enforced SOPs
          </p>
        </div>
        <Link
          href="/admin/schemas/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ Create New Schema
        </Link>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">ℹ️</span>
          <div>
            <h3 className="text-sm font-semibold text-blue-900">About Schemas</h3>
            <p className="mt-1 text-sm text-blue-700">
              Schemas define the structure of proposals with sections, styling, and STRICTLY ENFORCED SOPs.
              All rules and SOPs are enforced by the Rule + LLM engine during content generation.
            </p>
          </div>
        </div>
      </div>

      {/* Schemas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schemas.map((schema) => {
          const sectionCount = Array.isArray(schema.sections) ? schema.sections.length : 0
          const ruleCount = Array.isArray(schema.sections) 
            ? schema.sections.reduce((total, section) => total + (section.rules?.length || 0), 0)
            : 0

          return (
            <div
              key={schema.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-transparent"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{schema.name}</h3>
                    <p className="text-sm text-blue-100 mt-1">v{schema.version}</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">{schema.description || 'No description'}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Sections:</span>
                    <span className="font-medium text-gray-900">{sectionCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Rules/SOPs:</span>
                    <span className="font-medium text-gray-900">{ruleCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(schema.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2">
                  <Link
                    href={`/admin/schemas/${schema.id}`}
                    className="w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📝 View Schema
                  </Link>
                  
                  <button
                    onClick={() => handleDeleteSchema(schema.id)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {schemas.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schemas Yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first schema to start generating structured proposals
          </p>
          <Link
            href="/admin/schemas/create"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Schema
          </Link>
        </div>
      )}
    </div>
  )
}
