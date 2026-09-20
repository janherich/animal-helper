<script setup lang="ts">
withDefaults(defineProps<{ as?: 'div' | 'footer' }>(), { as: 'footer' })
</script>

<template lang="pug">
component(
  :is="as",
  class="sticky bottom-0 z-20 mt-auto bg-canvas p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
)
  div(
    aria-hidden="true",
    class="pointer-events-none absolute inset-x-0 bottom-full h-6 bg-linear-to-b from-transparent to-canvas"
  )
  slot
</template>
