<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import {
  customerWalkableSteps,
  guidanceLines,
  itemsForScreens,
  type GuidanceItem,
  type PublicGuidance,
} from "@animal-helper/guidance";
import { t } from "@animal-helper/i18n";

import { continueWalkTo } from "../navigation.js";
import {
  currentKindKey,
  currentSituationType,
  loadPublicGuidance,
} from "../runtime.js";

const route = useRoute();
const router = useRouter();
const payload = ref<PublicGuidance | undefined>(undefined);

const steps = computed(() =>
  customerWalkableSteps(currentSituationType(), currentKindKey()),
);
const index = computed(() =>
  steps.value.findIndex((step) => step.path === route.path),
);
const screenKeys = computed(() => steps.value[index.value]?.screenKeys ?? []);

const items = computed(() => {
  const kindKey = currentKindKey();
  if (payload.value === undefined || kindKey === undefined) {
    return [];
  }
  const kindItems = payload.value.kinds[kindKey]?.items ?? [];
  return itemsForScreens(kindItems, screenKeys.value);
});

onMounted(() => {
  void loadPublicGuidance().then((value) => {
    payload.value = value;
  });
});

const continueWalk = async () => {
  await continueWalkTo(router, route.path);
};

const itemTitle = (item: GuidanceItem): string | undefined =>
  item.slots["contact.primary.title"] ?? item.slots["contact.secondary.title"];

const itemBody = (item: GuidanceItem): string =>
  item.slots["warning.do_not"] ??
  item.slots["warning.do_before"] ??
  item.slots["contact.primary.body"] ??
  item.slots["contact.secondary.body"] ??
  item.slots["volunteers.body"] ??
  item.slots["self_help.intro"] ??
  "";
</script>

<template>
  <section>
    <h1>{{ t("customer.guide.title") }}</h1>
    <p class="muted">
      {{ t("customer.guide.step") }}
      <template v-if="index >= 0">
        {{ index + 1 }} / {{ steps.length }}</template
      >
    </p>

    <p v-if="payload === undefined" class="muted">
      {{ t("customer.guide.loading") }}
    </p>

    <p v-else-if="items.length === 0" class="muted">
      {{ t("customer.guide.empty") }}
    </p>

    <article
      v-for="item in items"
      :key="item.instructionKey"
      class="advice"
      :class="item.polarity"
    >
      <p class="muted">{{ t(`customer.guide.polarity.${item.polarity}`) }}</p>
      <h2 v-if="itemTitle(item)">{{ itemTitle(item) }}</h2>
      <ul v-if="guidanceLines(itemBody(item)).length > 0">
        <li v-for="line in guidanceLines(itemBody(item))" :key="line">
          {{ line }}
        </li>
      </ul>
      <p v-if="item.action" class="muted">
        {{ t("customer.guide.contactKey") }}:
        <code>{{ item.action.targetKey }}</code>
      </p>
    </article>

    <button type="button" @click="continueWalk">
      {{ t("customer.guide.continue") }}
    </button>
  </section>
</template>
