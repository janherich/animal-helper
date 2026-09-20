import type { FormValidation } from '@/app/contracts/validation'
import { computed, ref, useId, watch } from 'vue'

export function useFormValidation(source: () => FormValidation | undefined) {
  const prefix = useId()
  const errors = ref<Record<string, string[]>>({})
  const formErrors = ref<string[]>([])
  watch(
    source,
    value => {
      errors.value = Object.fromEntries(
        Object.entries(value?.fieldErrors ?? {}).map(([key, messages]) => [key, [...messages]])
      )
      formErrors.value = [...(value?.formErrors ?? [])]
    },
    { immediate: true, deep: true }
  )
  const errorId = (key: string) => `${prefix}-error-${encodeURIComponent(key)}`
  const messages = (key: string) => (Object.hasOwn(errors.value, key) ? errors.value[key]! : [])
  const attrs = (key: string) => ({
    'aria-invalid': messages(key).length ? ('true' as const) : undefined,
    'aria-describedby': messages(key).length ? errorId(key) : undefined
  })
  function clear(...keys: string[]) {
    keys.forEach(key => delete errors.value[key])
    // A changed draft is no longer the exact submission described by the summary.
    formErrors.value = []
  }
  const hasFieldErrors = computed(() => Object.values(errors.value).some(messages => messages.length))
  function focusFirstError(container: HTMLElement | undefined | null) {
    container?.querySelector<HTMLElement>('[aria-invalid="true"]:not(:disabled)')?.focus()
  }
  return { messages, attrs, errorId, clear, formErrors, hasFieldErrors, focusFirstError }
}
