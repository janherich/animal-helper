import { onScopeDispose, ref } from 'vue'

/** Delays the waiting view, not the operation itself. */
export function useDelayedPending(thresholdMs: number) {
  const pending = ref(false)
  const visible = ref(false)
  let threshold: ReturnType<typeof setTimeout> | undefined
  let controller: AbortController | undefined

  async function run(operation: (signal: AbortSignal) => Promise<void>) {
    if (pending.value) return
    const current = new AbortController()
    controller = current
    pending.value = true
    threshold = setTimeout(() => {
      visible.value = true
    }, thresholdMs)
    try {
      await operation(current.signal)
    } finally {
      clearTimeout(threshold)
      pending.value = false
      visible.value = false
      controller = undefined
    }
  }

  onScopeDispose(() => {
    clearTimeout(threshold)
    controller?.abort()
  })
  return { pending, visible, run }
}
