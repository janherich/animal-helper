import { onScopeDispose, shallowRef } from 'vue'

type Toast = {
  id: number
  title: string
  text: string
  kind: 'success' | 'error' | 'warning' | 'info'
  dismissLabel: string
  action?: { label: string; run: () => boolean | void }
  duration?: number
  timerLabel?: string
  remaining?: number | undefined
  hovered?: boolean
  focused?: boolean
  onDismiss?: () => void
}

export const toasts = shallowRef<Toast[]>([])
export const toastBottomOffset = shallowRef(16)
let nextId = 0
export function pauseToast(id: number, reason: 'hovered' | 'focused', paused: boolean) {
  toasts.value = toasts.value.map(toast => (toast.id === id ? { ...toast, [reason]: paused } : toast))
}
export function advanceToasts(elapsed: number) {
  toasts.value = toasts.value.map(toast => {
    if (toast.remaining === undefined || toast.hovered || toast.focused) return toast
    return { ...toast, remaining: Math.max(0, toast.remaining - elapsed) }
  })
  for (const toast of toasts.value) if (toast.remaining === 0) dismissToast(toast.id)
}
export function dismissToast(id: number) {
  const removed = toasts.value.find(toast => toast.id === id)
  toasts.value = toasts.value.filter(toast => toast.id !== id)
  removed?.onDismiss?.()
}
export function notify(toast: Omit<Toast, 'id'>) {
  const id = ++nextId
  toasts.value = [...toasts.value, { ...toast, id, remaining: toast.duration }]
  return id
}
export function clearToasts() {
  for (const toast of [...toasts.value]) dismissToast(toast.id)
}
export function runToastAction(toast: Toast) {
  if (!toasts.value.some(current => current.id === toast.id)) return
  if (toast.action?.run() !== false) dismissToast(toast.id)
}

// Notifications belong to the calling screen; callbacks never survive its disposal.
export function useToasts() {
  const owned = new Set<number>()
  function clear() {
    for (const id of owned) dismissToast(id)
    owned.clear()
  }
  onScopeDispose(clear)
  return {
    clear,
    update(id: number, patch: Partial<Pick<Toast, 'title' | 'text' | 'action' | 'duration'>>) {
      if (!owned.has(id)) return
      toasts.value = toasts.value.map(toast =>
        toast.id === id ? { ...toast, ...patch, remaining: patch.duration ?? toast.remaining } : toast
      )
    },
    show(toast: Omit<Toast, 'id'>) {
      const id = ++nextId
      owned.add(id)
      toasts.value = [...toasts.value, { ...toast, id, remaining: toast.duration }]
      return id
    }
  }
}
