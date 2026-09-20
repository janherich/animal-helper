<script setup lang="ts">
import PageActions from '../components/page-actions.vue'
import ValidationMessage from '../components/validation-message.vue'
import { useFormValidation } from '@/libs/use-form-validation'
import { computed, ref, useId, watch } from 'vue'
import { useRouter } from 'vue-router'
import { previewSession } from '../preview-flow'
import type { ThankYouView } from './fixtures/thank-you'
import { completion } from '../completion'
const props = defineProps<{ view: ThankYouView }>()
const router = useRouter()
const form = ref<HTMLFormElement>()
const validation = useFormValidation(() => props.view.validation)
const id = useId()
const finishing = computed(() => !!completion.value)
// Deliberately page-local: no persistence, logging, submission or preselected consent.
const values = ref<Record<string, string>>({ ...props.view.values })
const consents = ref<Record<string, boolean>>({})
const reasons = ref<Record<string, boolean>>({})
const descriptions = ref<Record<string, string>>({})
watch(
  () => props.view.screen,
  () => {
    values.value = { ...props.view.values }
    consents.value = {}
    reasons.value = {}
    descriptions.value = {}
  }
)
function submit() {
  if (validation.hasFieldErrors.value) {
    validation.focusFirstError(form.value)
    return
  }
  if (!finishing.value && props.view.allowedActions.includes('submit')) {
    completion.value = { label: props.view.completionLabel, target: props.view.submitTarget }
  }
}
</script>

<template lang="pug">
form.customer-thank-you(
  ref="form",
  class="flex flex-1 flex-col",
  :lang="view.locale",
  :inert="finishing",
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
  ValidationMessage(
    :messages="validation.formErrors.value",
    summary,
    class="mx-4 mb-3"
  )
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
              v-bind="validation.attrs('reason:' + reason.id)",
              type="checkbox",
              :name="reason.id",
              class="size-6 shrink-0 accent-primary",
              @change="validation.clear('reason:' + reason.id, 'description:' + reason.id)"
            )
            span {{ reason.label }}
          ValidationMessage(
            :id="validation.errorId('reason:' + reason.id)",
            :messages="validation.messages('reason:' + reason.id)"
          )
          base-expander(
            v-if="reason.description",
            :state="!!reasons[reason.id]"
          )
            div(class="pt-3")
              textarea(
                v-model="descriptions[reason.id]",
                v-bind="validation.attrs('description:' + reason.id)",
                :aria-label="reason.description.placeholder",
                :placeholder="reason.description.placeholder",
                :required="reasons[reason.id] && reason.description.required",
                :disabled="!reasons[reason.id]",
                :maxlength="reason.description.maxLength",
                rows="4",
                class="w-full resize-none rounded-control border border-primary bg-surface p-3 placeholder:text-muted focus:shadow-[inset_0_0_0_1px_var(--color-primary)] focus:outline-none",
                @input="validation.clear('description:' + reason.id)"
              )
              ValidationMessage(
                :id="validation.errorId('description:' + reason.id)",
                :messages="validation.messages('description:' + reason.id)"
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
        v-bind="validation.attrs(field.id)",
        :type="field.type",
        :name="field.id",
        :autocomplete="field.autocomplete",
        :placeholder="field.placeholder",
        :required="field.required",
        :maxlength="field.maxLength",
        class="min-h-11 w-full rounded-control border border-primary bg-surface px-4 py-2.5 placeholder:text-muted focus:shadow-[inset_0_0_0_1px_var(--color-primary)] focus:outline-none",
        @input="validation.clear(field.id)"
      )
      ValidationMessage(
        :id="validation.errorId(field.id)",
        :messages="validation.messages(field.id)"
      )
    div(
      v-for="consent in view.consents",
      :key="consent.id"
    )
      label(class="flex items-center gap-2")
        input(
          v-model="consents[consent.id]",
          v-bind="validation.attrs('consent:' + consent.id)",
          type="checkbox",
          :name="consent.id",
          :required="consent.required",
          class="size-5 shrink-0 accent-primary",
          @change="validation.clear('consent:' + consent.id)"
        )
        span {{ consent.label }}
      ValidationMessage(
        :id="validation.errorId('consent:' + consent.id)",
        :messages="validation.messages('consent:' + consent.id)"
      )
  PageActions(class="flex flex-col gap-4")
    button(
      type="submit",
      class="ui-button w-full rounded-control bg-primary-gradient p-4 text-button text-white shadow-brand disabled:opacity-40",
      :disabled="finishing || !view.allowedActions.includes('submit')"
    ) {{ view.copy.submit }}
</template>
