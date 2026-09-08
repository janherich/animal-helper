<script setup lang="ts">
import { onMounted, ref } from "vue";

import { t } from "@animal-helper/i18n";

import { currentQueue, rememberQueue } from "../runtime.js";
import { loadQueue } from "../session.js";

const error = ref<string | undefined>(undefined);
const pending = ref(false);
const queue = currentQueue;

onMounted(() => {
  void refresh();
});

const refresh = async () => {
  pending.value = true;
  error.value = undefined;
  try {
    rememberQueue(await loadQueue());
  } catch {
    error.value = t("backoffice.error.queue");
  } finally {
    pending.value = false;
  }
};

const workflowLabel = (state: string): string => {
  switch (state) {
    case "draft":
      return t("backoffice.queue.draft");
    case "submitted":
      return t("backoffice.queue.submitted");
    case "in_review":
      return t("backoffice.queue.inReview");
    case "completed":
      return t("backoffice.queue.completed");
    case "expired":
      return t("backoffice.queue.expired");
    default:
      return state;
  }
};
</script>

<template>
  <section>
    <h1>{{ t("backoffice.queue.title") }}</h1>
    <p class="muted">{{ t("backoffice.queue.help") }}</p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="queue.length === 0 && !pending" class="muted">
      {{ t("backoffice.queue.empty") }}
    </p>
    <table v-if="queue.length > 0">
      <thead>
        <tr>
          <th>{{ t("backoffice.queue.case") }}</th>
          <th>{{ t("backoffice.queue.state") }}</th>
          <th>{{ t("backoffice.queue.updated") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in queue" :key="item.streamId">
          <td>
            <code>{{ item.streamId }}</code>
          </td>
          <td>{{ workflowLabel(item.workflowState) }}</td>
          <td>{{ new Date(item.updatedAt).toLocaleString("sk-SK") }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
