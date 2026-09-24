<script setup lang="ts">
import FlowNavigation from '../components/flow-navigation.vue'
import { useRouter } from 'vue-router'
import { flowActions } from '../flow-client'
import { backWithinFlow } from '../instruction-navigation'
import type { OtherSituationView, OtherSituationChoice } from '../contracts/other-situation'
defineProps<{ view: OtherSituationView }>()
const router = useRouter()
function choose(choice: OtherSituationChoice) {
  void router.push({ name: flowActions.chooseSituation(choice) })
}
</script>
<template lang="pug">
.customer-other-situation(
  class="flex flex-1 flex-col",
  :lang="view.locale"
)
  FlowNavigation(
    :back="view.copy.back",
    @back="backWithinFlow(router, view.backTarget, [view.backTarget])"
  )
  header(class="px-5 pt-5 pb-3")
    h1(class="text-heading-1") {{ view.copy.title }}
  div(class="flex flex-col gap-4 px-4 pt-6 pb-4")
    button(
      v-for="choice in view.choices",
      :key="choice.id",
      type="button",
      class="ui-button w-full rounded-control border border-primary bg-surface p-4 text-button text-primary",
      @click="choose(choice)"
    )
      span(class="mx-auto block max-w-[40ch] text-balance") {{ choice.label }}
</template>
