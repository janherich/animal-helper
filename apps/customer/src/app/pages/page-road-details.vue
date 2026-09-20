<script setup lang="ts">
import PageAnimalDetails from './page-animal-details.vue'
import type { AnimalDetailsView } from '../contracts/forms'
import type { AnimalBranch } from './fixtures/animal-groups'
defineProps<{ view: AnimalDetailsView; catalogue: AnimalBranch }>()
</script>
<template lang="pug">
PageAnimalDetails(
  answer-scope="roadDetails",
  :view="view",
  :catalogue="catalogue"
)
</template>
