'use client';

import { API_URL } from '@/lib/api';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';

interface Rule {
  name: string;
  type: string;
  description: string;
  parameters: Record<string, any>;
  severity: 'error' | 'warning';
}

interface Section {
  id?: string;
  name: string;
  display_name: string;
  description: string;
  order: number;
  required: boolean;
  min_length?: number;
  max_length?: number;
  output_format: string;
  rules: Rule[];
  styling?: {
    font_color?: string;
    font_size?: string;
    position?: string;
  };
}

interface Schema {
  id: string;
  name: string;
  version: string;
  description: string;
  sections: Section[];
  global_rules: Rule[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface SchemaVersion {
  id: string;
  schema_id: string;
  version_number: number;
  name: string;
  version: string;
  description: string;
  sections: Section[];
  global_rules: Rule[];
  change_summary: string;
  created_by: string;
  created_at: string;
}

export default function SchemaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const schemaId = params.id as string;

  const [schema, setSchema] = useState<Schema | null>(null);
  const [versions, setVersions] = useState<SchemaVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  // Edit form state
  const [editedName, setEditedName] = useState('');
  const [editedVersion, setEditedVersion] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedSections, setEditedSections] = useState<Section[]>([]);
  const [editedGlobalRules, setEditedGlobalRules] = useState<Rule[]>([]);
  const [changeSummary, setChangeSummary] = useState('');

  useEffect(() => {
    fetchSchema();
    fetchVersions();
  }, [schemaId]);

  const fetchSchema = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/schemas/${schemaId}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch schema');
      }

      const data = await response.json();
      setSchema(data);
      setEditedName(data.name);
      setEditedVersion(data.version);
      setEditedDescription(data.description);
      setEditedSections(data.sections);
      setEditedGlobalRules(data.global_rules);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schema');
      showToast.error('Failed to load schema');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/schemas/${schemaId}/versions`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setVersions(data);
      }
    } catch (err) {
      console.error('Failed to fetch versions:', err);
    }
  };

  const handleSave = async () => {
    if (!editedName.trim()) {
      showToast.error('Schema name is required');
      return;
    }

    if (editedSections.length === 0) {
      showToast.error('At least one section is required');
      return;
    }

    const loadingToast = showToast.loading('Saving schema...');

    try {
      const response = await fetch(`${API_URL}/api/schemas/${schemaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editedName,
          version: editedVersion,
          description: editedDescription,
          sections: editedSections,
          global_rules: editedGlobalRules,
          change_summary: changeSummary || 'Schema updated',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update schema');
      }

      const updatedSchema = await response.json();
      setSchema(updatedSchema);
      setIsEditing(false);
      setChangeSummary('');
      showToast.dismiss(loadingToast);
      showToast.success('Schema updated successfully');
      
      // Refresh versions
      fetchVersions();
    } catch (err) {
      showToast.dismiss(loadingToast);
      showToast.error('Failed to update schema');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this schema?')) {
      return;
    }

    const loadingToast = showToast.loading('Deleting schema...');

    try {
      const response = await fetch(`${API_URL}/api/schemas/${schemaId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to delete schema');
      }

      showToast.dismiss(loadingToast);
      showToast.success('Schema deleted successfully');
      router.push('/admin/schemas');
    } catch (err) {
      showToast.dismiss(loadingToast);
      showToast.error('Failed to delete schema');
    }
  };

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: '',
      display_name: '',
      description: '',
      order: editedSections.length + 1,
      required: true,
      output_format: 'text',
      rules: [],
    };
    setEditedSections([...editedSections, newSection]);
  };

  const updateSection = (index: number, field: keyof Section, value: any) => {
    const updated = [...editedSections];
    updated[index] = { ...updated[index], [field]: value };
    setEditedSections(updated);
  };

  const removeSection = (index: number) => {
    setEditedSections(editedSections.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schema...</p>
        </div>
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Schema not found'}</p>
          <button
            onClick={() => router.push('/admin/schemas')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Schemas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push('/admin/schemas')}
              className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
            >
              ← Back to Schemas
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Schema' : schema.name}
            </h1>
            <p className="text-gray-600 mt-1">Version {schema.version}</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setShowVersions(!showVersions)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  {showVersions ? 'Hide' : 'Show'} Version History ({versions.length})
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit Schema
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedName(schema.name);
                    setEditedVersion(schema.version);
                    setEditedDescription(schema.description);
                    setEditedSections(schema.sections);
                    setEditedGlobalRules(schema.global_rules);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Version History */}
      {showVersions && versions.length > 0 && (
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Version History</h2>
          <div className="space-y-4">
            {versions.map((version) => (
              <div key={version.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Version {version.version_number}</p>
                    <p className="text-sm text-gray-600">{version.change_summary}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(version.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    v{version.version}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schema Details / Edit Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-6">
              {/* Change Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Change Summary *
                </label>
                <input
                  type="text"
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  placeholder="Describe what changed in this version"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schema Name *
                </label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version
                </label>
                <input
                  type="text"
                  value={editedVersion}
                  onChange={(e) => setEditedVersion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Sections */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Sections</h3>
                  <button
                    onClick={addSection}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    + Add Section
                  </button>
                </div>
                <div className="space-y-4">
                  {editedSections.map((section, index) => (
                    <div key={section.id || index} className="border border-gray-300 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Section {index + 1}</h4>
                        <button
                          onClick={() => removeSection(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={section.name}
                            onChange={(e) => updateSection(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Display Name</label>
                          <input
                            type="text"
                            value={section.display_name}
                            onChange={(e) => updateSection(index, 'display_name', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm text-gray-700 mb-1">Description</label>
                          <textarea
                            value={section.description}
                            onChange={(e) => updateSection(index, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Output Format</label>
                          <select
                            value={section.output_format}
                            onChange={(e) => updateSection(index, 'output_format', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
                          >
                            <option value="text" className="text-gray-900">Text</option>
                            <option value="paragraph" className="text-gray-900">Paragraph</option>
                            <option value="bullet_points" className="text-gray-900">Bullet Points</option>
                            <option value="timeline" className="text-gray-900">Timeline</option>
                            <option value="structured" className="text-gray-900">Structured</option>
                          </select>
                        </div>
                        <div>
                          <label className="flex items-center text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={section.required}
                              onChange={(e) => updateSection(index, 'required', e.target.checked)}
                              className="mr-2"
                            />
                            Required
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* View Mode */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 text-gray-900">{schema.description || 'No description'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Sections ({schema.sections.length})</h3>
                <div className="space-y-3">
                  {schema.sections.map((section, index) => (
                    <div key={section.id || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{section.display_name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>Format: {section.output_format}</span>
                            <span>{section.required ? 'Required' : 'Optional'}</span>
                            {section.rules && section.rules.length > 0 && (
                              <span>{section.rules.length} rules</span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                          Order: {section.order}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {schema.global_rules && schema.global_rules.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">
                    Global Rules ({schema.global_rules.length})
                  </h3>
                  <div className="space-y-2">
                    {schema.global_rules.map((rule, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-3 py-2">
                        <p className="font-medium text-sm">{rule.name}</p>
                        <p className="text-xs text-gray-600">{rule.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="text-sm text-gray-900">{new Date(schema.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="text-sm text-gray-900">{new Date(schema.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
