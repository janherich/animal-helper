<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import {
  findAnimalKind,
  groupKeys,
  kindsForSituation,
} from "@animal-helper/guidance";
import { t } from "@animal-helper/i18n";

import { continueWalkTo } from "../navigation.js";
import {
  currentKindKey,
  currentSituationType,
  customerSession,
  rememberSnapshot,
  setKindKey,
} from "../runtime.js";
import { CUSTOMER_PATHS, confirmDetails } from "../walk.js";

const router = useRouter();
const situationType = currentSituationType();
const kindKey = ref(currentKindKey() ?? "");
const error = ref<string | undefined>(undefined);
const pending = ref(false);

const injuredKinds = kindsForSituation("injured");
const injuredGroups = groupKeys
  .map((groupKey) => ({
    key: groupKey,
    kinds: injuredKinds.filter((kind) => kind.groupKey === groupKey),
  }))
  .filter((group) => group.kinds.length > 0);

const selectedKind = computed(() =>
  kindKey.value === "" ? undefined : findAnimalKind(kindKey.value),
);

const continueWalk = async () => {
  const kind = situationType === "injured" ? selectedKind.value : undefined;
  if (situationType === "injured" && kind === undefined) {
    error.value = t("customer.details.kindRequired");
    return;
  }

  pending.value = true;
  error.value = undefined;
  setKindKey(kind?.key);
  const result = await confirmDetails(customerSession(), situationType, kind);
  pending.value = false;
  if (!result.ok) {
    error.value = result.error.code;
    return;
  }

  rememberSnapshot(result.value);
  await continueWalkTo(router, CUSTOMER_PATHS.details);
};
</script>

<template>
  <form @submit.prevent="continueWalk">
    <h1>{{ t("customer.details.title") }}</h1>
    <p>{{ t("customer.details.photoSkipped") }}</p>
    <label v-if="situationType === 'injured'">
      {{ t("customer.details.kind") }}
      <select v-model="kindKey" required>
        <option disabled value="">
          {{ t("customer.details.kindPlaceholder") }}
        </option>
        <optgroup
          v-for="group in injuredGroups"
          :key="group.key"
          :label="t(`catalog.group.${group.key}`)"
        >
          <option v-for="kind in group.kinds" :key="kind.key" :value="kind.key">
            {{ kind.labelSk }}
          </option>
        </optgroup>
      </select>
      <span class="muted">{{ t("customer.details.kindHelp") }}</span>
    </label>
    <p v-if="selectedKind?.injured" class="muted">
      {{ t("customer.details.flow") }}:
      <code>{{ selectedKind.injured.flowKey }}</code>
    </p>
    <p v-if="error" class="error">{{ t("customer.error") }}: {{ error }}</p>
    <button type="submit" :disabled="pending">
      {{ t("customer.details.continue") }}
    </button>
  </form>
</template>
