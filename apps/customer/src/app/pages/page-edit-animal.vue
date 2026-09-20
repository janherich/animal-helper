<script setup lang="ts">
import PageIntro from '../components/page-intro.vue'
import { computed, nextTick, ref, useId, watch } from 'vue'
import { autoUpdate, offset, shift, size, useFloating } from '@floating-ui/vue'
import { useRouter } from 'vue-router'
import { scrollActiveOption } from '@/libs/scroll-active-option'
import { catalogueAnimals, searchAnimals, type CatalogueAnimal } from '../animal-catalogue'
import { previewSession } from '../preview-flow'
import type { AnimalBranch } from './fixtures/animal-groups'
import type { EditAnimalView } from './fixtures/animal-details'
const props = defineProps<{ view: EditAnimalView; catalogue: AnimalBranch }>()
const router = useRouter()
const query = ref('')
const focused = ref(false)
const active = ref(-1)
const anchor = ref<HTMLElement>()
const results = ref<HTMLElement>()
const id = useId()
const animals = computed(() => catalogueAnimals(props.catalogue))
const matches = computed(() => searchAnimals(animals.value, query.value))
const open = computed(() => focused.value && !!query.value.trim() && props.view.allowedActions.includes('search'))
const { floatingStyles } = useFloating(anchor, results, {
  open,
  placement: 'bottom-start',
  strategy: 'fixed',
  whileElementsMounted: autoUpdate,
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
  ]
})
watch(query, () => {
  active.value = -1
})
function select(animal: CatalogueAnimal) {
  const session = previewSession.value
  if (!session || !props.view.allowedActions.includes('search')) return
  session.animalIdentification = {
    kind: 'species',
    path: [...animal.path],
    speciesId: animal.id,
    ...(animal.path[0] ? { groupId: animal.path[0] } : {}),
    ...(animal.path[1] ? { categoryId: animal.path[1] } : {})
  }
  session.animalPath = [...animal.path]
  session.animalSpecies = animal.id
  if (animal.path[0]) session.animalGroup = animal.path[0]
  else delete session.animalGroup
  if (animal.path[1]) session.animalCategory = animal.path[1]
  else delete session.animalCategory
  session.identificationFailed = false
  session.adviceReady = false
  session.editingAnimal = false
  void router.push({ name: props.view.backTarget })
}
async function keydown(event: KeyboardEvent) {
  if (event.isComposing) return
  if (event.key === 'Escape') focused.value = false
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    focused.value = true
    const count = matches.value.length
    if (!count) return
    active.value =
      active.value < 0
        ? event.key === 'ArrowDown'
          ? 0
          : count - 1
        : (active.value + (event.key === 'ArrowDown' ? 1 : -1) + count) % count
    await nextTick()
    scrollActiveOption(results.value, active.value)
  }
  if (event.key === 'Enter' && open.value && matches.value[active.value]) {
    event.preventDefault()
    select(matches.value[active.value]!)
  }
}
function go(action: 'media' | 'manual') {
  if (!props.view.allowedActions.includes(action)) return
  if (previewSession.value) previewSession.value.editingAnimal = true
  void router.push({ name: action === 'media' ? props.view.mediaTarget : props.view.manualTarget })
}
</script>

<template lang="pug">
.customer-edit-animal(
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
  div(class="px-4 py-4")
    div(
      ref="anchor",
      class="flex min-h-11 items-center gap-2 rounded-control border border-primary bg-surface px-3 shadow-md focus-within:shadow-[0_0_0_2px_var(--color-primary-light)]"
    )
      base-icon(
        name="search",
        class="text-primary"
      )
      input(
        v-model="query",
        role="combobox",
        type="text",
        autocomplete="off",
        aria-autocomplete="list",
        :aria-expanded="open",
        :aria-controls="open ? id : undefined",
        :aria-activedescendant="open && active >= 0 ? id + '-' + active : undefined",
        :placeholder="view.copy.search",
        :aria-label="view.copy.search",
        :disabled="!view.allowedActions.includes('search')",
        class="w-full min-w-0 bg-transparent outline-none placeholder:text-muted",
        @focus="focused = true",
        @input="focused = true",
        @blur="focused = false",
        @keydown="keydown"
      )
    Transition(name="edit-results")
      ul(
        v-if="open",
        :id="id",
        ref="results",
        role="listbox",
        :aria-label="view.copy.results",
        :style="floatingStyles",
        class="z-30 flex flex-col gap-2 overflow-auto rounded-control bg-surface p-2 shadow-md"
      )
        li(
          v-for="(animal, index) in matches",
          :id="id + '-' + index",
          :key="animal.id",
          role="option",
          :aria-selected="index === active",
          :aria-label="animal.label",
          class="shrink-0 rounded-control px-3 py-2 transition-colors duration-150 hover:bg-canvas motion-reduce:transition-none",
          :class="{ 'bg-primary-light': index === active }",
          @mousedown.prevent,
          @click="select(animal)"
        )
          p(class="text-body-strong text-primary") {{ animal.label }}
          p(class="mt-1 text-small") {{ animal.detail }}
        li(
          v-if="!matches.length",
          role="status",
          class="p-3"
        ) {{ view.copy.empty }}
  div(class="sticky bottom-0 z-20 mt-auto flex flex-col gap-4 bg-canvas p-4 pb-[max(1rem,env(safe-area-inset-bottom))]")
    div(
      aria-hidden="true",
      class="pointer-events-none absolute inset-x-0 bottom-full h-6 bg-linear-to-b from-transparent to-canvas"
    )
    button(
      type="button",
      :disabled="!view.allowedActions.includes('media')",
      class="ui-button w-full rounded-control bg-primary-gradient p-4 text-button text-white shadow-brand",
      @click="go('media')"
    ) {{ view.copy.media }}
    button(
      type="button",
      :disabled="!view.allowedActions.includes('manual')",
      class="ui-button w-full rounded-control border border-primary bg-surface p-4 text-button text-primary",
      @click="go('manual')"
    ) {{ view.copy.manual }}
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .edit-results-enter-active,
  .edit-results-leave-active {
    transition: opacity 150ms ease;
  }
  .edit-results-enter-from,
  .edit-results-leave-to {
    opacity: 0;
  }
}
.edit-results-leave-active {
  pointer-events: none;
}
</style>
