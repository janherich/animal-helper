<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { previewSession } from '../preview-flow'
import { catalogueAnimals } from '../animal-catalogue'
import type { AnimalBranch } from './fixtures/animal-groups'
import type { AnimalDetailsView, DetailQuestion } from './fixtures/animal-details'
const props = defineProps<{ view: AnimalDetailsView; catalogue: AnimalBranch }>()
const router = useRouter()
const failed = computed(() => !!previewSession.value?.identificationFailed)
const identification = computed(() => previewSession.value?.animalIdentification)
const animal = computed(() =>
  catalogueAnimals(props.catalogue).find(item => item.id === identification.value?.speciesId)
)
const animalLabel = computed(
  () =>
    animal.value?.label ??
    (identification.value?.kind === 'other'
      ? identification.value.description || props.view.copy.other
      : props.view.copy.unknown)
)
const answers = ref<Record<string, string | string[]>>({ ...props.view.values, ...previewSession.value?.animalDetails })
watch(
  answers,
  value => {
    if (previewSession.value) previewSession.value.animalDetails = { ...value }
    if (previewSession.value) previewSession.value.adviceReady = false
  },
  { deep: true }
)
function selected(question: DetailQuestion, id: string) {
  const value = answers.value[question.id]
  return Array.isArray(value) ? value.includes(id) : value === id
}
function choose(question: DetailQuestion, id: string) {
  if (question.kind === 'single') answers.value[question.id] = id
  else {
    const current = answers.value[question.id]
    const values = Array.isArray(current) ? current : []
    const exclusive = question.options.find(option => option.id === id)?.exclusive
    answers.value[question.id] = values.includes(id)
      ? values.filter(value => value !== id)
      : exclusive
        ? [id]
        : [...values.filter(value => !question.options.find(option => option.id === value)?.exclusive), id]
  }
  for (const option of question.options)
    if (option.description && !selected(question, option.id)) delete answers.value[`${question.id}:${option.id}`]
}
const valid = computed(() =>
  props.view.questions.every(
    question =>
      !question.required ||
      (question.kind === 'text'
        ? typeof answers.value[question.id] === 'string' && String(answers.value[question.id]).trim().length > 0
        : question.options.some(option => selected(question, option.id)))
  )
)
function confirm() {
  if (!valid.value || !props.view.allowedActions.includes('confirm') || !previewSession.value) return
  previewSession.value.animalDetails = { ...answers.value }
  previewSession.value.adviceReady = true
  void router.push({ name: props.view.confirmTarget })
}
function edit() {
  if (!props.view.allowedActions.includes('edit')) return
  if (previewSession.value) previewSession.value.editingAnimal = true
  void router.push({ name: props.view.editTarget })
}
</script>

<template lang="pug">
.customer-animal-details(
  class="flex flex-1 flex-col",
  :lang="view.locale"
)
  div(class="px-4 pt-5 pb-1")
    button(
      type="button",
      class="mb-4 flex min-h-11 items-center gap-1 text-heading-2 text-primary",
      :disabled="!view.allowedActions.includes('back')",
      @click="router.push({ name: failed ? view.failedBackTarget : view.backTarget })"
    )
      base-icon(name="back")
      span {{ view.copy.back }}
    hr(class="border-primary-light")
  div(class="px-4 pt-4 pb-2")
    div(
      class="h-2 overflow-hidden rounded bg-primary-light",
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
    p(class="mt-1") {{ view.copy.step }}
  header(class="px-5 pt-5 pb-3")
    h1(class="mb-1 text-heading-1") {{ view.copy.title }}
    p {{ view.copy.description }}
  div(class="px-4 py-2")
    hr(class="border-primary-light")
  h2(class="px-5 py-2 text-heading-3") {{ view.copy.animal }}
  div(
    v-if="failed",
    class="mx-4 my-2 rounded-control border border-accent bg-accent-light px-5 py-4",
    role="status"
  )
    div(class="flex items-center gap-2 text-accent")
      base-icon(
        name="warning",
        class="size-6 shrink-0"
      )
      p(class="min-w-0 text-heading-3") {{ view.copy.failedTitle }}
    p(class="mt-2") {{ view.copy.failedDescription }}
  template(v-else)
    section(class="mx-4 mb-4 rounded-control border border-primary-light bg-surface p-5")
      div(class="flex items-center justify-between gap-3")
        p(class="text-body-strong text-primary") {{ animalLabel }}
        button(
          type="button",
          class="flex min-h-8 items-center gap-1 text-small text-accent",
          :disabled="!view.allowedActions.includes('edit')",
          @click="edit"
        )
          base-icon(name="edit")
          span {{ view.copy.edit }}
      hr(class="my-4 border-primary-light")
      img(
        v-if="animal?.imageUrl",
        :src="animal.imageUrl",
        alt="",
        class="h-[200px] w-full rounded-control object-contain"
      )
      div(
        v-else,
        class="flex h-[200px] items-center justify-center text-primary/25",
        aria-hidden="true"
      )
        base-icon(
          name="stray-animal",
          style="width: 64px; height: 64px"
        )
    h2(class="px-5 py-2 text-heading-3") {{ view.copy.details }}
    form#animal-details-form(
      class="flex flex-col gap-2 px-4",
      @submit.prevent="confirm"
    )
      fieldset(
        v-for="question in view.questions",
        :key="question.id",
        class="min-w-0 rounded-control border border-primary-light bg-surface py-4",
        :aria-labelledby="'question-' + question.id"
      )
        div(
          :id="'question-' + question.id",
          class="px-4 text-body-strong"
        ) {{ question.label }}
        hr(class="my-3 border-primary-light")
        div(
          v-if="question.kind === 'text'",
          class="px-4"
        )
          textarea(
            v-model="answers[question.id]",
            :aria-label="question.label",
            :placeholder="question.placeholder",
            :required="question.required",
            rows="4",
            class="w-full resize-none rounded-control border border-primary bg-surface p-3 outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-primary-light)]"
          )
        div(class="flex flex-col gap-3 px-4")
          div(
            v-for="option in question.options",
            :key="option.id"
          )
            label(class="flex items-start gap-2")
              input(
                :type="question.kind === 'multiple' ? 'checkbox' : 'radio'",
                :name="question.id",
                :value="option.id",
                :checked="selected(question, option.id)",
                class="size-6 shrink-0 accent-primary",
                @change="choose(question, option.id)"
              )
              span {{ option.label }}
            base-expander(
              v-if="option.description",
              :state="selected(question, option.id)"
            )
              div(class="pt-3")
                textarea(
                  v-model="answers[question.id + ':' + option.id]",
                  :aria-label="option.description",
                  :placeholder="option.description",
                  :disabled="!selected(question, option.id)",
                  rows="4",
                  class="w-full resize-none rounded-control border border-primary bg-surface p-3 outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-primary-light)]"
                )
  p(class="px-4 py-5 text-center text-small text-primary") {{ failed ? view.copy.failedPreview : view.copy.preview }}
  div(class="sticky bottom-0 z-20 mt-auto bg-canvas p-4 pb-[max(1rem,env(safe-area-inset-bottom))]")
    div(
      aria-hidden="true",
      class="pointer-events-none absolute inset-x-0 bottom-full h-6 bg-linear-to-b from-transparent to-canvas"
    )
    button(
      v-if="failed",
      type="button",
      class="w-full rounded-control bg-primary-gradient p-4 text-button text-white shadow-brand",
      @click="router.push({ name: view.manualTarget })"
    ) {{ view.copy.manual }}
    button(
      v-else,
      type="submit",
      form="animal-details-form",
      :disabled="!valid || !view.allowedActions.includes('confirm')",
      class="w-full rounded-control bg-primary-gradient p-4 text-button text-white shadow-brand disabled:opacity-40"
    ) {{ view.copy.confirm }}
</template>
