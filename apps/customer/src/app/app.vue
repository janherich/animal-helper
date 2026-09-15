<script setup lang="ts">
import { RouterView } from 'vue-router'
import { usePageScrollbars } from '@/plugins/overlay-scrollbars'
usePageScrollbars()
</script>
<template lang="pug">
.customer-app(class="min-h-dvh")
  RouterView
</template>
