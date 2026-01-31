# Frontend Utilities

## Toast Notifications (`toast.ts`)

### Quick Reference

```tsx
import showToast from '@/lib/toast'

// Success (green) - 3s
showToast.success('Operation completed!')

// Error (red) - 4s
showToast.error('Something went wrong')

// Warning (yellow) - 3.5s
showToast.warning('Please review this')

// Info (blue) - 3s
showToast.info('New update available')

// Loading (gray) - until dismissed
const id = showToast.loading('Processing...')
// ... do work
showToast.dismiss(id)

// Promise-based (auto-handles states)
showToast.promise(
  apiCall(),
  {
    loading: 'Saving...',
    success: 'Saved!',
    error: 'Failed to save'
  }
)
```

### When to Use Each Type

| Type | Use Case | Examples |
|------|----------|----------|
| **Success** | Completed actions | "Schema created", "Proposal accepted", "Changes saved" |
| **Error** | Validation errors, failures | "Required field missing", "Failed to load", "Invalid input" |
| **Warning** | Cautions, non-critical issues | "Unsaved changes", "Action cannot be undone" |
| **Info** | Informational messages | "New features", "Tips", "Status updates" |
| **Loading** | Async operations | "Uploading...", "Processing...", "Generating..." |

### Common Patterns

#### 1. Form Validation
```tsx
const handleSubmit = () => {
  if (!title) {
    showToast.error('Please enter a title')
    return
  }
  // ... submit
}
```

#### 2. Async Operations with Loading
```tsx
const handleSave = async () => {
  const toast = showToast.loading('Saving...')
  try {
    await saveData()
    showToast.dismiss(toast)
    showToast.success('Saved successfully!')
  } catch (error) {
    showToast.dismiss(toast)
    showToast.error('Failed to save')
  }
}
```

#### 3. Navigation After Success
```tsx
const handleDelete = () => {
  showToast.success('Deleted successfully')
  setTimeout(() => router.push('/list'), 1500) // Wait for toast
}
```

#### 4. Confirmation Actions
```tsx
const handleAccept = () => {
  if (!confirm('Are you sure?')) return
  
  setStatus('accepted')
  showToast.success('Proposal accepted!')
}
```

### ⚠️ DO NOT USE `alert()`

```tsx
// ❌ BAD - Blocks UI, looks unprofessional
alert('Success!')

// ✅ GOOD - Non-blocking, styled, auto-dismisses
showToast.success('Success!')
```

### Custom Duration
```tsx
showToast.success('Quick message', 2000)  // 2 seconds
showToast.error('Important error', 6000)  // 6 seconds
```

### Dismiss All Toasts
```tsx
showToast.dismissAll()
```

## Future Utilities

- API client wrapper
- Form validation helpers
- Date/time formatters
- File upload utilities
- Local storage helpers
