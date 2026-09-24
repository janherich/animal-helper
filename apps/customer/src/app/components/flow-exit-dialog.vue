<script setup lang="ts">
import { onUnmounted, ref, useId } from 'vue'
import { usePreferredReducedMotion, useScrollLock } from '@vueuse/core'

defineProps<{ copy: { title: string; description: string; continue: string; leave: string } }>()
const emit = defineEmits<{ leave: [] }>()
const dialog = ref<HTMLDialogElement>()
const body = ref<HTMLElement | null>(null)
const locked = useScrollLock(body)
const id = useId()
const reduced = usePreferredReducedMotion()
const closing = ref(false)
let entrance: Animation | undefined
let timer: ReturnType<typeof setTimeout> | undefined
let leaving = false
let trigger: HTMLElement | null = null
function open(opener: EventTarget | null) {
  if (!dialog.value || dialog.value.open) return
  trigger = opener instanceof HTMLElement ? opener : null
  body.value = document.body
  dialog.value.showModal()
  locked.value = true
  if (reduced.value !== 'reduce') {
    entrance = dialog.value.animate(
      [
        { transform: 'translateY(12px) scale(0.98)', opacity: 0 },
        { transform: 'translateY(0) scale(1)', opacity: 1 }
      ],
      { duration: 200, easing: 'ease-out' }
    )
  }
}
function close(immediate = false) {
  if (!dialog.value?.open) return
  if (closing.value && !immediate) return
  clearTimeout(timer)
  entrance?.cancel()
  if (immediate) leaving = false
  if (immediate || reduced.value === 'reduce') dialog.value.close()
  else {
    closing.value = true
    timer = setTimeout(() => dialog.value?.close(), 200)
  }
}
function closed() {
  clearTimeout(timer)
  closing.value = false
  locked.value = false
  if (trigger?.isConnected) trigger.focus({ preventScroll: true })
  const shouldLeave = leaving
  leaving = false
  if (shouldLeave) emit('leave')
}
function leave() {
  if (closing.value) return
  leaving = true
  close()
}
function trapFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab') return
  const buttons = dialog.value?.querySelectorAll('button')
  const first = buttons?.[0]
  const last = buttons?.[1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
onUnmounted(() => {
  clearTimeout(timer)
  entrance?.cancel()
  leaving = false
  locked.value = false
  dialog.value?.close()
})
defineExpose({ open, close })
</script>

<template lang="pug">
dialog.flow-exit-dialog(
  ref="dialog",
  class="fixed inset-0 m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[374px] overflow-y-auto rounded-control border-2 border-primary-light bg-surface p-5 text-ink",
  :class="{ 'is-closing': closing }",
  :aria-labelledby="id + '-title'",
  :aria-describedby="id + '-description'",
  @cancel.prevent="close()",
  @close="closed",
  @keydown="trapFocus"
)
  div(class="flex flex-col gap-8")
    header(class="px-1 pt-5 pb-3")
      h2(
        :id="id + '-title'",
        class="mb-1 text-heading-1"
      ) {{ copy.title }}
      p(
        :id="id + '-description'",
        class="text-body"
      ) {{ copy.description }}
    div(class="flex flex-col gap-4")
      button(
        type="button",
        autofocus,
        class="ui-button w-full rounded-control bg-primary-gradient p-4 text-button text-white shadow-brand",
        @click="close()"
      ) {{ copy.continue }}
      button(
        type="button",
        class="ui-button w-full rounded-control border border-primary bg-surface p-4 text-button text-primary",
        @click="leave"
      ) {{ copy.leave }}
</template>

<style scoped>
.flow-exit-dialog::backdrop {
  background: rgb(37 42 49 / 50%);
}
@media (prefers-reduced-motion: no-preference) {
  .flow-exit-dialog[open]::backdrop {
    animation: fade-in 150ms ease-out;
  }
  .flow-exit-dialog.is-closing {
    animation: dialog-out 200ms ease-in forwards;
  }
  .flow-exit-dialog.is-closing::backdrop {
    animation: fade-out 200ms ease-in forwards;
  }
  @keyframes dialog-out {
    to {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
  }
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes fade-out {
    to {
      opacity: 0;
    }
  }
}
</style>
