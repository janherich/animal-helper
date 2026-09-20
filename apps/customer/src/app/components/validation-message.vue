<script setup lang="ts">
defineProps<{ messages: string[]; id?: string; summary?: boolean }>()
</script>
<template lang="pug">
div(
  v-if="messages.length",
  :id="id",
  class="text-small text-danger",
  :class="summary ? 'rounded-control border border-danger bg-danger-light p-4' : 'mt-2'",
  aria-live="polite"
)
  p(
    v-for="(message, index) in messages",
    :key="index"
  ) {{ message }}
</template>
