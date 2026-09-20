<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { HelpImage } from '../pages/fixtures/self-help'
const props = defineProps<{ image: HelpImage }>()
const failed = ref(false)
const source = computed(() => {
  const value = props.image.src
  if (!value || /[\\\s]/.test(value)) return undefined
  if (value.startsWith('/') && !value.startsWith('//')) return value
  try {
    const url = new URL(value)
    if (['https:', 'http:'].includes(url.protocol) && !url.username && !url.password) return value
  } catch {
    /* Invalid sources use the placeholder. */
  }
  return undefined
})
watch(source, () => {
  failed.value = false
})
</script>

<template lang="pug">
figure(class="overflow-hidden rounded-control border border-primary-light bg-surface")
  div(class="flex aspect-square items-center justify-center")
    img(
      v-if="source && !failed",
      :src="source",
      :alt="image.alt",
      loading="lazy",
      class="size-full object-contain p-4",
      @error="failed = true"
    )
    div(
      v-else,
      role="img",
      :aria-label="image.alt",
      class="text-primary-light"
    )
      base-icon(
        name="help-stray",
        class="size-12"
      )
  figcaption(class="bg-primary-light px-4 py-2 text-center text-primary") {{ image.caption }}
</template>
