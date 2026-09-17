<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import mapImage from '@/assets/brand/location-preview.png'
import type { LocationPoint, LocationView } from './fixtures/location'
import { previewSession } from '../preview-flow'

const props = defineProps<{ view: LocationView }>()
const router = useRouter()
const query = ref('')
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
  props.view.places.filter(place => normalized(place.label).includes(normalized(query.value)))
)
watch(query, () => {
  selected.value = undefined
  message.value = ''
  requestId++
  locating.value = false
})
function selectPlace(place: LocationPoint) {
  requestId++
  locating.value = false
  selected.value = place
  message.value = ''
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
  message.value = props.view.props.confirmed
}
function goBack() {
  if (!props.view.allowedActions.includes('back')) return
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
      class="flex items-center gap-2 rounded-control border border-primary px-3 py-1 shadow-[0_2px_6px_rgb(37_42_49/16%)]"
    )
      base-icon(
        name="search",
        class="text-primary"
      )
      input(
        v-model="query",
        type="search",
        class="min-h-11 min-w-0 flex-1 bg-transparent",
        :aria-label="view.props.searchLabel",
        :placeholder="view.props.placeholder",
        autocomplete="off"
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
    ul(
      v-if="query && !selected",
      :aria-label="view.props.results",
      class="rounded-control border border-primary-light bg-surface p-2"
    )
      li(
        v-for="place in matches",
        :key="place.label"
      )
        button(
          type="button",
          class="min-h-11 w-full rounded-lg p-3 text-left hover:bg-canvas",
          @click="selectPlace(place)"
        ) {{ place.label }}
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
      @click="view.places[0] && selectPlace(view.places[0])"
    )
      img(
        :src="mapImage",
        alt="",
        class="absolute inset-0 size-full object-cover"
      )
      span(class="relative rounded-control border border-primary bg-surface px-4 py-2 text-primary shadow") {{ view.props.mapHint }}
    p(
      v-if="selected",
      class="rounded-control bg-primary-light p-3 text-primary"
    ) {{ view.props.selected }}: {{ selected.label }} ({{ selected.lat.toFixed(5) }}, {{ selected.lng.toFixed(5) }})
    p(class="text-small text-primary") {{ view.props.preview }}
  .customer-location__actions(class="p-4")
    button(
      type="button",
      class="w-full rounded-control bg-primary-gradient p-4 text-button text-white shadow-brand disabled:cursor-not-allowed disabled:opacity-50",
      :disabled="!selected || locating || !view.allowedActions.includes('confirm-location')",
      @click="confirmLocation"
    ) {{ view.props.confirm }}
    p(
      class="mt-3 text-primary empty:hidden",
      role="status",
      aria-live="polite"
    ) {{ message }}
</template>
