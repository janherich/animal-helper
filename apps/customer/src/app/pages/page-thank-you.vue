<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import { useRouter } from 'vue-router'
import { previewSession } from '../preview-flow'
import type { ThankYouView } from './fixtures/thank-you'
const props = defineProps<{ view: ThankYouView }>()
const router = useRouter()
const id = useId()
// Deliberately page-local: no persistence, logging, submission or preselected consent.
const values = ref<Record<string, string>>({})
const consents = ref<Record<string, boolean>>({})
const reasons = ref<Record<string, boolean>>({})
const descriptions = ref<Record<string, string>>({})
watch(
  () => props.view,
  () => {
    values.value = {}
    consents.value = {}
    reasons.value = {}
    descriptions.value = {}
  }
)
function submit() {
  if (props.view.allowedActions.includes('submit')) void router.push({ name: props.view.submitTarget })
}
</script>

<template lang="pug">
form.customer-thank-you(
  class="flex flex-1 flex-col",
  :lang="view.locale",
  @submit.prevent="submit"
)
  div(class="px-4 pt-5 pb-1")
    button(
      type="button",
      class="mb-4 flex min-h-11 items-center gap-1 font-form text-back text-primary",
      :disabled="!view.allowedActions.includes('back')",
      @click="router.push({ name: previewSession?.thankYouReturnTarget ?? view.backTarget })"
    )
      base-icon(name="back")
      span {{ view.copy.back }}
    hr(class="border-primary-light")
  header(class="px-5 pt-5 pb-3")
    h1(class="mb-1 text-heading-1") {{ view.copy.title }}
    p(v-if="view.copy.description") {{ view.copy.description }}
  div(
    v-for="(group, groupIndex) in view.reasonGroups ?? (view.reasons ? [view.reasons] : [])",
    :key="groupIndex",
    class="px-4 pt-2 pb-4"
  )
    section(
      class="rounded-control border border-primary-light bg-surface py-4",
      :aria-labelledby="id + '-reasons-' + groupIndex"
    )
      h2(
        :id="id + '-reasons-' + groupIndex",
        class="border-b border-primary-light px-4 pb-3 text-body-strong"
      ) {{ group.title }}
      div(class="flex flex-col gap-3 px-4 pt-3")
        div(
          v-for="reason in group.options",
          :key="reason.id"
        )
          label(class="flex items-center gap-2")
            input(
              v-model="reasons[reason.id]",
              type="checkbox",
              :name="reason.id",
              class="size-6 shrink-0 accent-primary"
            )
            span {{ reason.label }}
          base-expander(
            v-if="reason.description",
            :state="!!reasons[reason.id]"
          )
            div(class="pt-3")
              textarea(
                v-model="descriptions[reason.id]",
                :aria-label="reason.description.placeholder",
                :placeholder="reason.description.placeholder",
                :required="reasons[reason.id] && reason.description.required",
                :disabled="!reasons[reason.id]",
                :maxlength="reason.description.maxLength",
                rows="4",
                class="w-full resize-none rounded-control border border-primary bg-surface p-3 placeholder:text-muted focus:shadow-[inset_0_0_0_1px_var(--color-primary)] focus:outline-none"
              )
  div(
    v-if="view.help",
    class="px-4 pt-2 pb-4"
  )
    section(class="rounded-control border border-success bg-success-light p-4")
      h2(class="mb-3 px-1 text-heading-3 text-success") {{ view.help.title }}
      p(class="mb-5 px-1") {{ view.help.description }}
      button(
        type="button",
        class="ui-button w-full rounded-control bg-primary-gradient p-4 text-button text-white shadow-brand disabled:opacity-40",
        :disabled="!view.help.action.enabled",
        @click="view.help.action.enabled && router.push({ name: view.help.action.target })"
      ) {{ view.help.action.label }}
  section(
    v-if="view.contactIntro",
    class="px-5 py-1"
  )
    h2(class="mb-1 text-heading-3") {{ view.contactIntro.title }}
    p {{ view.contactIntro.description }}
  div(class="flex flex-col gap-4 px-4 pt-2 pb-4")
    div(
      v-for="field in view.fields",
      :key="field.id",
      class="flex flex-col gap-2"
    )
      label(
        :for="id + field.id",
        class="px-2 font-form text-small"
      ) {{ field.label }}
      input(
        :id="id + field.id",
        v-model="values[field.id]",
        :type="field.type",
        :name="field.id",
        :autocomplete="field.autocomplete",
        :placeholder="field.placeholder",
        :required="field.required",
        :maxlength="field.maxLength",
        class="min-h-11 w-full rounded-control border border-primary bg-surface px-4 py-2.5 placeholder:text-muted focus:shadow-[inset_0_0_0_1px_var(--color-primary)] focus:outline-none"
      )
    label(
      v-for="consent in view.consents",
      :key="consent.id",
      class="flex items-center gap-2"
    )
      input(
        v-model="consents[consent.id]",
        type="checkbox",
        :name="consent.id",
        :required="consent.required",
        class="size-5 shrink-0 accent-primary"
      )
      span {{ consent.label }}
  footer(class="sticky bottom-0 z-20 mt-auto flex flex-col gap-4 bg-canvas p-4 pb-[max(1rem,env(safe-area-inset-bottom))]")
    div(
      aria-hidden="true",
      class="pointer-events-none absolute inset-x-0 bottom-full h-6 bg-linear-to-b from-transparent to-canvas"
    )
    button(
      type="submit",
      class="ui-button w-full rounded-control bg-primary-gradient p-4 text-button text-white shadow-brand disabled:opacity-40",
      :disabled="!view.allowedActions.includes('submit')"
    ) {{ view.copy.submit }}
</template>
