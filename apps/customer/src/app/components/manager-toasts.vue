<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { advanceToasts, dismissToast, pauseToast, runToastAction, toastBottomOffset, toasts } from '../toasts'

const variants = {
  success: {
    surface: 'border-success bg-success-light',
    accent: 'text-success',
    bar: 'bg-success',
    icon: 'notice-info'
  },
  error: { surface: 'border-danger bg-danger-light', accent: 'text-danger', bar: 'bg-danger', icon: 'warning' },
  warning: { surface: 'border-accent bg-accent-light', accent: 'text-accent', bar: 'bg-accent', icon: 'warning' },
  info: { surface: 'border-primary-light bg-surface', accent: 'text-primary', bar: 'bg-primary', icon: 'notice-info' }
} as const

let frame = 0
let lastTick = 0
function resetTick() {
  lastTick = performance.now()
}
onMounted(() => {
  resetTick()
  document.addEventListener('visibilitychange', resetTick)
  function tick(now: number) {
    if (
      !document.hidden &&
      toasts.value.some(toast => toast.remaining !== undefined && !toast.hovered && !toast.focused)
    )
      advanceToasts(now - lastTick)
    lastTick = now
    frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
})
onUnmounted(() => {
  cancelAnimationFrame(frame)
  document.removeEventListener('visibilitychange', resetTick)
})
function onFocusOut(id: number, event: FocusEvent) {
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null))
    pauseToast(id, 'focused', false)
}
</script>

<template lang="pug">
.toast-manager(
  class="pointer-events-none fixed inset-x-4 z-40 mx-auto max-w-[600px]",
  :style="{ bottom: 'max(' + toastBottomOffset + 'px, env(safe-area-inset-bottom))' }"
)
  TransitionGroup(
    name="toast",
    tag="div",
    class="-m-6 flex max-h-[50dvh] flex-col gap-3 overflow-y-auto p-6"
  )
    .toast-manager__item(
      v-for="toast in toasts",
      :key="toast.id",
      class="pointer-events-auto relative shrink-0 rounded-control border p-4 shadow-[0_4px_16px_rgb(37_42_49/0.12)]",
      :class="variants[toast.kind].surface",
      @focusin="pauseToast(toast.id, 'focused', true)",
      @focusout="onFocusOut(toast.id, $event)"
    )
      div(class="min-w-0 pr-9")
        div(:role="toast.kind === 'error' ? 'alert' : 'status'")
          div(
            class="mb-2 flex items-start gap-2",
            :class="variants[toast.kind].accent"
          )
            base-icon(:name="variants[toast.kind].icon")
            p(class="text-heading-3 break-words") {{ toast.title }}
          p(class="break-words text-ink") {{ toast.text }}
        button(
          v-if="toast.action",
          type="button",
          class="mt-2 min-h-11 text-body-strong text-ink underline",
          @click="runToastAction(toast)"
        ) {{ toast.action.label }}
      .toast-manager__timer(
        v-if="toast.duration && toast.remaining !== undefined",
        class="mt-2"
      )
        p(
          class="mb-1 text-small text-primary",
          role="timer"
        ) {{ toast.timerLabel }}: {{ Math.ceil(toast.remaining / 1000) }} s
        div(
          class="h-1 overflow-hidden rounded-full bg-primary-light",
          aria-hidden="true"
        )
          div(
            class="h-full origin-left",
            :class="variants[toast.kind].bar",
            :style="{ transform: 'scaleX(' + toast.remaining / toast.duration + ')' }"
          )
      button(
        type="button",
        class="group absolute top-1 right-1 flex size-11 items-center justify-center rounded-full text-primary",
        :aria-label="toast.dismissLabel",
        @click="dismissToast(toast.id)"
      )
        span(
          class="flex size-7 items-center justify-center rounded-full transition-colors group-hover:bg-canvas group-focus-visible:bg-canvas motion-reduce:transition-none"
        )
          base-icon(
            name="close",
            style="width: 24px; height: 24px; transform: scale(0.6)",
            class="stroke-current [stroke-width:0.8]"
          )
</template>

<style scoped>
.toast-enter-active {
  transition:
    opacity 200ms ease,
    transform 380ms cubic-bezier(0.22, 1.25, 0.36, 1);
}
.toast-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(32px);
}
@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: none;
  }
}
</style>
