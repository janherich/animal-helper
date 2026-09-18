import { afterEach, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { advanceToasts, clearToasts, pauseToast, runToastAction, toasts, useToasts } from '../toasts'

afterEach(() => {
  toasts.value = []
})

it('clears screen and navigation notifications and invalidates stale undo actions', () => {
  const scope = effectScope()
  const manager = scope.run(() => useToasts())!
  const undo = vi.fn()
  const dismissed = vi.fn()
  manager.show({
    title: 'Removed',
    text: '',
    kind: 'info',
    dismissLabel: 'Close',
    action: { label: 'Undo', run: undo },
    onDismiss: dismissed
  })
  const oldToast = toasts.value[0]!
  manager.clear()
  expect(toasts.value).toHaveLength(0)
  expect(dismissed).toHaveBeenCalledTimes(1)
  runToastAction(oldToast)
  expect(undo).not.toHaveBeenCalled()
  manager.show({ title: 'Error', text: '', kind: 'error', dismissLabel: 'Close' })
  clearToasts()
  expect(toasts.value).toHaveLength(0)
  scope.stop()
})

it('expires timed notifications, pauses independently for hover and focus, and preserves errors', () => {
  const scope = effectScope()
  const manager = scope.run(() => useToasts())!
  const id = manager.show({ title: 'Removed', text: 'Removed', kind: 'info', dismissLabel: 'Close', duration: 8000 })
  manager.show({ title: 'Invalid', text: 'Invalid', kind: 'error', dismissLabel: 'Close' })
  advanceToasts(2000)
  expect(toasts.value[0]?.remaining).toBe(6000)
  pauseToast(id, 'hovered', true)
  pauseToast(id, 'focused', true)
  advanceToasts(10000)
  expect(toasts.value[0]?.remaining).toBe(6000)
  pauseToast(id, 'hovered', false)
  advanceToasts(10000)
  expect(toasts.value[0]?.remaining).toBe(6000)
  pauseToast(id, 'focused', false)
  advanceToasts(6000)
  expect(toasts.value.map(toast => toast.text)).toEqual(['Invalid'])
  scope.stop()
  expect(toasts.value).toEqual([])
})
