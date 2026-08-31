<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import { t } from "@animal-helper/i18n";

import {
  currentSituationType,
  customerSession,
  rememberSnapshot,
  setSituationType,
} from "../runtime.js";
import {
  CUSTOMER_PATHS,
  confirmSituation,
  type SituationType,
} from "../walk.js";

const router = useRouter();
const situationType = ref<SituationType>(currentSituationType());
const error = ref<string | undefined>(undefined);
const pending = ref(false);

const continueWalk = async () => {
  pending.value = true;
  error.value = undefined;
  setSituationType(situationType.value);
  const result = await confirmSituation(customerSession());
  pending.value = false;
  if (!result.ok) {
    error.value = result.error.code;
    return;
  }

  rememberSnapshot(result.value);
  await router.push(CUSTOMER_PATHS.location);
};
</script>

<template>
  <form @submit.prevent="continueWalk">
    <h1>{{ t("customer.situation.title") }}</h1>
    <fieldset>
      <label>
        <input v-model="situationType" type="radio" value="injured" />
        {{ t("customer.situation.injured") }}
      </label>
      <label>
        <input v-model="situationType" type="radio" value="stray" />
        {{ t("customer.situation.stray") }}
      </label>
    </fieldset>
    <p v-if="error" class="error">{{ t("customer.error") }}: {{ error }}</p>
    <button type="submit" :disabled="pending">
      {{ t("customer.situation.continue") }}
    </button>
  </form>
</template>
