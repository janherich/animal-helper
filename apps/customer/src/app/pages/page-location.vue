<script setup lang="ts">
import { autoUpdate, offset, shift, size, useFloating } from '@floating-ui/vue'
import { computed, nextTick, onUnmounted, ref, watch, useId } from 'vue'
import { scrollActiveOption } from '@/libs/scroll-active-option'
import { useRouter } from 'vue-router'
import type { LocationPoint, LocationView } from './fixtures/location'
import { previewSession } from '../preview-flow'
import { backWithinFlow } from '../instruction-navigation'

const props = defineProps<{ view: LocationView }>()
const router = useRouter()
const query = ref('')
const search = ref<HTMLElement>()
const results = ref<HTMLElement>()
const focused = ref(false)
const activeIndex = ref(-1)
const resultsId = useId()
const open = computed(() => focused.value && !!query.value && !selected.value)
const { floatingStyles } = useFloating(search, results, {
  open,
  placement: 'bottom-start',
  strategy: 'fixed',
  middleware: [
    offset(6),
    shift({ padding: 8 }),
    size({
      padding: 8,
      apply({ rects, availableHeight, elements }) {
        Object.assign(elements.floating.style, {
          width: `${rects.reference.width}px`,
          maxHeight: `${Math.max(0, Math.min(280, availableHeight))}px`
        })
      }
    })
  ],
  whileElementsMounted: autoUpdate
})
const selected = ref<LocationPoint | undefined>(previewSession.value?.location)
const locating = ref(false)
const message = ref('')
let requestId = 0
const normalized = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
const matches = computed(() =>
  props.view.places.filter(place => normalized(place.title + ' ' + place.detail).includes(normalized(query.value)))
)
function titleParts(title: string) {
  const needle = normalized(query.value)
  const index = normalized(title).indexOf(needle)
  if (!needle || index < 0) return { before: title, match: '', after: '' }
  return {
    before: title.slice(0, index),
    match: title.slice(index, index + needle.length),
    after: title.slice(index + needle.length)
  }
}
watch(query, () => {
  activeIndex.value = -1
  selected.value = undefined
  message.value = ''
  requestId++
  locating.value = false
})
function selectPlace(place: LocationPoint) {
  focused.value = false
  requestId++
  locating.value = false
  selected.value = place
  message.value = ''
}
async function onSearchKeydown(event: KeyboardEvent) {
  if (event.isComposing) return
  if (event.key === 'Escape') {
    focused.value = false
    activeIndex.value = -1
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    focused.value = true
    const count = matches.value.length
    if (count) {
      activeIndex.value =
        activeIndex.value < 0
          ? event.key === 'ArrowDown'
            ? 0
            : count - 1
          : (activeIndex.value + (event.key === 'ArrowDown' ? 1 : -1) + count) % count
      await nextTick()
      scrollActiveOption(results.value, activeIndex.value)
    }
  } else if (event.key === 'Enter' && open.value && activeIndex.value >= 0) {
    event.preventDefault()
    const place = matches.value[activeIndex.value]
    if (place) selectPlace(place)
  }
}
function locate() {
  const token = ++requestId
  if (!navigator.geolocation) {
    message.value = props.view.props.unavailable
    return
  }
  locating.value = true
  message.value = ''
  navigator.geolocation.getCurrentPosition(
    position => {
      if (token !== requestId) return
      locating.value = false
      selected.value = {
        label: props.view.props.deviceLabel,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        source: 'device'
      }
    },
    error => {
      if (token !== requestId) return
      locating.value = false
      message.value = error.code === 1 ? props.view.props.denied : props.view.props.unavailable
    },
    { timeout: 10000, maximumAge: 60000 }
  )
}
function confirmLocation() {
  if (!selected.value || !previewSession.value || !props.view.allowedActions.includes('confirm-location')) return
  previewSession.value.location = { ...selected.value }
  void router.push({ name: props.view.confirmTarget })
}
function goBack() {
  if (!props.view.allowedActions.includes('back')) return
  if (props.view.backHistoryTargets?.length) {
    backWithinFlow(router, props.view.backTarget, props.view.backHistoryTargets)
    return
  }
  void router.push({ name: props.view.backTarget, query: previewSession.value?.fromDraft ? { fixture: 'draft' } : {} })
}
onUnmounted(() => {
  requestId++
})
</script>

<template lang="pug">
.customer-location(:lang="view.locale")
  .customer-location__back(class="px-4 pt-5 pb-1")
    button(
      type="button",
      class="mb-4 flex min-h-11 items-center gap-1 text-heading-2 text-primary",
      :disabled="!view.allowedActions.includes('back')",
      @click="goBack"
    )
      base-icon(name="back")
      span {{ view.props.back }}
    hr(class="border-primary-light")
  .customer-location__steps(class="px-4 pt-4 pb-2")
    .customer-location__progress(
      class="h-2 overflow-hidden rounded bg-primary-light",
      role="progressbar",
      :aria-label="view.props.step",
      :aria-valuenow="view.props.progress",
      :aria-valuemin="0",
      :aria-valuemax="100"
    )
      .customer-location__progress-fill(
        class="h-full rounded bg-primary-gradient",
        :style="{ width: `${view.props.progress}%` }"
      )
    p(class="mt-1") {{ view.props.step }}
  header(class="px-5 pt-5 pb-3")
    h1(class="mb-1 text-heading-1") {{ view.props.title }}
    p {{ view.props.description }}
  .customer-location__selector(class="flex flex-col gap-3.5 bg-surface px-4 py-5 [@media(width>640px)]:rounded-control")
    .customer-location__search(
      ref="search",
      class="flex items-center gap-2 rounded-control border border-primary px-3 py-1 shadow-[0_2px_6px_rgb(37_42_49/16%)]"
    )
      base-icon(
        name="search",
        class="text-primary"
      )
      input(
        v-model="query",
        type="text",
        role="combobox",
        aria-autocomplete="list",
        :aria-expanded="open",
        :aria-controls="open ? resultsId : undefined",
        :aria-activedescendant="open && activeIndex >= 0 ? resultsId + '-' + activeIndex : undefined",
        class="min-h-11 min-w-0 flex-1 bg-transparent outline-none",
        :aria-label="view.props.searchLabel",
        :placeholder="view.props.placeholder",
        autocomplete="off",
        @focus="focused = true",
        @input="focused = true",
        @blur="focused = false",
        @keydown="onSearchKeydown"
      )
      button(
        type="button",
        class="flex size-11 shrink-0 items-center justify-center",
        :aria-label="view.props.locate",
        :disabled="locating",
        @click="locate"
      )
        base-icon(
          name="location",
          class="text-primary"
        )
    Transition(name="suggestions")
      ul.customer-location__results(
        v-if="open",
        :id="resultsId",
        ref="results",
        role="listbox",
        :style="floatingStyles",
        :aria-label="view.props.results",
        class="z-20 flex flex-col gap-2 overflow-auto rounded-control bg-surface p-2 shadow-[0_2px_6px_rgb(37_42_49/16%)]"
      )
        li(
          v-for="(place, index) in matches",
          :id="resultsId + '-' + index",
          :key="place.label",
          role="option",
          :aria-label="place.label",
          :aria-describedby="resultsId + '-detail-' + index",
          :aria-selected="activeIndex === index",
          class="min-h-11 shrink-0 cursor-pointer rounded-control px-3 py-2 text-left transition-colors duration-150 hover:bg-canvas motion-reduce:transition-none",
          :class="{ 'bg-primary-light': activeIndex === index }",
          @mousedown.prevent,
          @click="selectPlace(place)"
        )
          .customer-location__result-title(class="flex items-center gap-1 text-body-strong")
            base-icon(
              name="navigation",
              class="size-6 shrink-0 text-ink"
            )
            span(class="min-w-0 break-words")
              span {{ titleParts(place.title).before }}
              span(class="text-primary") {{ titleParts(place.title).match }}
              span {{ titleParts(place.title).after }}
          p(
            :id="resultsId + '-detail-' + index",
            class="mt-1 pl-1 text-small text-ink"
          ) {{ place.detail }}
        li(
          v-if="!matches.length",
          class="p-3"
        ) {{ view.props.empty }}
    p(
      v-if="locating",
      role="status"
    ) {{ view.props.locating }}
    button.customer-location__map(
      type="button",
      class="relative flex h-[400px] w-full items-center justify-center overflow-hidden rounded-[20px]",
      :aria-label="view.props.mapLabel",
      @click="selectPlace(view.map.point)"
    )
      img(
        :src="view.map.imageUrl",
        alt="",
        class="absolute inset-0 size-full object-cover"
      )
      span(
        class="absolute top-4 right-4 rounded-full bg-surface p-0.5 text-ink shadow-[0_0_8px_rgb(0_0_0/24%)]",
        aria-hidden="true"
      )
        base-icon(
          name="compass",
          class="size-6"
        )
      span(
        class="relative flex items-center gap-2 rounded-control border border-primary bg-surface px-4 py-2 text-primary shadow"
      )
        base-icon(
          name="locate",
          class="size-6 shrink-0"
        )
        span {{ view.props.mapHint }}
    p(
      v-if="selected",
      class="rounded-control bg-primary-light p-3 text-primary"
    ) {{ view.props.selected }}: {{ selected.label }} ({{ selected.lat.toFixed(5) }}, {{ selected.lng.toFixed(5) }})
  .customer-location__actions(
    class="sticky bottom-0 z-20 mt-auto shrink-0 bg-canvas p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
  )
    div(
      aria-hidden="true",
      class="pointer-events-none absolute inset-x-0 bottom-full h-6 bg-linear-to-b from-transparent to-canvas"
    )
    button(
      type="button",
      class="ui-button w-full rounded-control bg-primary-gradient p-4 text-button text-white shadow-brand disabled:cursor-not-allowed disabled:opacity-50",
      :disabled="!selected || locating || !view.allowedActions.includes('confirm-location')",
      @click="confirmLocation"
    ) {{ view.props.confirm }}
    p(
      class="mt-3 text-primary empty:hidden",
      role="status",
      aria-live="polite"
    ) {{ message }}
</template>

<style scoped>
.suggestions-leave-active {
  pointer-events: none;
}
@media (prefers-reduced-motion: no-preference) {
  .suggestions-enter-active {
    transition: opacity 160ms ease-out;
  }
  .suggestions-leave-active {
    transition: opacity 120ms ease-in;
  }
  .suggestions-enter-from,
  .suggestions-leave-to {
    opacity: 0;
  }
}
.customer-location__search:has(input:focus-visible) {
  box-shadow: 0 0 0 2px var(--color-primary-light);
}
</style>
