<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { notFoundFixture as view } from './fixtures/not-found'
</script>
<template lang="pug">
.page-not-found(
  class="space-y-4 p-6",
  :lang="view.locale"
)
  h1(class="text-2xl font-semibold") {{ view.title }}
  RouterLink(
    class="text-primary underline",
    :to="view.backTarget"
  ) {{ view.back }}
</template>
