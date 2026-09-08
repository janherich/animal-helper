<script setup lang="ts">
import { useRouter } from "vue-router";

import { t } from "@animal-helper/i18n";

import {
  clearOperator,
  currentEnvironment,
  currentOperator,
} from "./runtime.js";
import { signOutOperator } from "./session.js";

const router = useRouter();
const operator = currentOperator;
const environment = currentEnvironment;

const signOut = async () => {
  try {
    await signOutOperator();
  } finally {
    clearOperator();
    await router.push({ name: "login" });
  }
};
</script>

<template>
  <div class="shell">
    <header>
      <p>{{ t("backoffice.appName") }}</p>
      <nav v-if="operator" class="nav">
        <RouterLink :to="{ name: 'queue' }">
          {{ t("backoffice.nav.queue") }}
        </RouterLink>
        <RouterLink :to="{ name: 'guidance' }">
          {{ t("backoffice.nav.guidance") }}
        </RouterLink>
      </nav>
      <p v-if="operator" class="operator">
        <span>{{ environment }}</span>
        <span>{{ operator.email }}</span>
        <button type="button" @click="signOut">
          {{ t("backoffice.signOut") }}
        </button>
      </p>
    </header>
    <main>
      <router-view />
    </main>
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
  max-width: 72rem;
  min-height: 100vh;
  margin: 0 auto;
  padding: 1.25rem;
}

header,
section,
form {
  display: grid;
  gap: 0.75rem;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.nav a {
  color: inherit;
}

.nav a.router-link-active {
  font-weight: 600;
}

fieldset {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  border: 0;
  padding: 0;
  margin: 0;
}

label {
  display: grid;
  gap: 0.35rem;
}

input[type="search"],
select,
textarea,
input[type="text"] {
  padding: 0.6rem 0.7rem;
  font: inherit;
}

textarea {
  min-height: 6rem;
  resize: vertical;
}

.editor,
.cell,
.preview-copy {
  display: grid;
  gap: 0.75rem;
}

.cell {
  border: 1px solid #d7d1c4;
  padding: 0.75rem;
}

.cell legend {
  font-weight: 600;
}

.table-wrap {
  overflow-x: auto;
}

tr.selected {
  background: #e4eee6;
}

tbody tr {
  cursor: pointer;
}

.detail {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #d7d1c4;
}

.walk {
  display: grid;
  gap: 0.35rem;
  padding-left: 1.25rem;
}

.walk .current {
  font-weight: 600;
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.operator,
.error,
.muted {
  margin: 0;
}

.operator {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.error {
  color: #8a1f1f;
}

.muted {
  color: #4d5b52;
}

button {
  justify-self: start;
  padding: 0.65rem 0.9rem;
  font: inherit;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 0.5rem 0.35rem;
  border-bottom: 1px solid #d7d1c4;
}

code {
  font-size: 0.85em;
}
</style>
