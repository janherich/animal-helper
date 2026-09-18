import { afterEach, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { useDelayedPending } from '../use-delayed-pending'

afterEach(() => vi.useRealTimers())

it('does not display a waiting view for a fast response', async () => {
  vi.useFakeTimers()
  const scope = effectScope()
  const state = scope.run(() => useDelayedPending(600))!
  await state.run(async () => {})
  await vi.advanceTimersByTimeAsync(1000)
  expect(state.visible.value).toBe(false)
  expect(state.pending.value).toBe(false)
  scope.stop()
})

it('shows slow operations only after the threshold and prevents duplicates', async () => {
  vi.useFakeTimers()
  const scope = effectScope()
  const state = scope.run(() => useDelayedPending(600))!
  let finish!: () => void
  const operation = vi.fn(
    () =>
      new Promise<void>(resolve => {
        finish = resolve
      })
  )
  const completion = state.run(operation)
  await state.run(operation)
  expect(operation).toHaveBeenCalledTimes(1)
  await vi.advanceTimersByTimeAsync(599)
  expect(state.visible.value).toBe(false)
  await vi.advanceTimersByTimeAsync(1)
  expect(state.visible.value).toBe(true)
  finish()
  await completion
  expect(state.visible.value).toBe(false)
  expect(state.pending.value).toBe(false)
  scope.stop()
})

it('aborts on scope disposal and clears the delayed display', async () => {
  vi.useFakeTimers()
  const scope = effectScope()
  const state = scope.run(() => useDelayedPending(600))!
  let signal!: AbortSignal
  const completion = state.run(s => {
    signal = s
    return new Promise<void>(resolve => s.addEventListener('abort', () => resolve(), { once: true }))
  })
  scope.stop()
  await completion
  await vi.advanceTimersByTimeAsync(1000)
  expect(signal.aborted).toBe(true)
  expect(state.visible.value).toBe(false)
})
