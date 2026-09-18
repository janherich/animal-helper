<script setup lang="ts">
import { useId } from 'vue'
import type { AdviceBlock } from '../pages/fixtures/advice'
defineProps<{ blocks: AdviceBlock[] }>()
const prefix = useId()
const variants = {
  avoid: { container: 'border-danger bg-danger-light', heading: 'text-danger', icon: 'attention' },
  do: { container: 'border-success bg-success-light', heading: 'text-success', icon: 'info' }
}
</script>

<template lang="pug">
.customer-advice__blocks(class="flex flex-col gap-4 p-4")
  section(
    v-for="block in blocks",
    :key="block.id",
    :aria-labelledby="prefix + block.id",
    class="overflow-hidden rounded-control border py-1",
    :class="[variants[block.kind].container, 'customer-advice__' + block.kind]"
  )
    div(
      class="flex items-center gap-2 px-4 pt-3 pb-2",
      :class="variants[block.kind].heading"
    )
      base-icon(:name="variants[block.kind].icon")
      h2(
        :id="prefix + block.id",
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
</template>
