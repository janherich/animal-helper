import { afterEach, expect, it } from 'vitest'
import { effectScope } from 'vue'
import { advanceToasts, pauseToast, toasts, useToasts } from '../toasts'

afterEach(() => {
  toasts.value = []
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
