<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import type { ContactPayloadV1 } from "@animal-helper/contracts";
import { t } from "@animal-helper/i18n";

import { customerSession, rememberSnapshot } from "../runtime.js";
import { CUSTOMER_PATHS, submitReport } from "../walk.js";

const router = useRouter();
const name = ref("");
const phone = ref("");
const email = ref("");
const shareWithAuthorities = ref(false);
const newsletter = ref(false);
const error = ref<string | undefined>(undefined);
const pending = ref(false);

const contactPayload = (): ContactPayloadV1 => ({
  schemaVersion: 1,
  shareWithAuthorities: shareWithAuthorities.value,
  newsletter: newsletter.value,
  ...(name.value.trim() === "" ? {} : { name: name.value.trim() }),
  ...(phone.value.trim() === "" ? {} : { phone: phone.value.trim() }),
  ...(email.value.trim() === "" ? {} : { email: email.value.trim() }),
});

const continueWalk = async () => {
  pending.value = true;
  error.value = undefined;
  const result = await submitReport(customerSession(), contactPayload());
  pending.value = false;
  if (!result.ok) {
    error.value = result.error.code;
    return;
  }

  rememberSnapshot(result.value);
  await router.push(CUSTOMER_PATHS.thanks);
};
</script>

<template>
  <form @submit.prevent="continueWalk">
    <h1>{{ t("customer.contact.title") }}</h1>
    <label>
      {{ t("customer.contact.name") }}
      <input v-model="name" type="text" maxlength="200" autocomplete="name" />
    </label>
    <label>
      {{ t("customer.contact.phone") }}
      <input v-model="phone" type="tel" maxlength="32" autocomplete="tel" />
    </label>
    <label>
      {{ t("customer.contact.email") }}
      <input
        v-model="email"
        type="email"
        maxlength="320"
        autocomplete="email"
      />
    </label>
    <label>
      <input v-model="shareWithAuthorities" type="checkbox" />
      {{ t("customer.contact.shareWithAuthorities") }}
    </label>
    <label>
      <input v-model="newsletter" type="checkbox" />
      {{ t("customer.contact.newsletter") }}
    </label>
    <p v-if="error" class="error">{{ t("customer.error") }}: {{ error }}</p>
    <button type="submit" :disabled="pending">
      {{ t("customer.contact.submit") }}
    </button>
  </form>
</template>
