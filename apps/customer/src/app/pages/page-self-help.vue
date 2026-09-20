<script setup lang="ts">
import PageInstructions from './page-instructions.vue'
import type { SelfHelpView } from './fixtures/self-help'
defineProps<{ view: SelfHelpView }>()
</script>

<template lang="pug">
PageInstructions(:view="view")
</template>
