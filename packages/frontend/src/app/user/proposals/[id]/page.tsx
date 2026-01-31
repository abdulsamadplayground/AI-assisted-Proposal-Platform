'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { showToast } from '@/lib/toast';
import { Eye, Edit, Save, RefreshCw, Send, Clock, CheckCircle, XCircle, FileText, Calendar, Hash } from 'lucide-react';

interface ProposalSection {
  id: string;
  name: string;
  content: string;
  type?: string;
}

interface ProposalVersion {
  id: string;
  version_number: number;
  sections: ProposalSection[];
  change_description: string;
  created_at: string;
  created_by_name: string;
  created_by_email: string;
}

interface Proposal {
  id: string;
  title: string;
  schema_name?: string;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
  survey_notes?: string;
  sections?: ProposalSection[];
  admin_comments?: string;
}

export default function ProposalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const proposalId = params.id as string;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedSections, setEditedSections] = useState<{[key: string]: string}>({});
  const [selectedSectionToRegenerate, setSelectedSectionToRegenerate] = useState<string | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState<ProposalVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ProposalVersion | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchProposal();
  }, [proposalId]);

  const fetchProposal = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/proposals/${proposalId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch proposal');
      }

      const data = await response.json();
      setProposal(data);
      
      // Enable editing by default for draft and rejected proposals
      if (data.status.toLowerCase() === 'draft' || data.status.toLowerCase() === 'rejected') {
        setIsEditing(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load proposal';
      setError(message);
      showToast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionEdit = (sectionId: string, newContent: string) => {
    setEditedSections({
      ...editedSections,
      [sectionId]: newContent
    });
  };

  const handleSaveChanges = async () => {
    if (!proposal) return;

    // Allow editing for draft and rejected proposals
    if (proposal.status.toLowerCase() !== 'draft' && proposal.status.toLowerCase() !== 'rejected') {
      showToast.error('Only draft and rejected proposals can be edited');
      return;
    }

    setIsSaving(true);
    const loadingToast = showToast.loading('Saving changes...');

    try {
      // Update edited sections
      const updatedSections = proposal.sections?.map(section => ({
        ...section,
        content: editedSections[section.id] || section.content
      }));
      
      const response = await fetch(`http://localhost:3001/api/proposals/${proposalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: updatedSections
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save changes');
      }

      setEditedSections({});
      showToast.dismiss(loadingToast);
      showToast.success('Changes saved successfully!');
      fetchProposal(); // Refresh data
    } catch (error) {
      showToast.dismiss(loadingToast);
      showToast.error(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateSection = async (sectionId: string) => {
    if (!proposal) return;

    setIsRegenerating(true);
    setSelectedSectionToRegenerate(sectionId);
    showToast.loading('Regenerating section with AI...', { id: 'regenerating' });

    try {
      const section = proposal.sections?.find((s) => s.id === sectionId);
      
      const response = await fetch(`http://localhost:3001/api/proposals/${proposalId}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section_type: section?.type || section?.name
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate section');
      }

      showToast.dismiss('regenerating');
      showToast.success('Section regenerated successfully!');
      fetchProposal(); // Refresh data
    } catch (error) {
      console.error('Error regenerating section:', error);
      showToast.dismiss('regenerating');
      showToast.error(error instanceof Error ? error.message : 'Failed to regenerate section');
    } finally {
      setIsRegenerating(false);
      setSelectedSectionToRegenerate(null);
    }
  };

  const handleRegenerateAll = async () => {
    if (!proposal) return;

    setIsRegenerating(true);
    showToast.loading('Regenerating entire proposal with AI...', { id: 'regenerating-all' });

    try {
      const response = await fetch(`http://localhost:3001/api/proposals/${proposalId}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section_type: 'all'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate proposal');
      }

      showToast.dismiss('regenerating-all');
      showToast.success('Entire proposal regenerated successfully!');
      fetchProposal(); // Refresh data
    } catch (error) {
      console.error('Error regenerating proposal:', error);
      showToast.dismiss('regenerating-all');
      showToast.error(error instanceof Error ? error.message : 'Failed to regenerate proposal');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!window.confirm('Are you sure you want to submit this proposal for approval?')) {
      return;
    }

    setIsSubmitting(true);
    const loadingToast = showToast.loading('Submitting for approval...');

    try {
      const response = await fetch(`http://localhost:3001/api/proposals/${proposalId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit proposal');
      }

      showToast.dismiss(loadingToast);
      showToast.success('Proposal submitted for approval!');
      setIsEditing(false);
      fetchProposal(); // Refresh data
    } catch (error) {
      showToast.dismiss(loadingToast);
      showToast.error(error instanceof Error ? error.message : 'Failed to submit proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchVersionHistory = async () => {
    setLoadingVersions(true);
    try {
      const response = await fetch(`http://localhost:3001/api/proposals/${proposalId}/versions`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch version history');
      }

      const data = await response.json();
      setVersions(data);
      setShowVersionHistory(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load version history';
      showToast.error(message);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleExportToWord = async () => {
    setExporting(true);
    const loadingToast = showToast.loading('Exporting to Word document...');
    
    try {
      const response = await fetch(`http://localhost:3001/api/proposals/${proposalId}/export`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to export proposal');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${proposal?.title.replace(/[^a-z0-9]/gi, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast.dismiss(loadingToast);
      showToast.success('Proposal exported successfully!');
    } catch (err) {
      showToast.dismiss(loadingToast);
      const message = err instanceof Error ? err.message : 'Failed to export proposal';
      showToast.error(message);
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
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
    const statusLower = status.toLowerCase();
    switch (statusLower) {
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
          <p className="mt-4 text-gray-600">Loading proposal...</p>
        </div>
      </div>
    );
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
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          ← Back to Proposals
        </button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{proposal.title}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {proposal.schema_name || 'No schema'}
              </span>
              <span className="flex items-center gap-1">
                <Hash className="w-4 h-4" />
                Version {proposal.version}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Last modified: {new Date(proposal.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <span className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(proposal.status)}`}>
            {formatStatus(proposal.status)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-3">
          {(proposal.status.toLowerCase() === 'draft' || proposal.status.toLowerCase() === 'rejected') && (
            <>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isEditing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                }`}
              >
                {isEditing ? (
                  <>
                    <Eye className="w-4 h-4" />
                    Preview Mode
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    Edit Mode
                  </>
                )}
              </button>
              
              <button
                onClick={handleSaveChanges}
                disabled={isSaving || !isEditing || Object.keys(editedSections).length === 0}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isSaving || !isEditing || Object.keys(editedSections).length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105'
                }`}
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                onClick={handleRegenerateAll}
                disabled={isRegenerating}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isRegenerating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                {isRegenerating ? 'Regenerating...' : 'Regenerate All'}
              </button>

              <button
                onClick={handleSubmitForApproval}
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ml-auto ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                }`}
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : proposal.status.toLowerCase() === 'rejected' ? 'Resubmit for Approval' : 'Submit for Approval'}
              </button>
            </>
          )}

          {proposal.status.toLowerCase() !== 'draft' && (
            <>
              <button
                onClick={fetchVersionHistory}
                disabled={loadingVersions}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  loadingVersions
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105'
                }`}
              >
                {loadingVersions ? '⏳ Loading...' : '📜 View Versions'}
              </button>

              {proposal.status.toLowerCase() === 'approved' && (
                <button
                  onClick={handleExportToWord}
                  disabled={exporting}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    exporting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-teal-600 text-white hover:bg-teal-700 hover:scale-105'
                  }`}
                >
                  {exporting ? '⏳ Exporting...' : '📄 Export to Word'}
                </button>
              )}
            </>
          )}

          {proposal.status.toLowerCase() === 'pending_approval' && (
            <div className="flex items-center justify-center gap-2 w-full text-center py-4 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800 font-medium">
                This proposal is awaiting admin approval
              </p>
            </div>
          )}

          {proposal.status.toLowerCase() === 'approved' && (
            <div className="flex items-center justify-center gap-2 w-full text-center py-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">
                This proposal has been approved
              </p>
            </div>
          )}

          {proposal.status.toLowerCase() === 'rejected' && (
            <div className="w-full">
              <div className="flex items-start gap-2 py-4 px-6 bg-red-50 rounded-lg border border-red-200">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium mb-2">
                    This proposal was rejected by the admin
                  </p>
                  {proposal.admin_comments && (
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <p className="text-sm font-semibold text-red-900 mb-2">Admin Comments:</p>
                      <p className="text-sm text-red-800 whitespace-pre-wrap">{proposal.admin_comments}</p>
                    </div>
                  )}
                  <p className="text-sm text-red-700 mt-3">
                    You can edit the proposal and resubmit it for approval.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {proposal.sections && proposal.sections.length > 0 ? (
          proposal.sections.map((section) => (
            <div key={section.id} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{section.name}</h2>
                {isEditing && (proposal.status.toLowerCase() === 'draft' || proposal.status.toLowerCase() === 'rejected') && (
                  <button
                    onClick={() => handleRegenerateSection(section.id)}
                    disabled={isRegenerating}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                      isRegenerating && selectedSectionToRegenerate === section.id
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200 hover:scale-105'
                    }`}
                  >
                    <RefreshCw className={`w-4 h-4 ${isRegenerating && selectedSectionToRegenerate === section.id ? 'animate-spin' : ''}`} />
                    {isRegenerating && selectedSectionToRegenerate === section.id
                      ? 'Regenerating...'
                      : 'Regenerate Section'}
                  </button>
                )}
              </div>
              <div className="p-6">
                {isEditing && (proposal.status.toLowerCase() === 'draft' || proposal.status.toLowerCase() === 'rejected') ? (
                  <textarea
                    value={editedSections[section.id] !== undefined ? editedSections[section.id] : section.content}
                    onChange={(e) => handleSectionEdit(section.id, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    rows={10}
                  />
                ) : (
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700">
                      {section.content}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sections Yet</h3>
            <p className="text-gray-600">This proposal doesn't have any sections yet.</p>
          </div>
        )}
      </div>

      {/* Survey Notes */}
      {proposal.survey_notes && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Survey Notes</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm">
              {proposal.survey_notes}
            </pre>
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
                  setShowVersionHistory(false);
                  setSelectedVersion(null);
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
                  {versions.length > 0 ? (
                    versions.map((version) => (
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
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No version history available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
