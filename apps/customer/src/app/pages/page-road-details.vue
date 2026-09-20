<script setup lang="ts">
import PageAnimalDetails from './page-animal-details.vue'
import { roadDetailsFixture } from './fixtures/other-situations'
import { animalGroupsFixture } from './fixtures/animal-groups'
</script>
<template lang="pug">
PageAnimalDetails(
  answer-scope="roadDetails",
  :view="roadDetailsFixture",
  :catalogue="animalGroupsFixture.root"
)
</template>
