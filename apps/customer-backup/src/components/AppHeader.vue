<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { t } from "@animal-helper/i18n";

import { resetCustomerRuntime, snapshotState } from "../runtime.js";
import { CUSTOMER_PATHS } from "../walk.js";

const router = useRouter();
const menuOpen = ref(false);
const hasDraft = computed(() => snapshotState.value !== undefined);

const startOver = async () => {
  menuOpen.value = false;
  await resetCustomerRuntime();
  await router.push(CUSTOMER_PATHS.situation);
};
</script>

<template>
  <header class="app-header">
    <p class="logo">{{ t("customer.chrome.logo") }}</p>
    <button
      type="button"
      class="menu-toggle"
      :aria-expanded="menuOpen"
      aria-controls="app-menu"
      @click="menuOpen = !menuOpen"
    >
      <span class="visually-hidden">{{ t("customer.chrome.menu") }}</span>
      <span class="menu-bar"></span>
      <span class="menu-bar"></span>
      <span class="menu-bar"></span>
    </button>
    <nav
      v-if="menuOpen"
      id="app-menu"
      class="menu"
      :aria-label="t('customer.chrome.menu')"
    >
      <a href="#situation-faq" @click="menuOpen = false">
        {{ t("customer.chrome.faq") }}
      </a>
      <a href="#situation-contact" @click="menuOpen = false">
        {{ t("customer.chrome.contact") }}
      </a>
      <a href="#situation-legal" @click="menuOpen = false">
        {{ t("customer.chrome.legal") }}
      </a>
      <button v-if="hasDraft" type="button" @click="startOver">
        {{ t("customer.startOver") }}
      </button>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  height: 72px;
  padding: 0 16px;
  background: var(--color-white);
  border-bottom: 1px solid var(--color-divider);
}

.logo {
  margin: 0;
  width: 69px;
  color: var(--color-accent);
  font-family: var(--font-logo);
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.2px;
  line-height: 32px;
}

.menu-toggle {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 47px;
  padding: 0;
  border: 0;
  border-radius: 0;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.menu-bar {
  display: block;
  width: 47px;
  height: 4px;
  border-radius: 4px;
  background: #808080;
}

.menu {
  position: absolute;
  z-index: 2;
  top: 72px;
  right: 0;
  left: 0;
  display: grid;
  gap: 4px;
  padding: 12px 16px 16px;
  background: var(--color-white);
  border-bottom: 1px solid var(--color-divider);
}

.menu a,
.menu button {
  display: block;
  width: 100%;
  padding: 12px 0;
  border: 0;
  background: transparent;
  color: var(--color-body);
  font: inherit;
  font-family: var(--font-button);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.1px;
  line-height: 22.5px;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
</style>
