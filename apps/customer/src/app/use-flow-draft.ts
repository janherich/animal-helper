import { inject, onUnmounted, toRaw, type Ref } from 'vue'
import { flowDraftContext } from './flow-exit'

// Keep unfinished controls separate from confirmed business answers.
export function useFlowDraft(fields: Record<string, Ref>) {
  const context = inject(flowDraftContext, undefined)
  if (!context) return
  const saved = context.restore()
  for (const [key, field] of Object.entries(fields)) {
    if (saved && key in saved) field.value = saved[key]
  }
  onUnmounted(
    context.register(() =>
      Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, structuredClone(toRaw(field.value))]))
    )
  )
}
