<script setup lang="ts">
import { nextTick, onUnmounted, ref } from 'vue'
import { usePreferredReducedMotion, useScrollLock } from '@vueuse/core'
import AdviceBlocks from './advice-blocks.vue'
import type { AdviceView } from '../pages/fixtures/advice'
defineProps<{ view: AdviceView }>()
const dialog = ref<HTMLDialogElement>()
const panel = ref<HTMLElement>()
let entrance: Animation | undefined
const body = ref<HTMLElement | null>(null)
const locked = useScrollLock(body)
const reduced = usePreferredReducedMotion()
const closing = ref(false)
const active = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
let trigger: HTMLElement | null = null
async function open(opener?: EventTarget | null) {
  if (!dialog.value || dialog.value.open) return
  trigger =
    opener instanceof HTMLElement
      ? opener
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
  body.value = document.body
  closing.value = false
  active.value = true
  await nextTick()
  dialog.value.showModal()
  panel.value?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true })
  locked.value = true
  // Start after native dialog focus handling, so it cannot scroll to an off-screen animated control.
  dialog.value.scrollTop = 0
  if (reduced.value !== 'reduce') {
    entrance = panel.value?.animate(
      [
        { transform: 'translateY(100%)', offset: 0, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        { transform: 'translateY(-4px)', offset: 0.75, easing: 'ease-in-out' },
        { transform: 'translateY(0)', offset: 1 }
      ],
      { duration: 480, easing: 'linear' }
    )
  }
}
function close(immediate = false) {
  if (!dialog.value?.open) return
  clearTimeout(timer)
  entrance?.cancel()
  if (immediate || reduced.value === 'reduce') dialog.value.close()
  else {
    closing.value = true
    timer = setTimeout(() => dialog.value?.close(), 200)
  }
}
function closed() {
  clearTimeout(timer)
  closing.value = false
  active.value = false
  locked.value = false
  trigger?.focus({ preventScroll: true })
}
function trapFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab') return
  const buttons = dialog.value?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
  const first = buttons?.[0]
  const last = buttons?.[buttons.length - 1]
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
  locked.value = false
  dialog.value?.close()
})
defineExpose({ open, close })
</script>

<template lang="pug">
dialog.customer-advice-drawer(
  ref="dialog",
  :aria-label="view.copy.drawerTitle",
  :lang="view.locale",
  :class="{ 'is-closing': closing }",
  @cancel.prevent="close()",
  @close="closed",
  @click.self="close()",
  @keydown="trapFocus"
)
  .customer-advice-drawer__panel(
    v-if="active",
    ref="panel",
    class="flex w-full flex-col overflow-hidden rounded-t-[32px] bg-surface text-ink"
  )
    div(class="relative flex h-[76px] shrink-0 items-center justify-center")
      button(
        type="button",
        class="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full text-primary hover:bg-canvas",
        :aria-label="view.copy.closeAdvice",
        @click="close()"
      )
        base-icon(
          name="close",
          class="stroke-current [stroke-width:0.8]"
        )
    div(class="min-h-0 overflow-y-auto overscroll-contain")
      p(class="px-4 text-center text-small text-primary") {{ view.copy.preview }}
      AdviceBlocks(:blocks="view.blocks")
    footer(class="shrink-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]")
      button(
        type="button",
        class="w-full rounded-control bg-primary-gradient p-4 text-button text-white shadow-brand",
        @click="close()"
      ) {{ view.copy.acknowledge }}
</template>

<style scoped>
.customer-advice-drawer {
  position: fixed;
  inset: 0;
  margin: 0;
  width: 100%;
  height: 100dvh;
  max-width: none;
  max-height: none;
  border: 0;
  padding: 0;
  background: transparent;
  overflow: clip;
}
.customer-advice-drawer[open] {
  display: flex;
  align-items: flex-end;
}
.customer-advice-drawer__panel {
  max-height: max(0px, calc(100dvh - var(--advice-header-height, 80px) - 20px));
  /* Extend the surface below the viewport during the small upward overshoot. */
  box-shadow: 0 12px 0 0 var(--color-surface);
}
.customer-advice-drawer::backdrop {
  background: rgb(37 42 49 / 80%);
}
@media (prefers-reduced-motion: no-preference) {
  .customer-advice-drawer[open]::backdrop {
    animation: fade-in 150ms ease-out;
  }
  .customer-advice-drawer.is-closing .customer-advice-drawer__panel {
    animation: slide-out 200ms ease-in forwards;
  }
  .customer-advice-drawer.is-closing::backdrop {
    animation: fade-out 200ms ease-in forwards;
  }
  @keyframes slide-out {
    to {
      transform: translateY(100%);
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
