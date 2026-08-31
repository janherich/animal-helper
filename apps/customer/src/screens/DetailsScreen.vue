<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import { t } from "@animal-helper/i18n";

import {
  currentSituationType,
  customerSession,
  rememberSnapshot,
} from "../runtime.js";
import { CUSTOMER_PATHS, confirmDetails } from "../walk.js";

const router = useRouter();
const error = ref<string | undefined>(undefined);
const pending = ref(false);

const continueWalk = async () => {
  pending.value = true;
  error.value = undefined;
  const result = await confirmDetails(
    customerSession(),
    currentSituationType(),
  );
  pending.value = false;
  if (!result.ok) {
    error.value = result.error.code;
    return;
  }

  rememberSnapshot(result.value);
  await router.push(CUSTOMER_PATHS.contact);
};
</script>

<template>
  <form @submit.prevent="continueWalk">
    <h1>{{ t("customer.details.title") }}</h1>
    <p>{{ t("customer.details.photoSkipped") }}</p>
    <p v-if="error" class="error">{{ t("customer.error") }}: {{ error }}</p>
    <button type="submit" :disabled="pending">
      {{ t("customer.details.continue") }}
    </button>
  </form>
</template>
