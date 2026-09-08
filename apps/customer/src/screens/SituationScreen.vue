<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { t } from "@animal-helper/i18n";

import SiteFooter from "../components/SiteFooter.vue";
import { continueWalkTo } from "../navigation.js";
import {
  currentKindKey,
  currentSituationType,
  customerSession,
  rememberSnapshot,
  resetCustomerRuntime,
  setSituationType,
  snapshotState,
} from "../runtime.js";
import {
  draftProgressRatio,
  draftResumeFromPath,
  draftSummary,
  formatDraftStep,
  isWalkableSituation,
  situationChoices,
  type SituationChoiceKey,
} from "../situation.js";
import { CUSTOMER_PATHS, confirmSituation } from "../walk.js";

const router = useRouter();
const error = ref<string | undefined>(undefined);
const pending = ref(false);
const hasDraft = computed(() => snapshotState.value !== undefined);
const kindKey = computed(() => currentKindKey());
const progress = computed(() => draftProgressRatio(kindKey.value));

const chooseSituation = async (key: SituationChoiceKey) => {
  if (!isWalkableSituation(key)) {
    error.value = t("customer.situation.unavailable");
    return;
  }

  pending.value = true;
  error.value = undefined;
  setSituationType(key);
  const result = await confirmSituation(customerSession());
  pending.value = false;
  if (!result.ok) {
    error.value = `${t("customer.error")}: ${result.error.code}`;
    return;
  }

  rememberSnapshot(result.value);
  await continueWalkTo(router, CUSTOMER_PATHS.situation);
};

const resumeDraft = async () => {
  pending.value = true;
  error.value = undefined;
  const continued = await continueWalkTo(
    router,
    draftResumeFromPath(kindKey.value),
  );
  pending.value = false;
  if (!continued) {
    error.value = t("customer.error");
  }
};

const resetAndStay = async () => {
  pending.value = true;
  error.value = undefined;
  await resetCustomerRuntime();
  pending.value = false;
};
</script>

<template>
  <div class="situation">
    <div class="situation-body">
      <div class="intro">
        <h1>{{ t("customer.situation.title") }}</h1>
        <p class="help">{{ t("customer.situation.help") }}</p>
      </div>

      <section
        v-if="hasDraft"
        class="draft"
        :aria-label="t('customer.situation.draftTitle')"
      >
        <div class="draft-progress">
          <div class="track">
            <div class="fill" :style="{ width: `${progress * 100}%` }"></div>
          </div>
          <p class="step">{{ formatDraftStep(kindKey) }}</p>
        </div>
        <div class="draft-copy">
          <p class="draft-title">{{ t("customer.situation.draftTitle") }}</p>
          <p class="draft-summary">
            {{ draftSummary(currentSituationType(), kindKey) }}
          </p>
        </div>
        <div class="draft-actions">
          <button
            type="button"
            class="btn filled"
            :disabled="pending"
            @click="resumeDraft"
          >
            {{ t("customer.situation.continue") }}
          </button>
          <button
            type="button"
            class="btn accent-outline"
            :disabled="pending"
            @click="resetAndStay"
          >
            {{ t("customer.situation.draftResolved") }}
          </button>
        </div>
      </section>

      <div class="choices-block">
        <div class="choices">
          <button
            v-for="choice in situationChoices"
            :key="choice.key"
            type="button"
            class="btn"
            :class="choice.style"
            :disabled="pending"
            @click="chooseSituation(choice.key)"
          >
            {{ t(`customer.situation.${choice.key}`) }}
          </button>
        </div>
        <p class="anonymous">{{ t("customer.situation.anonymous") }}</p>
        <p v-if="error" class="error">{{ error }}</p>
      </div>
    </div>
    <SiteFooter />
  </div>
</template>

<style scoped>
.situation {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 72px);
}

.situation-body {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  gap: 24px;
  padding: 40px 16px 36px;
}

.choices-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.intro {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

h1 {
  margin: 0;
  color: #000;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.24px;
  line-height: 34px;
}

.help,
.anonymous,
.step,
.draft-summary {
  margin: 0;
  color: var(--color-muted);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.draft {
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  padding: 16px;
  background: #eff2f3;
  border: 1px solid var(--color-divider);
}

.track {
  height: 8px;
  overflow: hidden;
  border-radius: 4px;
  background: #d9d9d9;
}

.fill {
  height: 8px;
  border-radius: 4px;
  background: var(--color-accent);
}

.draft-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.draft-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.draft-title {
  margin: 0;
  color: #000;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.draft-actions,
.choices {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.choices {
  gap: 24px;
}

.btn {
  box-sizing: border-box;
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 0;
  appearance: none;
  background: var(--color-accent);
  color: var(--color-white);
  font-family: var(--font-button);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
  line-height: 21px;
  cursor: pointer;
}

.btn:disabled {
  cursor: wait;
  opacity: 0.7;
}

.btn.outlined {
  background: var(--color-white);
  border-color: var(--color-divider);
  color: var(--color-body);
}

.btn.accent-outline {
  background: var(--color-white);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.error {
  margin: 0;
  color: #8a1f1f;
}
</style>
