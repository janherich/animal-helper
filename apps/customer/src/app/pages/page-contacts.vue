<script setup lang="ts">
import PageInstructions from './page-instructions.vue'
import type { ContactsView } from './fixtures/contacts'
defineProps<{ view: ContactsView }>()
</script>

<template lang="pug">
PageInstructions(:view="view")
</template>
