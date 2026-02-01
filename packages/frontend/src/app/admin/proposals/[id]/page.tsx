'use client'

import { API_URL } from '@/lib/api'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { showToast } from '@/lib/toast'

interface ProposalSection {
  id: string
  name: string
  content: string
  confidence_score?: number
  rationale?: string
  source_references?: string[]
  missing_info?: string[]
  ruleEnforcement?: {
    passed: boolean
    violations: any[]
    warnings: string[]
  }
}

interface ProposalVersion {
  id: string
  version_number: number
  sections: ProposalSection[]
  change_description: string
  created_at: string
  created_by_name: string
  created_by_email: string
}

interface Proposal {
  id: string
  title: string
  user_name?: string
  status: string
  created_at: string
  schema_name?: string
  survey_notes?: string
  sections?: ProposalSection[]
}

export default function ProposalReviewPage() {
  const params = useParams()
  const router = useRouter()
  const proposalId = params.id as string

  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editedSections, setEditedSections] = useState<{[key: string]: string}>({})
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectComments, setRejectComments] = useState('')
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [versions, setVersions] = useState<ProposalVersion[]>([])
  const [loadingVersions, setLoadingVersions] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<ProposalVersion | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchProposal()
  }, [proposalId])

  const fetchProposal = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_URL}/api/proposals/${proposalId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch proposal')
      }

      const data = await response.json()
      setProposal(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load proposal'
      setError(message)
      showToast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSection = (sectionId: string, content: string) => {
    setEditedSections({
      ...editedSections,
      [sectionId]: content
    })
  }

  const handleSaveEdits = async () => {
    if (!proposal) return

    try {
      // Update edited sections
      const updatedSections = proposal.sections?.map(section => ({
        ...section,
        content: editedSections[section.id] || section.content
      }))
      
      const response = await fetch(`${API_URL}/api/proposals/${proposalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: updatedSections,
          status: 'under_review'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save changes')
      }

      setEditMode(false)
      setEditedSections({})
      showToast.success('Changes saved! Proposal status updated to "Under Review"')
      fetchProposal() // Refresh data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save changes'
      showToast.error(message)
    }
  }

  const handleRegenerateSection = async (sectionId: string) => {
    setRegeneratingSection(sectionId)
    
    const loadingToast = showToast.loading('Regenerating section with Rule + LLM engine...')
    
    try {
      const response = await fetch(`${API_URL}/api/proposals/${proposalId}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ section_type: sectionId }),
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate section')
      }

      showToast.dismiss(loadingToast)
      showToast.success('Section regenerated successfully!')
      fetchProposal() // Refresh data
    } catch (err) {
      showToast.dismiss(loadingToast)
      const message = err instanceof Error ? err.message : 'Failed to regenerate section'
      showToast.error(message)
    } finally {
      setRegeneratingSection(null)
    }
  }

  const handleRegenerateAll = async () => {
    if (!window.confirm('Are you sure you want to regenerate all sections? This will replace all current content.')) {
      return
    }
    
    setRegeneratingSection('all')
    
    const loadingToast = showToast.loading('Regenerating all sections with Rule + LLM engine...')
    
    try {
      const response = await fetch(`${API_URL}/api/proposals/${proposalId}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ section_type: 'all' }),
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate proposal')
      }

      showToast.dismiss(loadingToast)
      showToast.success('All sections regenerated successfully!')
      fetchProposal() // Refresh data
    } catch (err) {
      showToast.dismiss(loadingToast)
      const message = err instanceof Error ? err.message : 'Failed to regenerate proposal'
      showToast.error(message)
    } finally {
      setRegeneratingSection(null)
    }
  }

  const handleAccept = async () => {
    if (!window.confirm('Are you sure you want to accept this proposal?')) {
      return
    }
    
    try {
      const response = await fetch(`${API_URL}/api/proposals/${proposalId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to approve proposal')
      }

      showToast.success('Proposal accepted! User will be notified.')
      setTimeout(() => router.push('/admin/proposals'), 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve proposal'
      showToast.error(message)
    }
  }

  const handleReject = async () => {
    if (!rejectComments.trim()) {
      showToast.error('Please provide comments for rejection')
      return
    }
    
    try {
      const response = await fetch(`${API_URL}/api/proposals/${proposalId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comments: rejectComments }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject proposal')
      }

      showToast.success('Proposal rejected! User will be notified with your comments.')
      setShowRejectModal(false)
      setTimeout(() => router.push('/admin/proposals'), 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject proposal'
      showToast.error(message)
    }
  }

  const fetchVersionHistory = async () => {
    setLoadingVersions(true)
    try {
      const response = await fetch(`${API_URL}/api/proposals/${proposalId}/versions`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch version history')
      }

      const data = await response.json()
      setVersions(data)
      setShowVersionHistory(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load version history'
      showToast.error(message)
    } finally {
      setLoadingVersions(false)
    }
  }

  const handleExportToWord = async () => {
    setExporting(true)
    const loadingToast = showToast.loading('Exporting to Word document...')
    
    try {
      const response = await fetch(`${API_URL}/api/proposals/${proposalId}/export`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to export proposal')
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${proposal?.title.replace(/[^a-z0-9]/gi, '_')}.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      showToast.dismiss(loadingToast)
      showToast.success('Proposal exported successfully!')
    } catch (err) {
      showToast.dismiss(loadingToast)
      const message = err instanceof Error ? err.message : 'Failed to export proposal'
      showToast.error(message)
    } finally {
      setExporting(false)
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
          <p className="mt-4 text-gray-600">Loading proposal...</p>
        </div>
      </div>
    )
  }

  if (error || !proposal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Proposal</h3>
          <p className="text-gray-600 mb-6">{error || 'Proposal not found'}</p>
          <button
            onClick={fetchProposal}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-4"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/admin/proposals')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Proposals
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">{proposal.title}</h1>
              {getStatusBadge(proposal.status)}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">User:</span>
                <span className="ml-2 font-medium">{proposal.user_name || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-gray-500">Schema:</span>
                <span className="ml-2 font-medium">{proposal.schema_name || 'No schema'}</span>
              </div>
              <div>
                <span className="text-gray-500">Submitted:</span>
                <span className="ml-2 font-medium">
                  {new Date(proposal.created_at).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Proposal ID:</span>
                <span className="ml-2 font-medium">{proposal.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editMode ? '✏️ Editing Mode' : '✏️ Edit Proposal'}
          </button>
          
          <button
            onClick={handleRegenerateAll}
            disabled={regeneratingSection !== null}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {regeneratingSection === 'all' ? '⏳ Regenerating...' : '🔄 Regenerate All Sections'}
          </button>
          
          {editMode && (
            <button
              onClick={handleSaveEdits}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              💾 Save Changes
            </button>
          )}
          
          <button
            onClick={fetchVersionHistory}
            disabled={loadingVersions}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loadingVersions ? '⏳ Loading...' : '📜 View Versions'}
          </button>
          
          {proposal.status === 'approved' && (
            <button
              onClick={handleExportToWord}
              disabled={exporting}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {exporting ? '⏳ Exporting...' : '📄 Export to Word'}
            </button>
          )}
          
          <div className="flex-1"></div>
          
          <button
            onClick={() => setShowRejectModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            ❌ Reject
          </button>
          
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            ✅ Accept
          </button>
        </div>
      </div>

      {/* Survey Notes */}
      {proposal.survey_notes && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Original Survey Notes</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{proposal.survey_notes}</p>
          </div>
        </div>
      )}

      {/* Proposal Sections */}
      {proposal.sections && proposal.sections.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Proposal Sections</h2>
          
          {proposal.sections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                
                {/* AI Metadata */}
                {section.confidence_score !== undefined && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-gray-600">AI Confidence:</span>
                    <div className="flex items-center gap-1">
                      <div className="w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            section.confidence_score >= 0.8 ? 'bg-green-500' :
                            section.confidence_score >= 0.6 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${section.confidence_score * 100}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${
                        section.confidence_score >= 0.8 ? 'text-green-700' :
                        section.confidence_score >= 0.6 ? 'text-yellow-700' :
                        'text-red-700'
                      }`}>
                        {(section.confidence_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Rule Enforcement Status */}
                {section.ruleEnforcement && (
                  <div className="mt-2 flex items-center space-x-2">
                    {section.ruleEnforcement.passed ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        ✓ All Rules Passed
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                        ✗ Rule Violations: {section.ruleEnforcement.violations.length}
                      </span>
                    )}
                    
                    {section.ruleEnforcement.warnings.length > 0 && (
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                        ⚠ {section.ruleEnforcement.warnings.length} Warnings
                      </span>
                    )}
                  </div>
                )}
                
                {/* Warnings */}
                {section.ruleEnforcement && section.ruleEnforcement.warnings.length > 0 && (
                  <div className="mt-2 text-xs text-yellow-700">
                    {section.ruleEnforcement.warnings.map((warning, idx) => (
                      <div key={idx}>• {warning}</div>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => handleRegenerateSection(section.id)}
                disabled={regeneratingSection !== null}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50"
              >
                {regeneratingSection === section.id ? '⏳ Regenerating...' : '🔄 Regenerate'}
              </button>
            </div>
            
            {/* AI Rationale */}
            {section.rationale && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-blue-700 font-medium text-sm flex-shrink-0">AI Rationale:</span>
                  <p className="text-blue-900 text-sm">{section.rationale}</p>
                </div>
              </div>
            )}
            
            {/* Source References */}
            {section.source_references && section.source_references.length > 0 && (
              <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-green-700 font-medium text-sm flex-shrink-0">Sources from Survey:</span>
                  <div className="text-green-900 text-sm space-y-1">
                    {section.source_references.map((ref, idx) => (
                      <div key={idx} className="flex items-start gap-1">
                        <span className="text-green-600">•</span>
                        <span className="italic">"{ref}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Missing Info */}
            {section.missing_info && section.missing_info.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-700 font-medium text-sm flex-shrink-0">Missing Information:</span>
                  <div className="text-yellow-900 text-sm space-y-1">
                    {section.missing_info.map((info, idx) => (
                      <div key={idx} className="flex items-start gap-1">
                        <span className="text-yellow-600">⚠</span>
                        <span>{info}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {editMode ? (
              <textarea
                value={editedSections[section.id] !== undefined ? editedSections[section.id] : section.content}
                onChange={(e) => handleEditSection(section.id, e.target.value)}
                className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Edit section content..."
              />
            ) : (
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{section.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Proposal</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide comments explaining why this proposal is being rejected. The user will receive these comments.
            </p>
            <textarea
              value={rejectComments}
              onChange={(e) => setRejectComments(e.target.value)}
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter rejection comments..."
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject Proposal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
              <button
                onClick={() => {
                  setShowVersionHistory(false)
                  setSelectedVersion(null)
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {selectedVersion ? (
                <div>
                  <button
                    onClick={() => setSelectedVersion(null)}
                    className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    ← Back to version list
                  </button>
                  
                  <div className="mb-4">
                    <h4 className="text-xl font-semibold text-gray-900">
                      Version {selectedVersion.version_number}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedVersion.change_description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Modified by {selectedVersion.created_by_name} on{' '}
                      {new Date(selectedVersion.created_at).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedVersion.sections.map((section) => (
                      <div key={section.id} className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900 mb-2">{section.name}</h5>
                        <p className="text-gray-700 whitespace-pre-wrap text-sm">{section.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedVersion(version)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">
                              Version {version.version_number}
                            </span>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {version.sections.length} sections
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {version.change_description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Modified by {version.created_by_name} on{' '}
                            {new Date(version.created_at).toLocaleString()}
                          </p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          View →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
