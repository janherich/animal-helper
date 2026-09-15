<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { t } from "@animal-helper/i18n";

import checkIcon from "../assets/details/check.svg";
import editIcon from "../assets/details/edit.svg";
import WalkProgress from "../components/WalkProgress.vue";
import {
  DETAILS_WALK_STEP,
  OTHER_TEXT_MAX,
  detailsCanContinue,
  groupedInjuredKinds,
  kindByKey,
  shouldAskConscious,
  shouldAskJuvenile,
  symptomChoices,
  ternaryChoices,
  toggleSymptom,
  type ConditionSymptom,
  type ConditionTernary,
} from "../details.js";
import { continueWalkTo } from "../navigation.js";
import { PHOTO_PATH } from "../photo.js";
import {
  currentKindKey,
  currentSituationType,
  customerSession,
  patchWalkFacts,
  rememberSnapshot,
  setKindKey,
} from "../runtime.js";
import { CUSTOMER_PATHS, confirmDetails } from "../walk.js";

const router = useRouter();
const situationType = currentSituationType();
const kindKey = ref(currentKindKey() ?? "");
const editingKind = ref(kindKey.value === "");
const symptoms = ref<ConditionSymptom[]>([]);
const otherText = ref("");
const conscious = ref<ConditionTernary | undefined>(undefined);
const isJuvenile = ref<ConditionTernary | undefined>(undefined);
const error = ref<string | undefined>(undefined);
const pending = ref(false);

const injuredGroups = groupedInjuredKinds();
const selectedKind = computed(() => kindByKey(kindKey.value));
const askConscious = computed(() =>
  shouldAskConscious(situationType, selectedKind.value),
);
const askJuvenile = computed(() =>
  shouldAskJuvenile(situationType, selectedKind.value),
);
const hasOther = computed(() => symptoms.value.includes("other"));

const goBack = async () => {
  await router.push(PHOTO_PATH);
};

const chooseKind = (key: string) => {
  kindKey.value = key;
  editingKind.value = false;
  error.value = undefined;
  setKindKey(key);
  const kind = kindByKey(key);
  if (!shouldAskJuvenile(situationType, kind)) {
    isJuvenile.value = undefined;
  }
  if (!shouldAskConscious(situationType, kind)) {
    conscious.value = undefined;
  }
};

const onSymptom = (key: ConditionSymptom) => {
  symptoms.value = toggleSymptom(symptoms.value, key);
};

const continueWalk = async () => {
  const kind = situationType === "injured" ? selectedKind.value : undefined;
  if (situationType === "injured" && kind === undefined) {
    error.value = t("customer.details.kindRequired");
    return;
  }
  if (
    !detailsCanContinue(situationType, kind, symptoms.value, otherText.value)
  ) {
    error.value = t("customer.details.otherRequired");
    return;
  }

  pending.value = true;
  error.value = undefined;
  setKindKey(kind?.key);
  const result = await confirmDetails(customerSession(), situationType, kind, {
    symptoms: symptoms.value,
    otherText: otherText.value,
    ...(askConscious.value && conscious.value !== undefined
      ? { conscious: conscious.value }
      : {}),
    ...(askJuvenile.value && isJuvenile.value !== undefined
      ? { isJuvenile: isJuvenile.value }
      : {}),
  });
  pending.value = false;
  if (!result.ok) {
    error.value = `${t("customer.error")}: ${result.error.code}`;
    return;
  }

  rememberSnapshot(result.value);
  patchWalkFacts({
    hasFormSnapshot: true,
    situationType,
    ...(kind === undefined ? {} : { kindKey: kind.key }),
  });
  const continued = await continueWalkTo(router, CUSTOMER_PATHS.details);
  if (!continued) {
    error.value = t("customer.error");
  }
};
</script>

<template>
  <form class="details" @submit.prevent="continueWalk">
    <div class="body">
      <div class="chrome">
        <WalkProgress :current="DETAILS_WALK_STEP" />
        <button type="button" class="back" @click="goBack">
          {{ t("customer.details.back") }}
        </button>
      </div>

      <div class="intro">
        <h1>{{ t("customer.details.title") }}</h1>
        <p class="help">{{ t("customer.details.help") }}</p>
      </div>

      <div class="content">
        <section v-if="situationType === 'injured'" class="kind">
          <h2>{{ t("customer.details.kind") }}</h2>
          <div class="kind-row">
            <p class="kind-label">
              {{ selectedKind?.labelSk ?? t("customer.details.kindEmpty") }}
            </p>
            <button
              type="button"
              class="edit"
              :aria-expanded="editingKind"
              @click="editingKind = !editingKind"
            >
              <span class="edit-icon">
                <img :src="editIcon" alt="" width="18" height="18" />
              </span>
              {{ t("customer.details.edit") }}
            </button>
          </div>
          <div v-if="editingKind" class="kind-list">
            <section
              v-for="group in injuredGroups"
              :key="group.key"
              class="kind-group"
            >
              <h3>{{ t(`catalog.group.${group.key}`) }}</h3>
              <button
                v-for="kind in group.kinds"
                :key="kind.key"
                type="button"
                class="kind-option"
                :class="{ selected: kind.key === kindKey }"
                @click="chooseKind(kind.key)"
              >
                {{ kind.labelSk }}
              </button>
            </section>
          </div>
        </section>

        <hr v-if="situationType === 'injured'" />

        <section class="situation">
          <h2>{{ t("customer.details.situation") }}</h2>

          <fieldset>
            <legend>{{ t("customer.details.symptoms") }}</legend>
            <div class="symptom-grid">
              <label v-for="key in symptomChoices" :key="key" class="choice">
                <input
                  type="checkbox"
                  class="visually-hidden"
                  :checked="symptoms.includes(key)"
                  @change="onSymptom(key)"
                />
                <span
                  class="box"
                  :class="{ checked: symptoms.includes(key) }"
                  aria-hidden="true"
                >
                  <img
                    v-if="symptoms.includes(key)"
                    class="check"
                    :src="checkIcon"
                    alt=""
                    width="11"
                    height="8"
                  />
                </span>
                <span>{{ t(`customer.details.symptom.${key}`) }}</span>
              </label>
            </div>
            <label class="choice other-choice">
              <input
                type="checkbox"
                class="visually-hidden"
                :checked="hasOther"
                @change="onSymptom('other')"
              />
              <span
                class="box"
                :class="{ checked: hasOther }"
                aria-hidden="true"
              >
                <img
                  v-if="hasOther"
                  class="check"
                  :src="checkIcon"
                  alt=""
                  width="11"
                  height="8"
                />
              </span>
              <span>{{ t("customer.details.symptom.other") }}</span>
            </label>
            <div v-if="hasOther" class="other-text">
              <textarea
                v-model="otherText"
                :maxlength="OTHER_TEXT_MAX"
                :placeholder="t('customer.details.otherPlaceholder')"
              ></textarea>
            </div>
          </fieldset>

          <fieldset v-if="askConscious">
            <legend>{{ t("customer.details.conscious") }}</legend>
            <label
              v-for="option in ternaryChoices"
              :key="option"
              class="choice"
            >
              <input
                type="radio"
                class="visually-hidden"
                name="conscious"
                :value="option"
                :checked="conscious === option"
                @change="conscious = option"
              />
              <span
                class="radio"
                :class="{ selected: conscious === option }"
                aria-hidden="true"
              ></span>
              <span>{{ t(`customer.details.ternary.${option}`) }}</span>
            </label>
          </fieldset>

          <fieldset v-if="askJuvenile">
            <legend>{{ t("customer.details.juvenile") }}</legend>
            <label
              v-for="option in ternaryChoices"
              :key="option"
              class="choice"
            >
              <input
                type="radio"
                class="visually-hidden"
                name="juvenile"
                :value="option"
                :checked="isJuvenile === option"
                @change="isJuvenile = option"
              />
              <span
                class="radio"
                :class="{ selected: isJuvenile === option }"
                aria-hidden="true"
              ></span>
              <span>{{ t(`customer.details.ternary.${option}`) }}</span>
            </label>
          </fieldset>
        </section>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <div class="footer">
      <button type="submit" class="btn" :disabled="pending">
        {{ t("customer.details.continue") }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.details {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 72px);
}

.body {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  gap: 24px;
  padding: 16px 16px 88px;
}

.chrome {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.back {
  align-self: flex-start;
  padding: 0;
  border: 0;
  border-radius: 0;
  appearance: none;
  background: transparent;
  color: var(--color-muted);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  cursor: pointer;
}

.intro {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

h1 {
  margin: 0;
  color: #000;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.24px;
  line-height: 34px;
}

.help {
  margin: 0;
  color: var(--color-muted);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

h2 {
  margin: 0;
  color: var(--color-body);
  font-family: var(--font-button);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.1px;
  line-height: 24px;
}

.kind {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.kind-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.kind-label {
  margin: 0;
  color: var(--color-body);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.1px;
  line-height: 20px;
}

.edit {
  display: flex;
  gap: 8px;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border: 0;
  border-radius: 0;
  appearance: none;
  background: transparent;
  color: var(--color-accent);
  font-family: var(--font-button);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
  line-height: 18px;
  cursor: pointer;
}

.edit-icon {
  position: relative;
  width: 16.524px;
  height: 16.524px;
  flex-shrink: 0;
}

.edit-icon img {
  position: absolute;
  inset: -4.54%;
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
}

.kind-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 280px;
  overflow: auto;
  padding: 8px 0;
  border-top: 1px solid var(--color-divider);
}

.kind-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kind-group h3 {
  margin: 0;
  color: var(--color-muted);
  font-family: var(--font-button);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;
  line-height: 16px;
}

.kind-option {
  padding: 8px 0;
  border: 0;
  border-radius: 0;
  appearance: none;
  background: transparent;
  color: var(--color-body);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.1px;
  line-height: 20px;
  text-align: left;
  cursor: pointer;
}

.kind-option.selected {
  color: var(--color-accent);
  font-weight: 600;
}

hr {
  width: 100%;
  margin: 0;
  border: 0;
  border-top: 1px solid var(--color-divider);
}

.situation {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

fieldset {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  border: 0;
}

legend {
  padding: 0;
  color: var(--color-body);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.symptom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 12px;
  row-gap: 16px;
}

.choice {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 20px;
  color: var(--color-body);
  font-family: var(--font-button);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.2px;
  line-height: 18px;
  cursor: pointer;
}

.other-choice {
  width: fit-content;
}

.box,
.radio {
  position: relative;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  background: var(--color-white);
}

.box {
  border: 2px solid #c3cbcd;
}

.box.checked {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.check {
  position: absolute;
  top: 50%;
  left: 50%;
  display: block;
  width: 11.333px;
  height: 8.417px;
  transform: translate(-50%, -50%);
}

.radio {
  border: 2px solid #c3cbcd;
  border-radius: 100px;
}

.radio.selected {
  border-color: var(--color-accent);
}

.radio.selected::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 10px;
  height: 10px;
  border-radius: 10px;
  background: var(--color-accent);
}

.other-text {
  padding-left: 24px;
}

textarea {
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: 122px;
  padding: 11px 16px;
  border: 0;
  border-radius: 0;
  appearance: none;
  background: var(--color-footer);
  color: var(--color-body);
  font-family: var(--font-button);
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.2px;
  line-height: 20px;
  resize: vertical;
}

textarea::placeholder {
  color: var(--color-muted);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.error {
  margin: 0;
  color: #8a1f1f;
}

.footer {
  position: sticky;
  bottom: 0;
  padding: 12px 16px;
  background: var(--color-white);
}

.btn {
  width: 100%;
  height: 48px;
  padding: 0 18px;
  border: 0;
  border-radius: 0;
  appearance: none;
  background: var(--color-accent);
  color: var(--color-white);
  font-family: var(--font-button);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
  line-height: 18px;
  cursor: pointer;
}

.btn:disabled {
  cursor: wait;
  opacity: 0.7;
}
</style>
