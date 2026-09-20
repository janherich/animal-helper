<script setup lang="ts">
import { previewSession } from '../preview-flow'
import { useRouter } from 'vue-router'
import { backWithinFlow } from '../instruction-navigation'
import type { CrueltyView } from './fixtures/cruelty'
import { requestMobileCall } from '@/libs/mobile-call'
const props = defineProps<{ view: CrueltyView }>()
const router = useRouter()
function goBack() {
  if (props.view.allowedActions.includes('back')) backWithinFlow(router, props.view.backTarget, ['W01'])
}
function callPolice() {
  if (!props.view.allowedActions.includes('call')) return
  requestMobileCall(props.view.actions.call.href)
  void router.push({ name: props.view.actions.call.target })
}
function proceed() {
  if (!props.view.allowedActions.includes('continue')) return
  if (previewSession.value) delete previewSession.value.crueltyReport
  void router.push({ name: props.view.actions.continue.target })
}
</script>

<template lang="pug">
.customer-cruelty(
  class="flex flex-1 flex-col",
  :lang="view.locale"
)
  div(class="px-4 pt-5 pb-1")
    button(
      type="button",
      class="mb-4 flex min-h-11 items-center gap-1 font-form text-back text-primary",
      :disabled="!view.allowedActions.includes('back')",
      @click="goBack"
    )
      base-icon(name="back")
      span {{ view.copy.back }}
    hr(class="border-primary-light")
  header(class="px-5 pt-5 pb-3")
    h1(class="mb-1 text-heading-1") {{ view.copy.title }}
    p
      | {{ view.copy.description }}
      | {{ ' ' }}
      span(class="text-danger") {{ view.copy.urgent }}
  div(class="flex flex-col gap-4 p-4")
    section(class="rounded-control border border-accent bg-accent-light px-5 py-4")
      div(class="mb-2 flex items-center gap-2 text-accent")
        base-icon(name="warning")
        h2(class="text-heading-3") {{ view.safety.title }}
      p(
        v-for="(paragraph, index) in view.safety.paragraphs",
        :key="index",
        class="mt-1"
      ) {{ paragraph }}
    section(class="px-5 py-3")
      h2(class="mb-1 text-heading-2 text-primary") {{ view.instructions.title }}
      ul(class="list-disc space-y-2 pl-4 marker:text-primary")
        li(
          v-for="item in view.instructions.items",
          :key="item.id"
        ) {{ item.text }}
  footer(class="sticky bottom-0 z-20 mt-auto flex flex-col gap-4 bg-canvas p-4 pb-[max(1rem,env(safe-area-inset-bottom))]")
    div(
      aria-hidden="true",
      class="pointer-events-none absolute inset-x-0 bottom-full h-6 bg-linear-to-b from-transparent to-canvas"
    )
    button(
      type="button",
      class="ui-button w-full rounded-control bg-primary-gradient p-4 text-button text-white shadow-brand disabled:opacity-40",
      :disabled="!view.allowedActions.includes('call')",
      @click="callPolice"
    ) {{ view.actions.call.label }}
    button(
      type="button",
      class="ui-button w-full rounded-control border border-primary bg-surface p-4 text-button text-primary disabled:opacity-40",
      :disabled="!view.allowedActions.includes('continue')",
      @click="proceed"
    ) {{ view.actions.continue.label }}
</template>
