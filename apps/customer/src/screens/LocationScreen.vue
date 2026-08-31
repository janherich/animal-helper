<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import { t } from "@animal-helper/i18n";

import { customerSession, rememberSnapshot } from "../runtime.js";
import {
  CUSTOMER_PATHS,
  confirmLocation,
  defaultLocationPayload,
} from "../walk.js";

const router = useRouter();
const address = ref(defaultLocationPayload().address);
const error = ref<string | undefined>(undefined);
const pending = ref(false);

const continueWalk = async () => {
  pending.value = true;
  error.value = undefined;
  const result = await confirmLocation(customerSession(), {
    schemaVersion: 1,
    address: address.value.trim(),
  });
  pending.value = false;
  if (!result.ok) {
    error.value = result.error.code;
    return;
  }

  rememberSnapshot(result.value);
  await router.push(CUSTOMER_PATHS.details);
};
</script>

<template>
  <form @submit.prevent="continueWalk">
    <h1>{{ t("customer.location.title") }}</h1>
    <label>
      {{ t("customer.location.address") }}
      <input v-model="address" type="text" required maxlength="500" />
    </label>
    <p v-if="error" class="error">{{ t("customer.error") }}: {{ error }}</p>
    <button type="submit" :disabled="pending">
      {{ t("customer.location.confirm") }}
    </button>
  </form>
</template>
