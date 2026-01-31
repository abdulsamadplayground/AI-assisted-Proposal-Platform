'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import { Paperclip, X, Sparkles } from 'lucide-react';

interface Schema {
  id: string;
  name: string;
  description: string;
}

export default function CreateProposalPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [selectedSchema, setSelectedSchema] = useState('');
  const [surveyNotes, setSurveyNotes] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  // Schemas from database
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [schemasLoading, setSchemasLoading] = useState(true);
  const [schemasError, setSchemasError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchemas();
  }, []);

  const fetchSchemas = async () => {
    try {
      setSchemasLoading(true);
      setSchemasError(null);

      const response = await fetch('http://localhost:3001/api/schemas', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        setSchemasError('Authentication error. Please try again.');
        showToast.error('Authentication error. Please try again.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch schemas');
      }

      const data = await response.json();
      setSchemas(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load schemas';
      setSchemasError(message);
      showToast.error(message);
    } finally {
      setSchemasLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
      showToast.success(`${newFiles.length} file(s) added`);
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
    showToast.info('File removed');
  };

  const handleNext = () => {
    if (step === 1 && !title.trim()) {
      showToast.error('Please enter a proposal title');
      return;
    }
    if (step === 2 && !selectedSchema) {
      showToast.error('Please select a schema');
      return;
    }
    if (step === 3 && !surveyNotes.trim()) {
      showToast.error('Please enter survey notes');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleGenerateProposal = async () => {
    if (!surveyNotes.trim()) {
      showToast.error('Survey notes are required');
      return;
    }

    setIsGenerating(true);
    showToast.loading('Generating proposal with AI...', { id: 'generating' });

    try {
      // Call backend API to create proposal
      const response = await fetch('http://localhost:3001/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          schema_id: selectedSchema,
          survey_notes: surveyNotes,
          attachments: attachments.map(f => f.name),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate proposal');
      }

      const data = await response.json();
      
      showToast.dismiss('generating');
      showToast.success('Proposal generated successfully!');
      
      // Redirect to the created proposal - handle both response formats
      setTimeout(() => {
        const proposalId = data.id || data.proposal?.id;
        if (proposalId) {
          router.push(`/user/proposals/${proposalId}`);
        } else {
          console.error('No proposal ID in response:', data);
          showToast.error('Proposal created but unable to redirect');
          router.push('/user/proposals');
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error generating proposal:', error);
      showToast.dismiss('generating');
      showToast.error(error instanceof Error ? error.message : 'Failed to generate proposal. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Proposal</h1>
        <p className="mt-2 text-gray-600">
          Follow the steps to create your proposal with AI assistance
        </p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  step >= stepNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNum}
              </div>
              <div className="ml-3 flex-1">
                <div
                  className={`text-sm font-medium ${
                    step >= stepNum ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {stepNum === 1 && 'Title'}
                  {stepNum === 2 && 'Schema'}
                  {stepNum === 3 && 'Survey Notes'}
                  {stepNum === 4 && 'Attachments'}
                </div>
              </div>
              {stepNum < 4 && (
                <div
                  className={`h-1 w-full mx-4 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow p-8">
        {/* Step 1: Title */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Step 1: Enter Proposal Title
            </h2>
            <p className="text-gray-600 mb-6">
              Give your proposal a clear and descriptive title
            </p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Office Building Construction Proposal"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              autoFocus
            />
          </div>
        )}

        {/* Step 2: Schema Selection */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Step 2: Select Schema Type
            </h2>
            <p className="text-gray-600 mb-6">
              Choose the schema that best fits your proposal type
            </p>
            
            {schemasLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading schemas...</p>
              </div>
            ) : schemasError ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Schemas</h3>
                <p className="text-gray-600 mb-6">{schemasError}</p>
                <button
                  onClick={fetchSchemas}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : schemas.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Schemas Available</h3>
                <p className="text-gray-600 mb-6">Please contact an administrator to create schemas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schemas.map((schema) => (
                  <button
                    key={schema.id}
                    onClick={() => setSelectedSchema(schema.id)}
                    className={`p-6 border-2 rounded-lg text-left transition-all ${
                      selectedSchema === schema.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 mt-1 ${
                          selectedSchema === schema.id
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedSchema === schema.id && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{schema.name}</h3>
                        <p className="text-sm text-gray-600">{schema.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Survey Notes */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Step 3: Enter Survey Notes
            </h2>
            <p className="text-gray-600 mb-6">
              Provide detailed notes about your proposal. The AI will use these notes to generate content that follows the schema rules and SOPs.
            </p>
            <textarea
              value={surveyNotes}
              onChange={(e) => setSurveyNotes(e.target.value)}
              placeholder="Enter your survey notes here...&#10;&#10;Example:&#10;- Project: Office Building Construction&#10;- Location: Downtown Seattle&#10;- Budget: $2.5M&#10;- Timeline: 18 months&#10;- Key Requirements: LEED certification, 5 floors, parking garage&#10;- Client: ABC Corporation"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              rows={15}
              autoFocus
            />
            <div className="mt-2 text-sm text-gray-500">
              {surveyNotes.length} characters
            </div>
          </div>
        )}

        {/* Step 4: Attachments (Optional) */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Step 4: Add Attachments (Optional)
            </h2>
            <p className="text-gray-600 mb-6">
              Upload any supporting documents, images, or files
            </p>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                    <Paperclip className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="text-lg font-medium text-gray-900 mb-2">
                  Click to upload files
                </div>
                <div className="text-sm text-gray-600">
                  or drag and drop files here
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Supported: Images, PDF, Word, Excel
                </div>
              </label>
            </div>

            {/* Attached Files List */}
            {attachments.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Attached Files ({attachments.length})
                </h3>
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center flex-1">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-3">
                          <Paperclip className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              step === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← Back
          </button>

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleGenerateProposal}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                isGenerating
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105'
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Proposal
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Proposal Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="text-blue-700 font-medium w-32">Title:</span>
            <span className="text-blue-900">{title || 'Not set'}</span>
          </div>
          <div className="flex">
            <span className="text-blue-700 font-medium w-32">Schema:</span>
            <span className="text-blue-900">
              {schemas.find(s => s.id === selectedSchema)?.name || 'Not selected'}
            </span>
          </div>
          <div className="flex">
            <span className="text-blue-700 font-medium w-32">Survey Notes:</span>
            <span className="text-blue-900">
              {surveyNotes ? `${surveyNotes.length} characters` : 'Not entered'}
            </span>
          </div>
          <div className="flex">
            <span className="text-blue-700 font-medium w-32">Attachments:</span>
            <span className="text-blue-900">{attachments.length} file(s)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
