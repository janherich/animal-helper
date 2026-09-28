<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import { findAnimalKind } from "@animal-helper/guidance";
import { t } from "@animal-helper/i18n";

import { fetchCases, type AdminCaseSummary } from "../api.js";

const error = ref<string | undefined>();
const pending = ref(false);
const cases = ref<readonly AdminCaseSummary[]>([]);
const query = ref("");
const mode = ref("all");

onMounted(() => {
  void refresh();
});

const refresh = async () => {
  pending.value = true;
  error.value = undefined;
  try {
    cases.value = (await fetchCases()).cases;
  } catch {
    error.value = t("backoffice.error.queue");
  } finally {
    pending.value = false;
  }
};

const species = (key: string): string =>
  key === ""
    ? t("backoffice.case.none")
    : (findAnimalKind(key)?.labelSk ?? key);

const situation = (value: string): string => {
  switch (value) {
    case "injured":
    case "stray":
    case "dead":
    case "cruelty":
    case "other":
      return t(`backoffice.queue.situation.${value}`);
    default:
      return value === "" ? t("backoffice.case.none") : value;
  }
};

const dueNow = (item: AdminCaseSummary): boolean => {
  if (item.deadline === "") {
    return false;
  }
  return new Date(item.deadline).getTime() <= Date.now();
};

const counters = computed(() => ({
  active: cases.value.filter((item) => item.mode === "active").length,
  needs: cases.value.filter((item) => item.mode === "review").length,
  unread: cases.value.filter((item) => item.unread).length,
  due: cases.value.filter(dueNow).length,
  waiting: cases.value.filter((item) => item.waitingOnAuthority).length,
}));

const visible = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase("sk");
  return cases.value.filter((item) => {
    if (mode.value === "active" && item.mode !== "active") {
      return false;
    }
    if (mode.value === "review" && item.mode !== "review") {
      return false;
    }
    if (mode.value === "unread" && !item.unread) {
      return false;
    }
    if (mode.value === "due" && !dueNow(item)) {
      return false;
    }
    if (mode.value === "waiting" && !item.waitingOnAuthority) {
      return false;
    }
    if (needle === "") {
      return true;
    }
    return [
      item.caseNumber,
      item.speciesKey,
      species(item.speciesKey),
      item.address,
      item.nextStep,
      situation(item.situationType),
    ]
      .join(" ")
      .toLocaleLowerCase("sk")
      .includes(needle);
  });
});
</script>

<template>
  <section>
    <h1>{{ t("backoffice.queue.title") }}</h1>
    <p class="muted">{{ t("backoffice.queue.help") }}</p>
    <p v-if="error" class="error">{{ error }}</p>
    <div class="counters">
      <button type="button" @click="mode = 'all'">
        {{ t("backoffice.queue.all") }} {{ cases.length }}
      </button>
      <button type="button" @click="mode = 'active'">
        {{ t("backoffice.queue.active") }} {{ counters.active }}
      </button>
      <button type="button" @click="mode = 'review'">
        {{ t("backoffice.queue.needsAdmin") }} {{ counters.needs }}
      </button>
      <button type="button" @click="mode = 'unread'">
        {{ t("backoffice.queue.unread") }} {{ counters.unread }}
      </button>
      <button type="button" @click="mode = 'due'">
        {{ t("backoffice.queue.due") }} {{ counters.due }}
      </button>
      <button type="button" @click="mode = 'waiting'">
        {{ t("backoffice.queue.waiting") }} {{ counters.waiting }}
      </button>
    </div>
    <input
      v-model="query"
      type="search"
      :placeholder="t('backoffice.queue.search')"
    />
    <p v-if="visible.length === 0 && !pending" class="muted">
      {{ t("backoffice.queue.empty") }}
    </p>
    <table v-if="visible.length > 0">
      <thead>
        <tr>
          <th></th>
          <th>{{ t("backoffice.queue.case") }}</th>
          <th>{{ t("backoffice.queue.received") }}</th>
          <th>{{ t("backoffice.queue.type") }}</th>
          <th>{{ t("backoffice.queue.animal") }}</th>
          <th>{{ t("backoffice.queue.place") }}</th>
          <th>{{ t("backoffice.queue.progress") }}</th>
          <th>{{ t("backoffice.queue.status") }}</th>
          <th>{{ t("backoffice.queue.owner") }}</th>
          <th>{{ t("backoffice.queue.deadline") }}</th>
          <th>{{ t("backoffice.queue.next") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in visible" :key="item.streamId">
          <td>{{ item.unread ? "●" : "" }}</td>
          <td>
            <RouterLink
              :to="{ name: 'case', params: { streamId: item.streamId } }"
            >
              {{ item.caseNumber }}
            </RouterLink>
          </td>
          <td>{{ new Date(item.createdAt).toLocaleString("sk-SK") }}</td>
          <td>{{ situation(item.situationType) }}</td>
          <td>{{ species(item.speciesKey) }}</td>
          <td>{{ item.address || t("backoffice.case.none") }}</td>
          <td>
            {{
              t(
                `backoffice.queue.${item.workflowState === "in_review" ? "inReview" : item.workflowState}`,
              )
            }}
          </td>
          <td>{{ t(`backoffice.queue.mode.${item.mode}`) }}</td>
          <td>{{ item.ownerEmail || t("backoffice.case.none") }}</td>
          <td :class="{ overdue: dueNow(item) }">
            {{
              item.deadline === ""
                ? t("backoffice.case.none")
                : new Date(item.deadline).toLocaleString("sk-SK")
            }}
          </td>
          <td>{{ item.nextStep || t("backoffice.case.none") }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.counters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.overdue {
  color: #9d1c1c;
  font-weight: 600;
}
</style>
