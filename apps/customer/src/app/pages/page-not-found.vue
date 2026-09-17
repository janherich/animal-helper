<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
<template lang="pug">
.page-not-found(class="space-y-4 p-6")
  h1(class="text-2xl font-semibold") Stránka sa nenašla
  RouterLink(
    class="text-primary underline",
    to="/"
  ) Späť na úvod
</template>
