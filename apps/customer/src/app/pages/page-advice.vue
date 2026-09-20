<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { AdviceView } from './fixtures/advice'
import AdviceBlocks from '../components/advice-blocks.vue'
const props = defineProps<{ view: AdviceView }>()
const router = useRouter()
function acknowledge() {
  if (!props.view.allowedActions.includes('acknowledge')) return
  void router.push({ name: props.view.confirmTarget })
}
</script>

<template lang="pug">
.customer-advice(
  class="flex flex-1 flex-col",
  :lang="view.locale"
)
  div(class="px-4 pt-5 pb-1")
    button(
      type="button",
      class="mb-4 flex min-h-11 items-center gap-1 font-form text-back text-primary",
      :disabled="!view.allowedActions.includes('back')",
      @click="router.push({ name: view.backTarget })"
    )
      base-icon(name="back")
      span {{ view.copy.back }}
    hr(class="border-primary-light")
  div(class="px-4 pt-4 pb-2")
    div(
      class="progress-track h-2 overflow-hidden rounded bg-primary-light",
      role="progressbar",
      :aria-label="view.copy.step",
      :aria-valuenow="view.copy.progress",
      aria-valuemin="0",
      aria-valuemax="100"
    )
      div(
        class="h-full rounded bg-primary-gradient",
        :style="{ width: view.copy.progress + '%' }"
      )
    p(class="mt-1 font-form text-body font-normal") {{ view.copy.step }}
  header(class="px-5 pt-5 pb-3")
    h1(class="mb-1 text-heading-1") {{ view.copy.title }}
    p {{ view.copy.description }}
  AdviceBlocks(:blocks="view.blocks")
  div(class="sticky bottom-0 z-20 mt-auto bg-canvas p-4 pb-[max(1rem,env(safe-area-inset-bottom))]")
    div(
      aria-hidden="true",
      class="pointer-events-none absolute inset-x-0 bottom-full h-6 bg-linear-to-b from-transparent to-canvas"
    )
    button(
      type="button",
      class="ui-button w-full rounded-control bg-primary-gradient p-4 text-button text-white shadow-brand disabled:opacity-40",
      :disabled="!view.allowedActions.includes('acknowledge')",
      @click="acknowledge"
    ) {{ view.copy.acknowledge }}
</template>
