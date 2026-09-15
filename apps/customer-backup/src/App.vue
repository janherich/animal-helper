<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import { t } from "@animal-helper/i18n";

import AppHeader from "./components/AppHeader.vue";
import { snapshotState } from "./runtime.js";

const route = useRoute();
const isDesigned = computed(
  () =>
    route.name === "situation" ||
    route.name === "location" ||
    route.name === "photo" ||
    route.name === "details",
);

const durabilityLabel = computed(() => {
  const value = snapshotState.value;
  return value === undefined
    ? undefined
    : t(`customer.durability.${value.durability}`);
});
</script>

<template>
  <div class="app" :class="{ walk: !isDesigned }">
    <AppHeader />
    <p v-if="durabilityLabel && !isDesigned" class="durability">
      {{ durabilityLabel }}
    </p>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
:root {
  --color-white: #ffffff;
  --color-divider: #e2e5e6;
  --color-accent: #3c64b1;
  --color-muted: #6c7476;
  --color-body: #373f41;
  --color-footer: #f4f5f4;
  --color-social: #e9ebef;
  --font-sans: Inter, system-ui, sans-serif;
  --font-logo: Lato, Inter, system-ui, sans-serif;
  --font-button: Mulish, Inter, system-ui, sans-serif;
  color: var(--color-body);
  font-family: var(--font-sans);
  line-height: 1.5;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--color-white);
}

button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.app {
  box-sizing: border-box;
  max-width: 402px;
  min-height: 100vh;
  margin: 0 auto;
  background: var(--color-white);
}

.walk main {
  padding: 1.25rem 16px 2rem;
}

.walk form,
.walk section {
  display: grid;
  gap: 0.75rem;
}

.durability,
.muted {
  margin: 0 16px;
  color: var(--color-muted);
}

.walk .durability {
  margin: 0.75rem 16px 0;
}

.walk .error,
.walk .muted {
  margin: 0;
}

.error {
  color: #8a1f1f;
}

.advice {
  display: grid;
  gap: 0.35rem;
}

.advice.do_not {
  color: #8a1f1f;
  font-weight: 600;
}

.advice ul {
  margin: 0;
  padding-left: 1.25rem;
}

.walk label,
.walk fieldset {
  display: grid;
  gap: 0.35rem;
  border: 0;
  padding: 0;
  margin: 0;
}

.walk input[type="text"],
.walk input[type="tel"],
.walk input[type="email"],
.walk select {
  padding: 0.6rem 0.7rem;
  font: inherit;
}

.walk button {
  justify-self: start;
  padding: 0.65rem 0.9rem;
  font: inherit;
}
</style>
