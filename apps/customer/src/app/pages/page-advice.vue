<script setup lang="ts">
import PageIntro from '../components/page-intro.vue'
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
  PageIntro(
    :back="view.copy.back",
    :back-disabled="!view.allowedActions.includes('back')",
    :step="view.copy.step",
    :progress="view.copy.progress",
    :title="view.copy.title",
    :description="view.copy.description",
    @back="router.push({ name: view.backTarget })"
  )
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
