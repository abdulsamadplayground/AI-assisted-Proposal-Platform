'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import showToast from '@/lib/toast'

interface Section {
  id: string
  name: string
  displayName: string
  description: string
  required: boolean
  order: number
  outputFormat: string
  minLength?: number
  maxLength?: number
  fontColor: string
  fontSize: string
  position: string
  sops: SOP[]
}

interface SOP {
  id: string
  name: string
  description: string
  enforcement: 'strict' | 'warning' | 'advisory'
  type: string
  parameters: any
}

export default function CreateSchemaPage() {
  const router = useRouter()
  
  const [schemaTitle, setSchemaTitle] = useState('')
  const [schemaDescription, setSchemaDescription] = useState('')
  const [sections, setSections] = useState<Section[]>([])
  const [currentSection, setCurrentSection] = useState<Section | null>(null)
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [showSOPModal, setShowSOPModal] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)

  // Section form state
  const [sectionForm, setSectionForm] = useState({
    name: '',
    displayName: '',
    description: '',
    required: true,
    outputFormat: 'text',
    minLength: '',
    maxLength: '',
    fontColor: '#000000',
    fontSize: '16px',
    position: 'left'
  })

  // SOP form state
  const [sopForm, setSOPForm] = useState({
    name: '',
    description: '',
    enforcement: 'strict' as 'strict' | 'warning' | 'advisory',
    type: 'length',
    parameters: {}
  })

  const handleAddSection = () => {
    setSectionForm({
      name: '',
      displayName: '',
      description: '',
      required: true,
      outputFormat: 'text',
      minLength: '',
      maxLength: '',
      fontColor: '#000000',
      fontSize: '16px',
      position: 'left'
    })
    setEditingSectionId(null)
    setCurrentSection(null)
    setShowSectionModal(true)
  }

  const handleEditSection = (section: Section) => {
    setSectionForm({
      name: section.name,
      displayName: section.displayName,
      description: section.description,
      required: section.required,
      outputFormat: section.outputFormat,
      minLength: section.minLength?.toString() || '',
      maxLength: section.maxLength?.toString() || '',
      fontColor: section.fontColor,
      fontSize: section.fontSize,
      position: section.position
    })
    setEditingSectionId(section.id)
    setCurrentSection(section)
    setShowSectionModal(true)
  }

  const handleSaveSection = () => {
    if (!sectionForm.name || !sectionForm.displayName) {
      showToast.error('Please fill in required fields (Name and Display Name)')
      return
    }

    const newSection: Section = {
      id: editingSectionId || `section-${Date.now()}`,
      name: sectionForm.name,
      displayName: sectionForm.displayName,
      description: sectionForm.description,
      required: sectionForm.required,
      order: editingSectionId ? currentSection!.order : sections.length + 1,
      outputFormat: sectionForm.outputFormat,
      minLength: sectionForm.minLength ? parseInt(sectionForm.minLength) : undefined,
      maxLength: sectionForm.maxLength ? parseInt(sectionForm.maxLength) : undefined,
      fontColor: sectionForm.fontColor,
      fontSize: sectionForm.fontSize,
      position: sectionForm.position,
      sops: editingSectionId ? currentSection!.sops : []
    }

    if (editingSectionId) {
      setSections(sections.map(s => s.id === editingSectionId ? newSection : s))
      showToast.success('Section updated successfully')
    } else {
      setSections([...sections, newSection])
      showToast.success('Section added successfully')
    }

    setShowSectionModal(false)
    setCurrentSection(null)
    setEditingSectionId(null)
  }

  const handleAddSOP = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    setCurrentSection(section)
    setSOPForm({
      name: '',
      description: '',
      enforcement: 'strict',
      type: 'length',
      parameters: {}
    })
    setShowSOPModal(true)
  }

  const handleSaveSOP = () => {
    if (!sopForm.name || !sopForm.description) {
      showToast.error('Please fill in required fields (Name and Description)')
      return
    }

    const newSOP: SOP = {
      id: `sop-${Date.now()}`,
      name: sopForm.name,
      description: sopForm.description,
      enforcement: sopForm.enforcement,
      type: sopForm.type,
      parameters: sopForm.parameters
    }

    setSections(sections.map(section => {
      if (section.id === currentSection?.id) {
        return {
          ...section,
          sops: [...section.sops, newSOP]
        }
      }
      return section
    }))

    setShowSOPModal(false)
    setCurrentSection(null)
    showToast.success('SOP added successfully - Will be STRICTLY ENFORCED')
  }

  const handleDeleteSection = (sectionId: string) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return
    setSections(sections.filter(s => s.id !== sectionId))
    showToast.success('Section deleted')
  }

  const handleDeleteSOP = (sectionId: string, sopId: string) => {
    if (!window.confirm('Are you sure you want to delete this SOP?')) return
    
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          sops: section.sops.filter(sop => sop.id !== sopId)
        }
      }
      return section
    }))
    showToast.success('SOP deleted')
  }

  const handleSaveSchema = async () => {
    if (!schemaTitle) {
      showToast.error('Please enter a schema title')
      return
    }

    if (sections.length === 0) {
      showToast.error('Please add at least one section')
      return
    }

    const loadingToast = showToast.loading('Creating schema...')

    const schema = {
      name: schemaTitle,
      version: '1.0.0',
      description: schemaDescription,
      sections: sections.map(section => ({
        id: section.id,
        name: section.name,
        display_name: section.displayName,
        description: section.description,
        required: section.required,
        order: section.order,
        output_format: section.outputFormat,
        min_length: section.minLength,
        max_length: section.maxLength,
        rules: section.sops.map(sop => ({
          id: sop.id,
          name: sop.name,
          type: sop.type,
          description: sop.description,
          enforcement: sop.enforcement,
          parameters: sop.parameters,
          error_message: `Rule violation: ${sop.name}`
        })),
        styling: {
          font_color: section.fontColor,
          font_size: section.fontSize,
          position: section.position
        }
      })),
      global_rules: []
    }
    
    try {
      const response = await fetch('http://localhost:3001/api/schemas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schema)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create schema')
      }

      showToast.dismiss(loadingToast)
      showToast.success('Schema created successfully!')
      setTimeout(() => router.push('/admin/schemas'), 1000)
    } catch (error) {
      showToast.dismiss(loadingToast)
      showToast.error(error instanceof Error ? error.message : 'Failed to create schema')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Create New Schema</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schema Title *
            </label>
            <input
              type="text"
              value={schemaTitle}
              onChange={(e) => setSchemaTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Construction Proposal Schema"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={schemaDescription}
              onChange={(e) => setSchemaDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Describe the purpose of this schema..."
            />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Sections</h2>
          <button
            onClick={handleAddSection}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Add Section
          </button>
        </div>

        {sections.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📄</div>
            <p>No sections added yet. Click "Add Section" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.sort((a, b) => a.order - b.order).map((section) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500">#{section.order}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{section.displayName}</h3>
                      {section.required && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Required</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                    
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span>Format: {section.outputFormat}</span>
                      {section.minLength && <span>Min: {section.minLength} chars</span>}
                      {section.maxLength && <span>Max: {section.maxLength} chars</span>}
                      <span style={{ color: section.fontColor }}>Color: {section.fontColor}</span>
                      <span>Size: {section.fontSize}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditSection(section)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* SOPs */}
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-700">
                      SOPs (Standard Operating Procedures) - STRICTLY ENFORCED
                    </h4>
                    <button
                      onClick={() => handleAddSOP(section.id)}
                      className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      ➕ Add SOP
                    </button>
                  </div>

                  {section.sops.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No SOPs defined yet</p>
                  ) : (
                    <div className="space-y-2">
                      {section.sops.map((sop) => (
                        <div key={sop.id} className="bg-purple-50 border border-purple-200 rounded p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm text-gray-900">{sop.name}</span>
                                <span className={`px-2 py-0.5 text-xs rounded ${
                                  sop.enforcement === 'strict' ? 'bg-red-100 text-red-800' :
                                  sop.enforcement === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {sop.enforcement.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{sop.description}</p>
                              <p className="text-xs text-gray-500 mt-1">Type: {sop.type}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteSOP(section.id, sop.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => router.push('/admin/schemas')}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveSchema}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          💾 Save Schema
        </button>
      </div>

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full m-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSectionId ? 'Edit Section' : 'Add New Section'}
            </h3>
            
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Name (ID) *
                  </label>
                  <input
                    type="text"
                    value={sectionForm.name}
                    onChange={(e) => setSectionForm({...sectionForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., executive_summary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={sectionForm.displayName}
                    onChange={(e) => setSectionForm({...sectionForm, displayName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Executive Summary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={sectionForm.description}
                  onChange={(e) => setSectionForm({...sectionForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Describe this section..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Format
                  </label>
                  <select
                    value={sectionForm.outputFormat}
                    onChange={(e) => setSectionForm({...sectionForm, outputFormat: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  >
                    <option value="text" className="text-gray-900">Text</option>
                    <option value="structured" className="text-gray-900">Structured</option>
                    <option value="list" className="text-gray-900">List</option>
                    <option value="markdown" className="text-gray-900">Markdown</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={sectionForm.required}
                      onChange={(e) => setSectionForm({...sectionForm, required: e.target.checked})}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Required Section</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Length (characters)
                  </label>
                  <input
                    type="number"
                    value={sectionForm.minLength}
                    onChange={(e) => setSectionForm({...sectionForm, minLength: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., 100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Length (characters)
                  </label>
                  <input
                    type="number"
                    value={sectionForm.maxLength}
                    onChange={(e) => setSectionForm({...sectionForm, maxLength: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., 1000"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Styling Options</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Color
                    </label>
                    <input
                      type="color"
                      value={sectionForm.fontColor}
                      onChange={(e) => setSectionForm({...sectionForm, fontColor: e.target.value})}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Size
                    </label>
                    <select
                      value={sectionForm.fontSize}
                      onChange={(e) => setSectionForm({...sectionForm, fontSize: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                    >
                      <option value="12px" className="text-gray-900">12px</option>
                      <option value="14px" className="text-gray-900">14px</option>
                      <option value="16px" className="text-gray-900">16px</option>
                      <option value="18px" className="text-gray-900">18px</option>
                      <option value="20px" className="text-gray-900">20px</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <select
                      value={sectionForm.position}
                      onChange={(e) => setSectionForm({...sectionForm, position: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                    >
                      <option value="left" className="text-gray-900">Left</option>
                      <option value="center" className="text-gray-900">Center</option>
                      <option value="right" className="text-gray-900">Right</option>
                      <option value="justify" className="text-gray-900">Justify</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowSectionModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingSectionId ? 'Update Section' : 'Add Section'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOP Modal */}
      {showSOPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full m-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add SOP (Standard Operating Procedure)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              SOPs are STRICTLY ENFORCED by the Rule + LLM engine during content generation.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SOP Name *
                </label>
                <input
                  type="text"
                  value={sopForm.name}
                  onChange={(e) => setSOPForm({...sopForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Minimum Word Count"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={sopForm.description}
                  onChange={(e) => setSOPForm({...sopForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Describe what this SOP enforces..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enforcement Level *
                  </label>
                  <select
                    value={sopForm.enforcement}
                    onChange={(e) => setSOPForm({...sopForm, enforcement: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  >
                    <option value="strict" className="text-gray-900">Strict (Must Pass)</option>
                    <option value="warning" className="text-gray-900">Warning (Can Proceed)</option>
                    <option value="advisory" className="text-gray-900">Advisory (Suggestion)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rule Type *
                  </label>
                  <select
                    value={sopForm.type}
                    onChange={(e) => setSOPForm({...sopForm, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  >
                    <option value="length" className="text-gray-900">Length</option>
                    <option value="pattern" className="text-gray-900">Pattern</option>
                    <option value="required_field" className="text-gray-900">Required Field</option>
                    <option value="validation" className="text-gray-900">Validation</option>
                    <option value="format" className="text-gray-900">Format</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowSOPModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSOP}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add SOP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
