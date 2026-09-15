<script setup lang="ts">
defineProps<{ name: string; label?: string }>()
</script>

<template lang="pug">
svg.base-icon(
  class="inline-block size-6 shrink-0 align-middle",
  :aria-hidden="label ? undefined : true",
  :aria-label="label",
  :role="label ? 'img' : undefined",
  focusable="false"
)
  use(:href="`#icon-${name}`")
</template>
