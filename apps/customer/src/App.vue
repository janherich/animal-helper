<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

import { t } from "@animal-helper/i18n";

import { resetCustomerRuntime, snapshotState } from "./runtime.js";
import { CUSTOMER_PATHS } from "./walk.js";

const router = useRouter();

const durabilityLabel = computed(() => {
  const value = snapshotState.value;
  return value === undefined
    ? undefined
    : t(`customer.durability.${value.durability}`);
});

const startOver = async () => {
  await resetCustomerRuntime();
  await router.push(CUSTOMER_PATHS.situation);
};
</script>

<template>
  <div class="shell">
    <header>
      <p>{{ t("customer.appName") }}</p>
      <p v-if="durabilityLabel" class="durability">{{ durabilityLabel }}</p>
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      <button type="button" @click="startOver">
        {{ t("customer.startOver") }}
      </button>
    </footer>
  </div>
</template>

<style>
:root {
  color: #122017;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

body {
  margin: 0;
  background: #f4f1ea;
}

.shell {
  box-sizing: border-box;
  max-width: 36rem;
  min-height: 100vh;
  margin: 0 auto;
  padding: 1.25rem;
}

header,
form,
section {
  display: grid;
  gap: 0.75rem;
}

.durability,
.error {
  margin: 0;
}

.error {
  color: #8a1f1f;
}

label,
fieldset {
  display: grid;
  gap: 0.35rem;
  border: 0;
  padding: 0;
  margin: 0;
}

input[type="text"],
input[type="tel"],
input[type="email"] {
  padding: 0.6rem 0.7rem;
  font: inherit;
}

button {
  justify-self: start;
  padding: 0.65rem 0.9rem;
  font: inherit;
}

footer {
  margin-top: 2rem;
}
</style>
