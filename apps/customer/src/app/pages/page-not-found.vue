<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
<template lang="pug">
main.page-not-found(class="mx-auto max-w-xl space-y-4 p-6")
  h1(class="text-2xl font-semibold") Stránka sa nenašla
  RouterLink(
    class="text-blue-700 underline",
    to="/"
  ) Späť na úvod
</template>
