<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { usePreferredReducedMotion, useScrollLock } from '@vueuse/core'
import heartFill from '@/assets/brand/heart-fill.svg'
import heartOutline from '@/assets/brand/heart-outline.svg'

const props = defineProps<{ label: string; reveal: boolean }>()
const emit = defineEmits<{ covered: []; elapsed: []; complete: [] }>()
const dialog = ref<HTMLDialogElement>()
const reducedMotion = usePreferredReducedMotion()
const body = ref<HTMLElement | null>(null)
const locked = useScrollLock(body)
let timer: ReturnType<typeof setTimeout> | undefined
let closeTimer: ReturnType<typeof setTimeout> | undefined
watch(() => props.reveal, reveal => {
  if (reveal) closeTimer = setTimeout(() => emit('complete'), reducedMotion.value === 'reduce' ? 0 : 240)
})
onMounted(() => {
  body.value = document.body
  locked.value = true
  dialog.value?.showModal()
  emit('covered')
  // Local preview only; real submission must succeed before mounting this component.
  timer = setTimeout(() => emit('elapsed'), reducedMotion.value === 'reduce' ? 600 : 1800)
})
onUnmounted(() => {
  clearTimeout(timer)
  clearTimeout(closeTimer)
  dialog.value?.close()
  locked.value = false
})
</script>

<template lang="pug">
Teleport(to="body")
  dialog.completion-animation(
    ref="dialog",
    :aria-label="label",
    :class="{ 'is-revealing': reveal }",
    @cancel.prevent
  )
    div(role="status")
      span(class="sr-only") {{ label }}
      .completion-animation__art(aria-hidden="true")
        img.completion-animation__fill(:src="heartFill", alt="", width="156", height="156")
        img.completion-animation__outline(:src="heartOutline", alt="", width="156", height="156")
</template>

<style scoped>
.completion-animation {
  position: fixed;
  inset: 0;
  margin: 0;
  border: 0;
  padding: 0;
  width: 100vw;
  height: 100dvh;
  max-width: none;
  max-height: none;
  overflow: hidden;
  background: var(--color-primary);
}
.completion-animation[open] {
  display: grid;
  place-items: center;
}
.completion-animation::backdrop {
  background: var(--color-primary);
}
.completion-animation.is-revealing,
.completion-animation.is-revealing::backdrop {
  opacity: 0;
}
.completion-animation__art {
  position: relative;
  width: 156px;
  height: 156px;
}
.completion-animation__art img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
/* Approved timing approximation; exact heart artwork and three states are from Figma. */
@media (prefers-reduced-motion: no-preference) {
  .completion-animation,
  .completion-animation::backdrop {
    transition: opacity 240ms ease-out;
  }
  .completion-animation__fill {
    animation: heart-expand 1600ms cubic-bezier(.4, 0, .2, 1) both;
  }
  .completion-animation__outline {
    animation: heart-pulse 1600ms ease-in-out both;
  }
  @keyframes heart-expand {
    0%, 10% { transform: scale(.013); }
    45%, 60% { transform: scale(1); }
    100% { transform: scale(40); }
  }
  @keyframes heart-pulse {
    0%, 10% { transform: scale(1); opacity: 1; }
    30% { transform: scale(1.06); }
    45%, 60% { transform: scale(.462); opacity: 1; }
    100% { transform: scale(.006); opacity: 0; }
  }
}
</style>
