<script setup lang="ts">
import { computed } from "vue";

import { t } from "@animal-helper/i18n";

import { currentSnapshot } from "../runtime.js";

const snapshot = computed(() => currentSnapshot());
const status = computed(() => snapshot.value?.publicState ?? "draft");
</script>

<template>
  <section>
    <h1>{{ t("customer.thanks.title") }}</h1>
    <p>{{ t("customer.thanks.status") }}: {{ status }}</p>
  </section>
</template>
