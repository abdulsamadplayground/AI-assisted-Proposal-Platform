'use client'

import showToast from '@/lib/toast'

export default function ToastDemoPage() {
  const handlePromiseDemo = () => {
    const fakeApiCall = () => new Promise((resolve) => {
      setTimeout(resolve, 2000)
    })

    showToast.promise(
      fakeApiCall(),
      {
        loading: 'Processing your request...',
        success: 'Request completed successfully!',
        error: 'Request failed'
      }
    )
  }

  const handleLoadingDemo = () => {
    const toast = showToast.loading('Uploading files...')
    
    setTimeout(() => {
      showToast.dismiss(toast)
      showToast.success('Upload complete!')
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Toast Notifications Demo</h1>
        <p className="text-gray-600">
          Click the buttons below to see different toast notification styles
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Toasts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => showToast.success('Operation completed successfully!')}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            ✓ Success
          </button>

          <button
            onClick={() => showToast.error('Something went wrong. Please try again.')}
            className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            ✗ Error
          </button>

          <button
            onClick={() => showToast.warning('This action cannot be undone!')}
            className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            ⚠️ Warning
          </button>

          <button
            onClick={() => showToast.info('New features are now available')}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ℹ️ Info
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Advanced Toasts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleLoadingDemo}
            className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ⏳ Loading Toast
          </button>

          <button
            onClick={handlePromiseDemo}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            🔄 Promise Toast
          </button>

          <button
            onClick={() => showToast.dismissAll()}
            className="px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            🗑️ Dismiss All
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Real-World Examples</h2>
        <div className="space-y-3">
          <button
            onClick={() => {
              showToast.success('Schema "Construction Proposal" is now active')
            }}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
          >
            <div className="font-medium">Schema Activated</div>
            <div className="text-sm text-gray-500">Example: Admin activates a schema</div>
          </button>

          <button
            onClick={() => {
              showToast.error('Please fill in required fields (Name and Display Name)')
            }}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors text-left"
          >
            <div className="font-medium">Form Validation Error</div>
            <div className="text-sm text-gray-500">Example: Missing required fields</div>
          </button>

          <button
            onClick={() => {
              const toast = showToast.loading('Regenerating section with Rule + LLM engine...')
              setTimeout(() => {
                showToast.dismiss(toast)
                showToast.success('Section regenerated successfully!')
              }, 2500)
            }}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <div className="font-medium">Section Regeneration</div>
            <div className="text-sm text-gray-500">Example: AI regenerates proposal section</div>
          </button>

          <button
            onClick={() => {
              showToast.success('Proposal accepted! User will be notified.')
            }}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
          >
            <div className="font-medium">Proposal Accepted</div>
            <div className="text-sm text-gray-500">Example: Admin accepts a proposal</div>
          </button>

          <button
            onClick={() => {
              showToast.success('SOP added successfully - Will be STRICTLY ENFORCED')
            }}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
          >
            <div className="font-medium">SOP Added</div>
            <div className="text-sm text-gray-500">Example: Admin adds a new SOP to schema</div>
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">📚 Usage Guide</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>Success:</strong> Use for completed actions (green, 3s)</p>
          <p><strong>Error:</strong> Use for validation errors and failures (red, 4s)</p>
          <p><strong>Warning:</strong> Use for cautions and non-critical issues (yellow, 3.5s)</p>
          <p><strong>Info:</strong> Use for informational messages (blue, 3s)</p>
          <p><strong>Loading:</strong> Use for async operations (gray, until dismissed)</p>
          <p className="pt-2 border-t border-blue-200">
            <strong>⚠️ Never use alert()!</strong> Always use toast notifications for better UX.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Code Examples</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-mono text-gray-800">
              <div className="text-green-600">// Success</div>
              <div>showToast.success('Operation completed!')</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-mono text-gray-800">
              <div className="text-green-600">// Error</div>
              <div>showToast.error('Something went wrong')</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-mono text-gray-800">
              <div className="text-green-600">// Loading with dismiss</div>
              <div>const toast = showToast.loading('Processing...')</div>
              <div>await doWork()</div>
              <div>showToast.dismiss(toast)</div>
              <div>showToast.success('Done!')</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-mono text-gray-800">
              <div className="text-green-600">// Promise-based</div>
              <div>showToast.promise(apiCall(), {'{'}</div>
              <div className="ml-4">loading: 'Saving...',</div>
              <div className="ml-4">success: 'Saved!',</div>
              <div className="ml-4">error: 'Failed'</div>
              <div>{'})'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
