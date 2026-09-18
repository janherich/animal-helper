<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { AdviceView } from './fixtures/advice'
const props = defineProps<{ view: AdviceView }>()
const router = useRouter()
const acknowledged = ref(false)
const variants = {
  avoid: { container: 'border-danger bg-danger-light', heading: 'text-danger', icon: 'attention' },
  do: { container: 'border-success bg-success-light', heading: 'text-success', icon: 'info' }
}
function acknowledge() {
  if (props.view.allowedActions.includes('acknowledge')) acknowledged.value = true
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
      class="mb-4 flex min-h-11 items-center gap-1 text-heading-2 text-primary",
      :disabled="!view.allowedActions.includes('back')",
      @click="router.push({ name: view.backTarget })"
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
  p(class="px-4 pt-2 text-center text-small text-primary") {{ view.copy.preview }}
  .customer-advice__blocks(class="flex flex-col gap-4 p-4")
    section(
      v-for="block in view.blocks",
      :key="block.id",
      :aria-labelledby="'advice-' + block.id",
      class="overflow-hidden rounded-control border py-1",
      :class="[variants[block.kind].container, 'customer-advice__' + block.kind]"
    )
      div(
        class="flex items-center gap-2 px-4 pt-3 pb-2",
        :class="variants[block.kind].heading"
      )
        base-icon(:name="variants[block.kind].icon")
        h2(
          :id="'advice-' + block.id",
          class="min-w-0 text-heading-3"
        ) {{ block.title }}
      ol(class="flex list-none flex-col gap-1 px-5 pb-2")
        li(
          v-for="(item, index) in block.items",
          :key="item.id",
          class="py-1"
        )
          h3(class="flex gap-1 text-heading-3")
            span(aria-hidden="true") {{ index + 1 }}.
            span {{ item.title }}
          p(
            v-if="item.description",
            class="mt-1"
          ) {{ item.description }}
  div(class="sticky bottom-0 z-20 mt-auto bg-canvas p-4 pb-[max(1rem,env(safe-area-inset-bottom))]")
    div(
      aria-hidden="true",
      class="pointer-events-none absolute inset-x-0 bottom-full h-6 bg-linear-to-b from-transparent to-canvas"
    )
    button(
      type="button",
      class="w-full rounded-control bg-primary-gradient p-4 text-button text-white shadow-brand disabled:opacity-40",
      :disabled="!view.allowedActions.includes('acknowledge')",
      @click="acknowledge"
    ) {{ view.copy.acknowledge }}
    p(
      v-if="acknowledged",
      role="status",
      class="mt-3 text-center text-primary"
    ) {{ view.copy.acknowledged }}
</template>
