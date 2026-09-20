<script setup lang="ts">
import BaseIcon from '@/libs/components/base-icon.vue'

defineProps<{
  back: string
  backDisabled: boolean
  step: string
  progress: number
  title: string
  description: string
}>()
defineEmits<{ back: [] }>()
</script>

<template lang="pug">
div(class="px-4 pt-5 pb-1")
  button(
    type="button",
    class="mb-4 flex min-h-11 items-center gap-1 font-form text-back text-primary",
    :disabled="backDisabled",
    @click="$emit('back')"
  )
    BaseIcon(name="back")
    span {{ back }}
  hr(class="border-primary-light")
div(class="px-4 pt-4 pb-2")
  div(
    class="progress-track h-2 overflow-hidden rounded bg-primary-light",
    role="progressbar",
    :aria-label="step",
    :aria-valuenow="progress",
    aria-valuemin="0",
    aria-valuemax="100"
  )
    div(
      class="h-full rounded bg-primary-gradient",
      :style="{ width: progress + '%' }"
    )
  p(class="mt-1 font-form text-body font-normal") {{ step }}
header(class="px-5 pt-5 pb-3")
  h1(class="mb-1 text-heading-1") {{ title }}
  p {{ description }}
</template>
