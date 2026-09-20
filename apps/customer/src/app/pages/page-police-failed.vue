<script setup lang="ts">
import PageCrueltyFollowup from './page-cruelty-followup.vue'
import type { CrueltyFollowupView } from './fixtures/cruelty-followup'
defineProps<{ view: CrueltyFollowupView }>()
</script>
<template lang="pug">
PageCrueltyFollowup(:view="view")
</template>
