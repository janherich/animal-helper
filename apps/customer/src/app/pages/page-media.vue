<script setup lang="ts">
import PageActions from '../components/page-actions.vue'
import PageIntro from '../components/page-intro.vue'
import { computed, nextTick, onUnmounted, ref, watchEffect } from 'vue'
import { useElementBounding, useWindowSize } from '@vueuse/core'
import { useRouter } from 'vue-router'
import addMedia from '@/assets/brand/add-media.svg'
import { previewSession } from '../preview-flow'
import { flowActions } from '../flow-client'
import { toastBottomOffset, useToasts } from '../toasts'
import type { MediaView } from './fixtures/media'
import PageProcessing from './page-processing.vue'
import { backWithinFlow } from '../instruction-navigation'
import { useDelayedPending } from '../use-delayed-pending'

const props = defineProps<{ view: MediaView }>()
const router = useRouter()
const gallery = ref<HTMLInputElement>()
const message = ref('')
const confirmButton = ref<HTMLButtonElement>()
const { pending, visible: processingVisible, run } = useDelayedPending(props.view.processing.thresholdMs)
async function confirmMedia() {
  if (!items.value.length || !props.view.allowedActions.includes('confirm') || pending.value) return
  // Confirmation commits the current selection; pending removals can no longer be undone.
  notifications.clear()
  message.value = ''
  await run(async signal => {
    const target = await flowActions.processMedia(props.view.processing.demoDurationMs, props.view.resultTarget, signal)
    if (target && !signal.aborted) {
      await router.push({ name: target })
      await nextTick()
    }
  })
  await nextTick()
  confirmButton.value?.focus({ preventScroll: true })
}
const actions = ref<InstanceType<typeof PageActions>>()
const actionBounds = useElementBounding(actions)
const viewport = useWindowSize()
watchEffect(() => {
  const top = actionBounds.top.value
  toastBottomOffset.value =
    actions.value && actionBounds.bottom.value > 0 && top < viewport.height.value
      ? Math.max(16, viewport.height.value - Math.max(0, top) + 12)
      : 16
})
onUnmounted(() => {
  toastBottomOffset.value = 16
})
const notifications = useToasts()
function showError(text: string, title = props.view.props.invalidTitle, kind: 'error' | 'warning' = 'error') {
  notifications.show({ title, text, kind, dismissLabel: props.view.props.dismiss })
}
const accepted = computed(() => props.view.limits.mimeTypes.join(','))
const items = ref(
  (previewSession.value?.media ?? []).map(file => ({
    file,
    url: URL.createObjectURL(file),
    failed: false
  }))
)
function syncFiles() {
  if (previewSession.value) previewSession.value.media = items.value.map(item => item.file)
}
function pickFiles(event: Event) {
  const input = event.target as HTMLInputElement
  if (!props.view.allowedActions.includes('pick')) return
  message.value = ''
  const rejected: string[] = []
  const oversized: string[] = []
  for (const file of Array.from(input.files ?? [])) {
    if (file.size > props.view.limits.bytes) {
      oversized.push(file.name)
      continue
    }
    if (!props.view.limits.mimeTypes.includes(file.type) || !file.size) {
      rejected.push(file.name)
      continue
    }
    if (
      items.value.some(
        item =>
          item.file.name === file.name && item.file.size === file.size && item.file.lastModified === file.lastModified
      )
    )
      continue
    items.value.push({ file, url: URL.createObjectURL(file), failed: false })
  }
  input.value = ''
  if (rejected.length) showError(`${rejected.join(', ')}: ${props.view.props.invalid}`)
  if (oversized.length)
    showError(`${oversized.join(', ')}: ${props.view.props.tooLarge}`, props.view.props.tooLargeTitle)
  syncFiles()
}
let removalToast: number | undefined
let removedFiles: { file: File; index: number }[] = []
function restoreRemoved() {
  if (pending.value) return false
  // Reverse the removals to restore their original positions, even when indices shifted.
  for (const { file, index } of [...removedFiles].reverse()) {
    if (
      items.value.some(
        existing =>
          existing.file.name === file.name &&
          existing.file.size === file.size &&
          existing.file.lastModified === file.lastModified
      )
    )
      continue
    items.value.splice(Math.min(index, items.value.length), 0, { file, url: URL.createObjectURL(file), failed: false })
  }
  syncFiles()
}
function remove(index: number) {
  if (pending.value || !props.view.allowedActions.includes('remove')) return
  const item = items.value.splice(index, 1)[0]
  if (item) {
    URL.revokeObjectURL(item.url)
    removedFiles.push({ file: item.file, index })
    const title =
      removedFiles.length === 1
        ? props.view.props.removed
        : props.view.props.removedMany.replace('{count}', String(removedFiles.length))
    const action = {
      label: removedFiles.length === 1 ? props.view.props.undo : props.view.props.undoAll,
      run: restoreRemoved
    }
    if (removalToast !== undefined) {
      notifications.update(removalToast, { title, action, duration: 8000 })
    } else
      removalToast = notifications.show({
        title,
        text: props.view.props.removedDescription,
        kind: 'info',
        duration: 8000,
        timerLabel: props.view.props.undoTime,
        dismissLabel: props.view.props.dismiss,
        action,
        onDismiss: () => {
          removedFiles = []
          removalToast = undefined
        }
      })
  }
  message.value = ''
  syncFiles()
}
function goBack() {
  if (props.view.allowedActions.includes('back')) backWithinFlow(router, props.view.backTarget, [props.view.backTarget])
}
function freezeLeavingTile(element: Element) {
  const tile = element as HTMLElement
  const { offsetWidth, offsetHeight, offsetLeft, offsetTop } = tile
  Object.assign(tile.style, {
    width: `${offsetWidth}px`,
    height: `${offsetHeight}px`,
    left: `${offsetLeft}px`,
    top: `${offsetTop}px`
  })
}
onUnmounted(() => items.value.forEach(item => URL.revokeObjectURL(item.url)))
</script>

<template lang="pug">
.customer-media-shell(class="flex flex-1 flex-col")
  Transition(
    name="processing-view",
    mode="out-in",
    @after-enter="!pending && confirmButton?.focus({ preventScroll: true })"
  )
    PageProcessing(
      v-if="processingVisible",
      :title="view.processing.title",
      :preview="view.processing.preview"
    )
    .customer-media(
      v-else,
      class="flex flex-1 flex-col",
      :inert="pending",
      :aria-busy="pending",
      :lang="view.locale"
    )
      PageIntro(
        :back="view.props.back",
        :back-disabled="!view.allowedActions.includes('back')",
        :step="view.props.step",
        :progress="view.props.progress",
        :title="view.props.title",
        :description="view.props.description",
        @back="goBack"
      )
      input(
        ref="gallery",
        type="file",
        class="hidden",
        :accept="accepted",
        multiple,
        :aria-label="view.props.gallery",
        @change="pickFiles"
      )
      Transition(
        name="media-state",
        mode="out-in"
      )
        .customer-media__body(
          :key="items.length ? 'selected' : 'empty'",
          class="p-4"
        )
          .customer-media__empty(
            v-if="!items.length",
            class="flex flex-col items-center gap-8 rounded-control border-2 border-dashed border-primary-light bg-surface p-5 text-center text-primary"
          )
            p(class="text-body-strong") {{ view.props.prompt }}
            button(
              type="button",
              class="rounded-full bg-canvas p-4 disabled:opacity-50",
              :aria-label="view.props.gallery",
              :disabled="!view.allowedActions.includes('pick')",
              @click="gallery?.click()"
            )
              img(
                :src="addMedia",
                alt="",
                width="72",
                height="72",
                class="size-[72px]"
              )
            p {{ view.props.limit }}
            div(class="flex w-full flex-col gap-4")
              button(
                type="button",
                class="ui-button w-full rounded-control bg-primary-gradient p-4 text-button text-white shadow-brand disabled:opacity-50",
                :disabled="!view.allowedActions.includes('pick')",
                @click="gallery?.click()"
              ) {{ view.props.gallery }}
              p(class="text-center text-small") {{ view.props.pickerHint }}
          TransitionGroup.customer-media__grid(
            v-else,
            name="media-tile",
            tag="div",
            class="relative grid grid-cols-2 gap-4",
            @before-leave="freezeLeavingTile"
          )
            figure(
              v-for="(item, index) in items",
              :key="item.url",
              class="relative min-w-0 overflow-hidden rounded-control bg-surface shadow-md"
            )
              img(
                v-if="item.file.type.startsWith('image/') && !item.failed",
                :src="item.url",
                :alt="item.file.name",
                class="aspect-square w-full object-cover",
                @error="item.failed = true"
              )
              video(
                v-else-if="!item.failed",
                :src="item.url",
                :aria-label="item.file.name",
                class="aspect-square w-full object-cover",
                controls,
                playsinline,
                preload="metadata",
                @error="item.failed = true"
              )
              p(
                v-else,
                class="flex aspect-square items-center p-4 text-small"
              ) {{ view.props.unsupportedPreview }}
              button(
                type="button",
                class="absolute top-2 right-2 flex size-11 items-center justify-center rounded-full bg-canvas text-danger transition-colors duration-150 enabled:hover:bg-danger enabled:hover:text-white enabled:focus-visible:bg-danger enabled:focus-visible:text-white motion-reduce:transition-none",
                :aria-label="view.props.remove + ': ' + item.file.name",
                :disabled="!view.allowedActions.includes('remove')",
                @click="remove(index)"
              )
                base-icon(name="delete")
            button(
              key="add-media",
              type="button",
              class="flex aspect-square flex-col items-center justify-center gap-3 rounded-control border-2 border-dashed border-primary-light bg-surface p-5 text-primary",
              :disabled="!view.allowedActions.includes('pick')",
              @click="gallery?.click()"
            )
              base-icon(
                name="add",
                class="size-14 rounded-full bg-canvas p-1"
              )
              span {{ view.props.add }}
      PageActions.customer-media__actions(
        ref="actions",
        as="div",
        class="shrink-0"
      )
        button(
          v-if="items.length",
          ref="confirmButton",
          type="button",
          class="ui-button flex w-full items-center justify-center rounded-control bg-primary-gradient p-4 text-button text-white shadow-brand",
          :disabled="pending || !view.allowedActions.includes('confirm')",
          :aria-label="pending ? view.processing.title : view.props.confirm",
          :aria-busy="pending",
          @click="confirmMedia"
        )
          span.customer-media__spinner(
            v-if="pending",
            class="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none",
            aria-hidden="true"
          )
          span(v-else) {{ view.props.confirm }}
        button(
          v-else,
          type="button",
          class="ui-button w-full rounded-control border border-primary bg-surface p-4 text-button text-primary",
          :disabled="!view.allowedActions.includes('manual')",
          @click="view.allowedActions.includes('manual') && router.push({ name: view.manualTarget })"
        ) {{ view.props.manual }}
        p(
          class="mt-3 text-center text-primary empty:hidden",
          role="status",
          aria-live="polite"
        ) {{ message }}
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .processing-view-enter-active {
    transition:
      opacity 250ms ease-out,
      transform 250ms ease-out;
  }
  .processing-view-leave-active {
    transition: opacity 100ms ease-out;
    pointer-events: none;
  }
  .processing-view-enter-from {
    opacity: 0;
    transform: translateY(8px);
  }
  .processing-view-leave-to {
    opacity: 0;
  }
}
.media-tile-move,
.media-tile-enter-active,
.media-tile-leave-active {
  transition:
    transform 240ms ease,
    opacity 180ms ease;
}
.media-tile-leave-active {
  position: absolute;
  pointer-events: none;
}
.media-tile-enter-from,
.media-tile-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
.media-state-enter-active {
  transition:
    opacity 180ms ease-out,
    transform 180ms ease-out;
}
.media-state-leave-active {
  transition: opacity 100ms ease-in;
}
.media-state-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.media-state-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .media-tile-move,
  .media-tile-enter-active,
  .media-tile-leave-active {
    transition: none;
  }
  .media-tile-enter-from,
  .media-tile-leave-to {
    transform: none;
  }
  .media-state-enter-active,
  .media-state-leave-active {
    transition: none;
  }
  .media-state-enter-from {
    transform: none;
  }
}
</style>
