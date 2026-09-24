<script setup lang="ts">
withDefaults(defineProps<{ state?: boolean; id?: string }>(), { state: false })
</script>

<template lang="pug">
.base-expander(
  :id="id",
  :class="{ 'is-open': state }",
  :inert="state ? undefined : true",
  :aria-hidden="!state"
)
  .base-expander__content(class="min-h-0 overflow-hidden")
    slot
</template>

<style scoped>
.base-expander {
  display: grid;
  grid-template-rows: minmax(0, 0fr);
  opacity: 0;
}
.base-expander.is-open {
  grid-template-rows: minmax(0, 1fr);
  opacity: 1;
}
@media (prefers-reduced-motion: no-preference) {
  .base-expander {
    transition:
      grid-template-rows 280ms ease-out,
      opacity 200ms ease-out;
  }
}
</style>
