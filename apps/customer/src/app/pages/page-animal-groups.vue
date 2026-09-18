<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { autoUpdate, offset, shift, size, useFloating } from '@floating-ui/vue'
import { useRouter } from 'vue-router'
import { scrollActiveOption } from '@/libs/scroll-active-option'
import { previewSession } from '../preview-flow'
import type { AnimalGroupsView, AnimalBranch, AnimalNode } from './fixtures/animal-groups'

const props = defineProps<{ view: AnimalGroupsView }>()
const router = useRouter()
const search = ref<HTMLElement>()
const results = ref<HTMLElement>()
const resultsId = useId()
const focused = ref(false)
const activeIndex = ref(-1)
const query = ref('')
const path = ref<string[]>([...(previewSession.value?.animalIdentification?.path ?? [])])
const cardTransition = ref('animal-forward')
const branches = computed(() => {
  const chain = [props.view.root]
  for (const id of path.value) {
    const node = chain[chain.length - 1]!.children.find(item => item.id === id)
    if (!node || node.kind !== 'branch') break
    chain.push(node)
  }
  return chain
})
const branch = computed(() => branches.value[branches.value.length - 1]!)
const cardsKey = computed(() => branches.value.map(item => item.id).join('/'))
watch(
  cardsKey,
  () => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  },
  { flush: 'post' }
)
const searchFirst = ref('')
const cards = computed(() => {
  const children = branch.value.children
  const first = children.find(node => node.id === searchFirst.value)
  return first ? [first, ...children.filter(node => node.id !== first.id)] : children
})
const heading = computed(() => props.view.props.title)
const intro = computed(() => props.view.props.description)
type SearchAnimal = Extract<AnimalNode, { kind: 'animal' }> & { path: string[] }
const animals = computed(() => {
  const found: SearchAnimal[] = []
  function visit(parent: AnimalBranch, ancestors: string[]) {
    for (const node of parent.children) {
      if (node.kind === 'branch') visit(node, [...ancestors, node.id])
      else if (node.kind === 'animal') found.push({ ...node, path: ancestors })
    }
  }
  visit(props.view.root, [])
  return found
})
function disableLeavingCards(element: Element) {
  element.setAttribute('inert', '')
  element.setAttribute('aria-hidden', 'true')
}
const savedIdentification = previewSession.value?.animalIdentification
const choice = ref(
  savedIdentification?.kind === 'species' ? (savedIdentification.speciesId ?? '') : (savedIdentification?.kind ?? '')
)
const description = ref(savedIdentification?.description ?? '')
const completed = ref(false)
function restartSelection() {
  if (!props.view.allowedActions.includes('select-group')) return
  cardTransition.value = 'animal-backward'
  resetSelection()
  path.value = []
  syncPath()
}
function syncPath() {
  const session = previewSession.value
  if (!session) return
  session.animalPath = [...path.value]
  if (path.value[0]) session.animalGroup = path.value[0]
  else delete session.animalGroup
  if (path.value[1]) session.animalCategory = path.value[1]
  else delete session.animalCategory
  delete session.animalSpecies
}
function resetSelection() {
  searchFirst.value = ''
  choice.value = ''
  description.value = ''
  completed.value = false
  query.value = ''
  focused.value = false
  if (previewSession.value) delete previewSession.value.animalIdentification
}
function confirm() {
  const session = previewSession.value
  if (!session || !props.view.allowedActions.includes('confirm') || !choice.value) return
  if (choice.value === 'other' && !description.value.trim()) return
  syncPath()
  const selectedKind = choice.value === 'unknown' ? 'unknown' : choice.value === 'other' ? 'other' : 'species'
  session.animalIdentification = {
    kind: selectedKind,
    ...(session.animalGroup ? { groupId: session.animalGroup } : {}),
    path: [...path.value],
    ...(path.value[1] ? { categoryId: path.value[1] } : {}),
    ...(selectedKind === 'species' ? { speciesId: choice.value } : {}),
    ...(selectedKind === 'other' ? { description: description.value.trim() } : {})
  }
  completed.value = true
  session.editingAnimal = false
  session.identificationFailed = false
  void router.push({ name: props.view.confirmTarget })
}
function selectCard(id: string) {
  cardTransition.value = 'animal-forward'
  const node = cards.value.find(item => item.id === id)
  if (!node || !props.view.allowedActions.includes(node.kind === 'branch' ? 'select-group' : 'select-animal')) return
  if (node.kind === 'branch') {
    resetSelection()
    path.value = [...path.value, node.id]
    syncPath()
  } else {
    choice.value = choice.value === id ? '' : id
    completed.value = false
  }
}
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
const matches = computed(() => {
  const needle = normalize(query.value.trim())
  return needle
    ? animals.value.filter(animal => {
        const words = normalize(animal.label).split(/\s+/)
        return words.some((_, index) => words.slice(index).join(' ').startsWith(needle))
      })
    : []
})
const open = computed(() => focused.value && !!query.value.trim() && props.view.allowedActions.includes('search'))
const { floatingStyles } = useFloating(search, results, {
  open,
  placement: 'bottom-start',
  strategy: 'fixed',
  middleware: [
    offset(6),
    shift({ padding: 8 }),
    size({
      padding: 8,
      apply({ rects, availableHeight, elements }) {
        Object.assign(elements.floating.style, {
          width: `${rects.reference.width}px`,
          maxHeight: `${Math.max(0, Math.min(280, availableHeight))}px`
        })
      }
    })
  ],
  whileElementsMounted: autoUpdate
})
watch(query, () => {
  activeIndex.value = -1
})
function titleParts(label: string) {
  const needle = normalize(query.value.trim())
  const index = normalize(label).indexOf(needle)
  if (!needle || index < 0) return { before: label, match: '', after: '' }
  return {
    before: label.slice(0, index),
    match: label.slice(index, index + needle.length),
    after: label.slice(index + needle.length)
  }
}
function selectAnimal(animal: SearchAnimal) {
  if (!props.view.allowedActions.includes('select-animal') || !previewSession.value) return
  cardTransition.value = 'animal-forward'
  resetSelection()
  path.value = [...animal.path]
  syncPath()
  previewSession.value.animalSpecies = animal.id
  choice.value = animal.id
  searchFirst.value = animal.id
}
async function onSearchKeydown(event: KeyboardEvent) {
  if (event.isComposing) return
  if (event.key === 'Escape') {
    focused.value = false
    activeIndex.value = -1
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    focused.value = true
    const count = matches.value.length
    if (count) {
      activeIndex.value =
        activeIndex.value < 0
          ? event.key === 'ArrowDown'
            ? 0
            : count - 1
          : (activeIndex.value + (event.key === 'ArrowDown' ? 1 : -1) + count) % count
      await nextTick()
      scrollActiveOption(results.value, activeIndex.value)
    }
  } else if (event.key === 'Enter' && open.value && activeIndex.value >= 0) {
    event.preventDefault()
    const animal = matches.value[activeIndex.value]
    if (animal) selectAnimal(animal)
  }
}
function goBack() {
  if (!props.view.allowedActions.includes('back')) return
  void router.push({ name: props.view.backTarget })
}
</script>

<template lang="pug">
.customer-animal-groups(
  class="flex flex-1 flex-col",
  :lang="view.locale"
)
  .customer-animal-groups__content(class="flex-1")
    .customer-animal-groups__top
      .customer-animal-groups__back(class="px-4 pt-5 pb-1")
        button(
          type="button",
          class="mb-4 flex min-h-11 items-center gap-1 text-heading-2 text-primary",
          :disabled="!view.allowedActions.includes('back')",
          @click="goBack"
        )
          base-icon(name="back")
          span {{ view.props.back }}
        hr(class="border-primary-light")
      .customer-animal-groups__steps(class="px-4 pt-4 pb-2")
        .customer-animal-groups__progress(
          class="h-2 overflow-hidden rounded bg-primary-light",
          role="progressbar",
          :aria-label="view.props.step",
          :aria-valuenow="view.props.progress",
          aria-valuemin="0",
          aria-valuemax="100"
        )
          div(
            class="h-full rounded bg-primary-gradient",
            :style="{ width: view.props.progress + '%' }"
          )
        p(class="mt-1") {{ view.props.step }}
      header(class="px-5 pt-5 pb-3")
        h1(class="mb-1 text-heading-1") {{ heading }}
        p {{ intro }}
      div(class="px-4 py-2")
        hr(class="border-primary-light")
      .customer-animal-groups__search(class="flex items-center gap-2 px-4 pt-2 pb-2")
        div(
          ref="search",
          class="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-control border border-primary bg-surface pr-1 pl-3 shadow-md"
        )
          base-icon(
            name="search",
            class="text-primary"
          )
          input(
            v-model="query",
            type="text",
            role="combobox",
            aria-autocomplete="list",
            :aria-expanded="open",
            :aria-controls="open ? resultsId : undefined",
            :aria-activedescendant="open && activeIndex >= 0 ? resultsId + '-' + activeIndex : undefined",
            class="w-full min-w-0 bg-transparent outline-none placeholder:text-muted",
            :placeholder="view.props.search",
            :aria-label="view.props.search",
            aria-describedby="animal-groups-preview",
            :disabled="!view.allowedActions.includes('search')",
            autocomplete="off",
            @focus="focused = true",
            @input="focused = true",
            @blur="focused = false",
            @keydown="onSearchKeydown"
          )
          button(
            type="button",
            class="flex size-8 shrink-0 items-center justify-center rounded-full text-primary hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40",
            :aria-label="view.copy.restart",
            :title="view.copy.restart",
            :disabled="(!path.length && !query && !choice && !description) || !view.allowedActions.includes('select-group')",
            @click="restartSelection"
          )
            base-icon(
              name="restart",
              style="width: 20px; height: 20px"
            )
        Transition(name="animal-suggestions")
          ul.customer-animal-groups__results(
            v-if="open",
            :id="resultsId",
            ref="results",
            role="listbox",
            :aria-label="view.props.results",
            :style="floatingStyles",
            class="z-20 flex flex-col gap-2 overflow-auto rounded-control bg-surface p-2 shadow-[0_2px_6px_rgb(37_42_49/16%)]"
          )
            li(
              v-for="(animal, index) in matches",
              :id="resultsId + '-' + index",
              :key="animal.id",
              role="option",
              :aria-label="animal.label",
              :aria-describedby="resultsId + '-detail-' + index",
              :aria-selected="activeIndex === index",
              :aria-disabled="!view.allowedActions.includes('select-animal')",
              class="min-h-11 shrink-0 rounded-control px-3 py-2 text-left transition-colors duration-150 hover:bg-canvas motion-reduce:transition-none",
              :class="{ 'bg-primary-light': activeIndex === index }",
              @mousedown.prevent,
              @click="selectAnimal(animal)"
            )
              p(class="text-body-strong")
                span {{ titleParts(animal.label).before }}
                span(class="text-primary") {{ titleParts(animal.label).match }}
                span {{ titleParts(animal.label).after }}
              p(
                :id="resultsId + '-detail-' + index",
                class="mt-1 text-small"
              ) {{ animal.detail }}
            li(
              v-if="!matches.length",
              class="p-3",
              role="status"
            ) {{ view.props.empty }}
    .customer-animal-groups__cards(class="relative overflow-hidden")
      Transition(
        :name="cardTransition",
        @before-leave="disableLeavingCards"
      )
        .customer-animal-groups__grid(
          :key="cardsKey",
          class="mx-auto grid w-full max-w-[640px] grid-cols-2 gap-4 px-4 pt-2 pb-4"
        )
          button(
            v-for="group in cards",
            :key="group.id",
            type="button",
            class="flex aspect-square min-w-0 flex-col overflow-hidden rounded-control border bg-surface text-primary transition-colors hover:border-primary motion-reduce:transition-none",
            :class="choice === group.id ? 'border-primary ring-2 ring-primary' : 'border-primary-light'",
            :aria-pressed="group.kind === 'animal' ? choice === group.id : undefined",
            :disabled="!view.allowedActions.includes(group.kind === 'branch' ? 'select-group' : 'select-animal')",
            @click="selectCard(group.id)"
          )
            span.customer-animal-groups__placeholder(
              class="relative min-h-0 w-full flex-1 overflow-hidden",
              aria-hidden="true"
            )
              img(
                v-if="'imageUrl' in group && group.imageUrl",
                :src="'imageUrl' in group ? group.imageUrl : undefined",
                alt="",
                class="absolute inset-0 size-full object-cover"
              )
              span(
                v-else,
                class="absolute inset-0 flex items-center justify-center text-primary/25"
              )
                svg(
                  class="size-12",
                  viewBox="0 0 24 24",
                  focusable="false"
                )
                  use(href="#icon-stray-animal")
            span(class="flex min-h-9 w-full items-center justify-center bg-primary-light px-2 py-2 text-center") {{ group.label }}
    p#animal-groups-preview(class="px-4 pt-2 pb-6 text-center text-small text-primary") {{ view.props.preview }}
    p(
      v-if="completed",
      role="status",
      class="px-4 py-3 text-center text-primary"
    ) {{ view.copy.completed }}
  .customer-animal-groups__actions(
    class="sticky bottom-0 z-20 mt-auto flex shrink-0 flex-col gap-3 bg-canvas p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
  )
    div(
      aria-hidden="true",
      class="pointer-events-none absolute inset-x-0 bottom-full h-6 bg-linear-to-b from-transparent to-canvas"
    )
    fieldset.customer-animal-groups__other(class="rounded-control border border-primary-light bg-surface p-4")
      legend(class="px-1 font-semibold") {{ view.copy.alternatives }}
      label(class="flex items-center gap-2")
        input(
          v-model="choice",
          type="radio",
          name="animal-alternative",
          value="other",
          class="size-5 accent-primary",
          :disabled="!view.allowedActions.includes('select-animal')",
          @change="completed = false"
        )
        span {{ branch.otherLabel }}
      base-expander.customer-animal-groups__description(:state="choice === 'other'")
        div(class="pt-3")
          textarea(
            v-model="description",
            :aria-label="view.copy.description",
            :placeholder="view.copy.description",
            rows="4",
            :required="choice === 'other'",
            class="w-full resize-none rounded-control border border-primary bg-surface p-3 outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-primary-light)]",
            :disabled="choice !== 'other' || !view.allowedActions.includes('select-animal')"
          )
      label(class="mt-3 flex items-center gap-2")
        input(
          v-model="choice",
          type="radio",
          name="animal-alternative",
          value="unknown",
          class="size-5 accent-primary",
          :disabled="!view.allowedActions.includes('select-animal')",
          @change="completed = false"
        )
        span {{ view.copy.unknown }}
    button(
      type="button",
      class="min-h-13 w-full rounded-control bg-primary-gradient p-4 text-button text-white disabled:opacity-40",
      :disabled="!choice || (choice === 'other' && !description.trim()) || !view.allowedActions.includes('confirm')",
      @click="confirm()"
    ) {{ view.copy.confirm }}
</template>

<style scoped>
.customer-animal-groups__cards {
  width: 100vw;
  margin-inline: calc(50% - 50vw);
}
.animal-forward-leave-active,
.animal-backward-leave-active {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
@media (prefers-reduced-motion: no-preference) {
  .animal-forward-enter-active,
  .animal-forward-leave-active,
  .animal-backward-enter-active,
  .animal-backward-leave-active {
    transition:
      transform 280ms ease,
      opacity 280ms ease;
  }
  .animal-forward-enter-from,
  .animal-backward-leave-to {
    transform: translateX(100vw);
    opacity: 0;
  }
  .animal-forward-leave-to,
  .animal-backward-enter-from {
    transform: translateX(-100vw);
    opacity: 0;
  }
}
.animal-suggestions-leave-active {
  pointer-events: none;
}
.customer-animal-groups__search:has(input:focus-visible) > div {
  box-shadow: 0 0 0 2px var(--color-primary-light);
}
@media (prefers-reduced-motion: no-preference) {
  .animal-suggestions-enter-active {
    transition: opacity 160ms ease-out;
  }
  .animal-suggestions-leave-active {
    transition: opacity 120ms ease-in;
  }
  .animal-suggestions-enter-from,
  .animal-suggestions-leave-to {
    opacity: 0;
  }
}
</style>
