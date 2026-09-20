<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { backWithinFlow } from '../instruction-navigation'
import { previewSession } from '../preview-flow'
import type { CrueltyFollowupView } from './fixtures/cruelty-followup'
const props = defineProps<{ view: CrueltyFollowupView }>()
const router = useRouter()
const saved =
  props.view.answerSource === 'other' ? previewSession.value?.otherReport : previewSession.value?.crueltyReport
const reasons = ref(props.view.reasons ? [...(saved?.reasons ?? [])] : [])
const description = ref(props.view.reasons ? (saved?.description ?? '') : '')
watch(
  [reasons, description],
  () => {
    const session = previewSession.value
    if (!session || !props.view.reasons) return
    if (props.view.answerSource === 'other') session.otherReport ??= { reasons: [] }
    const report = props.view.answerSource === 'other' ? session.otherReport : session.crueltyReport
    if (!report) return
    report.reasons = [...reasons.value]
    if (reasons.value.includes('other')) report.description = description.value.trim()
    else delete report.description
  },
  { deep: true }
)
function goBack() {
  backWithinFlow(router, props.view.backTarget, [props.view.backTarget])
}
function proceed(action: CrueltyFollowupView['actions'][number]) {
  if (props.view.answerSource === 'other' && previewSession.value) previewSession.value.documentingOther = true
  if (action.outcome && previewSession.value && previewSession.value.crueltyReport?.outcome !== action.outcome) {
    previewSession.value.crueltyReport = { outcome: action.outcome, reasons: [] }
  }
  void router.push({ name: action.target })
}
</script>
<template lang="pug">
.customer-cruelty-followup(
  class="flex flex-1 flex-col",
  :lang="view.locale"
)
  div(class="px-4 pt-5 pb-1")
    button(
      type="button",
      class="mb-4 flex min-h-11 items-center gap-1 font-form text-back text-primary",
      @click="goBack"
    )
      base-icon(name="back")
      span {{ view.copy.back }}
    hr(class="border-primary-light")
  header(class="px-5 pt-5 pb-3")
    h1(class="mb-1 text-heading-1") {{ view.copy.title }}
    p(v-if="view.copy.description") {{ view.copy.description }}
  div(
    v-if="view.reasons",
    class="px-4 pt-2 pb-4"
  )
    section(
      class="rounded-control border border-primary-light bg-surface py-4",
      aria-labelledby="cruelty-reasons"
    )
      h2#cruelty-reasons(class="border-b border-primary-light px-4 pb-3 text-body-strong") {{ view.reasons.title }}
      div(class="flex flex-col gap-3 px-4 pt-3")
        div(
          v-for="reason in view.reasons.options",
          :key="reason.id"
        )
          label(class="flex items-center gap-2")
            input(
              v-model="reasons",
              type="checkbox",
              :value="reason.id",
              class="size-6 shrink-0 accent-primary"
            )
            span {{ reason.label }}
          base-expander(
            v-if="reason.description",
            :state="reasons.includes(reason.id)"
          )
            div(class="pt-3")
              textarea(
                v-model="description",
                :aria-label="reason.description.placeholder",
                :placeholder="reason.description.placeholder",
                :maxlength="reason.description.maxLength",
                :disabled="!reasons.includes(reason.id)",
                rows="4",
                class="w-full resize-none rounded-control border border-primary bg-surface p-3 placeholder:text-muted focus:shadow-[inset_0_0_0_1px_var(--color-primary)] focus:outline-none"
              )
  footer(class="sticky bottom-0 z-20 mt-auto flex flex-col gap-4 bg-canvas p-4 pb-[max(1rem,env(safe-area-inset-bottom))]")
    div(
      aria-hidden="true",
      class="pointer-events-none absolute inset-x-0 bottom-full h-6 bg-linear-to-b from-transparent to-canvas"
    )
    button(
      v-for="action in view.actions",
      :key="action.target",
      type="button",
      class="ui-button w-full rounded-control p-4 text-button",
      :class="action.primary ? 'bg-primary-gradient text-white shadow-brand' : 'border border-primary bg-surface text-primary'",
      @click="proceed(action)"
    ) {{ action.label }}
</template>
