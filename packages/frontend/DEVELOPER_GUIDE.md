# Developer Guide: Toast Notifications

## 🚀 Quick Start

### 1. Import the Toast Utility
```tsx
import showToast from '@/lib/toast'
```

### 2. Use in Your Component
```tsx
const handleClick = () => {
  showToast.success('Action completed!')
}
```

That's it! No setup needed - the `<Toaster />` is already in the root layout.

## 📖 Complete API Reference

### Success Toast
```tsx
showToast.success(message: string, duration?: number)
```
- **Color**: Green (#10B981)
- **Icon**: ✓
- **Default Duration**: 3000ms
- **Use For**: Successful operations, confirmations

**Examples:**
```tsx
showToast.success('Schema created!')
showToast.success('Saved successfully!', 5000) // Custom duration
```

### Error Toast
```tsx
showToast.error(message: string, duration?: number)
```
- **Color**: Red (#EF4444)
- **Icon**: ✗
- **Default Duration**: 4000ms (longer for errors)
- **Use For**: Validation errors, failed operations

**Examples:**
```tsx
showToast.error('Failed to save')
showToast.error('Please fill in required fields')
```

### Warning Toast
```tsx
showToast.warning(message: string, duration?: number)
```
- **Color**: Yellow (#F59E0B)
- **Icon**: ⚠️
- **Default Duration**: 3500ms
- **Use For**: Cautions, non-critical issues

**Examples:**
```tsx
showToast.warning('This action cannot be undone')
showToast.warning('Unsaved changes will be lost')
```

### Info Toast
```tsx
showToast.info(message: string, duration?: number)
```
- **Color**: Blue (#3B82F6)
- **Icon**: ℹ️
- **Default Duration**: 3000ms
- **Use For**: Informational messages

**Examples:**
```tsx
showToast.info('New features available')
showToast.info('Tip: Use Ctrl+S to save')
```

### Loading Toast
```tsx
const toastId = showToast.loading(message: string)
```
- **Color**: Gray (#6B7280)
- **Icon**: ⏳ (animated)
- **Duration**: Until dismissed
- **Use For**: Async operations

**Examples:**
```tsx
const toast = showToast.loading('Processing...')
await doWork()
showToast.dismiss(toast)
showToast.success('Done!')
```

### Promise Toast
```tsx
showToast.promise<T>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string
    error: string
  }
)
```
- **Auto-handles**: Loading → Success/Error
- **Use For**: API calls, async operations

**Examples:**
```tsx
showToast.promise(
  saveData(),
  {
    loading: 'Saving...',
    success: 'Saved successfully!',
    error: 'Failed to save'
  }
)
```

### Dismiss Toast
```tsx
showToast.dismiss(toastId: string)
showToast.dismissAll()
```

**Examples:**
```tsx
const toast = showToast.loading('Loading...')
showToast.dismiss(toast) // Dismiss specific toast
showToast.dismissAll()   // Dismiss all toasts
```

### Custom Toast
```tsx
showToast.custom(message: string, options?: any)
```

**Examples:**
```tsx
showToast.custom('Custom message', {
  icon: '🎉',
  style: {
    background: '#333',
    color: '#fff',
  },
  duration: 5000,
})
```

## 🎯 Common Patterns

### Pattern 1: Form Validation
```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  
  // Validate
  if (!title) {
    showToast.error('Please enter a title')
    return
  }
  
  if (!description) {
    showToast.error('Please enter a description')
    return
  }
  
  // Submit
  handleSave()
}
```

### Pattern 2: Async Operation with Loading
```tsx
const handleSave = async () => {
  const toast = showToast.loading('Saving changes...')
  
  try {
    await api.save(data)
    showToast.dismiss(toast)
    showToast.success('Changes saved successfully!')
  } catch (error) {
    showToast.dismiss(toast)
    showToast.error('Failed to save changes')
  }
}
```

### Pattern 3: Promise-based (Cleaner)
```tsx
const handleSave = async () => {
  showToast.promise(
    api.save(data),
    {
      loading: 'Saving changes...',
      success: 'Changes saved successfully!',
      error: 'Failed to save changes'
    }
  )
}
```

### Pattern 4: Navigation After Success
```tsx
const handleDelete = () => {
  if (!confirm('Are you sure?')) return
  
  deleteItem()
  showToast.success('Item deleted')
  
  // Wait for toast to be visible before navigating
  setTimeout(() => {
    router.push('/list')
  }, 1500)
}
```

### Pattern 5: Multiple Operations
```tsx
const handleBulkAction = async () => {
  const toast = showToast.loading('Processing 10 items...')
  
  try {
    await processItems()
    showToast.dismiss(toast)
    showToast.success('All items processed successfully!')
  } catch (error) {
    showToast.dismiss(toast)
    showToast.error(`Failed to process ${error.count} items`)
  }
}
```

### Pattern 6: Conditional Messages
```tsx
const handleUpdate = async (isNew: boolean) => {
  const toast = showToast.loading(
    isNew ? 'Creating...' : 'Updating...'
  )
  
  try {
    await api.save(data)
    showToast.dismiss(toast)
    showToast.success(
      isNew ? 'Created successfully!' : 'Updated successfully!'
    )
  } catch (error) {
    showToast.dismiss(toast)
    showToast.error('Operation failed')
  }
}
```

## ⚠️ Common Mistakes

### ❌ Mistake 1: Not Dismissing Loading Toast
```tsx
// BAD
const handleSave = async () => {
  showToast.loading('Saving...')
  await api.save()
  showToast.success('Saved!') // Loading toast still visible!
}

// GOOD
const handleSave = async () => {
  const toast = showToast.loading('Saving...')
  await api.save()
  showToast.dismiss(toast)
  showToast.success('Saved!')
}
```

### ❌ Mistake 2: Using alert()
```tsx
// BAD
alert('Success!')

// GOOD
showToast.success('Success!')
```

### ❌ Mistake 3: Navigating Too Quickly
```tsx
// BAD
showToast.success('Saved!')
router.push('/list') // User won't see toast

// GOOD
showToast.success('Saved!')
setTimeout(() => router.push('/list'), 1500)
```

### ❌ Mistake 4: Generic Messages
```tsx
// BAD
showToast.error('Error')
showToast.success('Success')

// GOOD
showToast.error('Failed to save schema')
showToast.success('Schema created successfully!')
```

### ❌ Mistake 5: Wrong Toast Type
```tsx
// BAD
showToast.info('Failed to save') // Should be error
showToast.success('Warning: unsaved changes') // Should be warning

// GOOD
showToast.error('Failed to save')
showToast.warning('Warning: unsaved changes')
```

## 🎨 Customization

### Change Duration
```tsx
showToast.success('Quick message', 2000)  // 2 seconds
showToast.error('Important error', 6000)  // 6 seconds
```

### Change Position (Global)
Edit `src/lib/toast.ts`:
```tsx
toast.success(message, {
  position: 'bottom-center', // or 'top-left', 'bottom-right', etc.
  // ...
})
```

### Custom Styling
```tsx
showToast.custom('Custom', {
  style: {
    background: '#333',
    color: '#fff',
    padding: '20px',
    borderRadius: '12px',
  },
  icon: '🎉',
})
```

### Add Action Button
```tsx
import toast from 'react-hot-toast'

toast((t) => (
  <span>
    Item deleted
    <button
      onClick={() => {
        undoDelete()
        toast.dismiss(t.id)
      }}
      className="ml-2 underline"
    >
      Undo
    </button>
  </span>
))
```

## 🧪 Testing

### Unit Test Example
```tsx
import { render, screen } from '@testing-library/react'
import { Toaster } from 'react-hot-toast'
import showToast from '@/lib/toast'

test('shows success toast', () => {
  render(<Toaster />)
  showToast.success('Test message')
  expect(screen.getByText('Test message')).toBeInTheDocument()
})
```

### Integration Test Example
```tsx
test('shows toast on button click', async () => {
  render(<MyComponent />)
  const button = screen.getByRole('button', { name: /save/i })
  
  fireEvent.click(button)
  
  await waitFor(() => {
    expect(screen.getByText('Saved successfully!')).toBeInTheDocument()
  })
})
```

## 📋 Checklist for New Features

When adding a new feature, ensure:

- [ ] Import `showToast` from `@/lib/toast`
- [ ] Replace any `alert()` calls with appropriate toast
- [ ] Use loading toast for async operations
- [ ] Dismiss loading toast when done
- [ ] Use appropriate toast type (success/error/warning/info)
- [ ] Provide clear, actionable messages
- [ ] Wait before navigation if showing success toast
- [ ] Test toast appears and dismisses correctly
- [ ] Check mobile responsiveness
- [ ] Verify accessibility (keyboard, screen reader)

## 🔍 Debugging

### Toast Not Appearing
1. Check `<Toaster />` is in root layout
2. Verify import: `import showToast from '@/lib/toast'`
3. Check browser console for errors
4. Ensure component is client-side (`'use client'`)

### Toast Dismissed Too Quickly
```tsx
// Increase duration
showToast.success('Message', 5000)
```

### Toast Behind Modal
```tsx
// In root layout
<Toaster toastOptions={{ style: { zIndex: 9999 } }} />
```

### Multiple Toasts Overlapping
```tsx
// Dismiss previous before showing new
showToast.dismissAll()
showToast.success('New message')
```

## 📚 Resources

- **Toast Demo**: `/admin/toast-demo` - Interactive examples
- **Documentation**: `TOAST_NOTIFICATIONS.md` - Complete guide
- **Quick Reference**: `src/lib/README.md` - Cheat sheet
- **Library Docs**: [react-hot-toast](https://react-hot-toast.com/)

## 🎓 Training

### For New Developers

1. Read this guide
2. Visit `/admin/toast-demo` and try all examples
3. Review existing implementations in:
   - `src/app/admin/proposals/[id]/page.tsx`
   - `src/app/admin/schemas/create/page.tsx`
4. Practice with a simple component
5. Review code with team before merging

### Code Review Checklist

When reviewing PRs, check:

- [ ] No `alert()` calls (use toast instead)
- [ ] Appropriate toast type used
- [ ] Loading toasts are dismissed
- [ ] Messages are clear and specific
- [ ] Navigation waits for toast visibility
- [ ] Error handling includes error toasts
- [ ] Success operations show success toasts

## 🚀 Performance

Toast notifications are lightweight and performant:

- **Bundle Size**: ~10KB gzipped
- **Render Time**: <1ms per toast
- **Memory**: Minimal (auto-cleanup)
- **Animations**: GPU-accelerated

## ♿ Accessibility

Toast notifications are accessible:

- ✅ Screen reader announcements
- ✅ Keyboard dismissible (ESC key)
- ✅ Focus management
- ✅ ARIA attributes
- ✅ Color contrast (WCAG AA)
- ✅ Non-blocking (doesn't trap focus)

## 🎯 Summary

**Key Takeaways:**

1. Always use `showToast` instead of `alert()`
2. Choose appropriate toast type for the message
3. Use loading toasts for async operations
4. Dismiss loading toasts when done
5. Provide clear, actionable messages
6. Wait before navigation after success toast
7. Test on mobile and with keyboard
8. Check the demo page for examples

**Remember:** Toast notifications improve UX by providing non-blocking, styled feedback. Use them consistently throughout the application!
