<script setup lang="ts">
import { onUnmounted, ref, watchEffect } from 'vue'
import { useElementBounding, useWindowSize } from '@vueuse/core'
import { useRouter } from 'vue-router'
import addMedia from '@/assets/brand/add-media.svg'
import { previewSession } from '../preview-flow'
import { toastBottomOffset, useToasts } from '../toasts'
import type { MediaView } from './fixtures/media'

const props = defineProps<{ view: MediaView }>()
const router = useRouter()
const gallery = ref<HTMLInputElement>()
const message = ref('')
const actions = ref<HTMLElement>()
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
const accepted = 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime'
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
    if (!accepted.split(',').includes(file.type) || !file.size) {
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
  if (!props.view.allowedActions.includes('remove')) return
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
  if (props.view.allowedActions.includes('back')) void router.push({ name: props.view.backTarget })
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
.customer-media(
  class="flex flex-1 flex-col",
  :lang="view.locale"
)
  .customer-media__back(class="px-4 pt-5 pb-1")
    button(
      type="button",
      class="mb-4 flex min-h-11 items-center gap-1 text-heading-2 text-primary",
      :disabled="!view.allowedActions.includes('back')",
      @click="goBack"
    )
      base-icon(name="back")
      span {{ view.props.back }}
    hr(class="border-primary-light")
  .customer-media__steps(class="px-4 pt-4 pb-2")
    .customer-media__progress(
      class="h-2 overflow-hidden rounded bg-primary-light",
      role="progressbar",
      :aria-label="view.props.step",
      :aria-valuenow="view.props.progress",
      aria-valuemin="0",
      aria-valuemax="100"
    )
      div(
        class="h-full rounded bg-primary-gradient",
        :style="{ width: view.props.progress + '%' }"
      )
    p(class="mt-1") {{ view.props.step }}
  header(class="px-5 pt-5 pb-3")
    h1(class="mb-1 text-heading-1") {{ view.props.title }}
    p {{ view.props.description }}
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
            class="w-full rounded-control bg-primary-gradient p-4 text-button text-white shadow-brand disabled:opacity-50",
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
      p(class="mt-4 text-center text-small text-primary") {{ view.props.preview }}
  .customer-media__actions(
    ref="actions",
    class="sticky bottom-0 z-20 mt-auto shrink-0 bg-canvas p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
  )
    div(
      aria-hidden="true",
      class="pointer-events-none absolute inset-x-0 bottom-full h-6 bg-linear-to-b from-transparent to-canvas"
    )
    button(
      v-if="items.length",
      type="button",
      class="w-full rounded-control bg-primary-gradient p-4 text-button text-white shadow-brand",
      :disabled="!view.allowedActions.includes('confirm')",
      @click="message = view.props.confirmed"
    ) {{ view.props.confirm }}
    button(
      v-else,
      type="button",
      class="w-full rounded-control border border-primary bg-surface p-4 text-button text-primary",
      :disabled="!view.allowedActions.includes('manual')",
      @click="message = view.props.manualNotice"
    ) {{ view.props.manual }}
    p(
      class="mt-3 text-center text-primary empty:hidden",
      role="status",
      aria-live="polite"
    ) {{ message }}
</template>

<style scoped>
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
