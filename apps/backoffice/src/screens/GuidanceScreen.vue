<script setup lang="ts">
import { computed, ref, watch } from "vue";

import {
  customerWalkableSteps,
  groupKeys,
  guidanceLines,
  kindsForSituation,
  matrixWalkableSteps,
  resolveGuidanceWalk,
  situationKeys,
  type AnimalKind,
  type GroupKey,
  type SituationKey,
} from "@animal-helper/guidance";
import { t } from "@animal-helper/i18n";

import {
  fetchGuidanceKind,
  publishGuidance,
  saveGuidanceCell,
  type AdminError,
  type GuidanceKindResponse,
} from "../api.js";

const situation = ref<SituationKey>("injured");
const groupFilter = ref<GroupKey | "all">("all");
const query = ref("");
const selectedKey = ref<string | undefined>(undefined);
const previewIndex = ref(0);
const editor = ref<GuidanceKindResponse | undefined>(undefined);
const editorError = ref<string | undefined>(undefined);
const editorPending = ref(false);
const publishDescription = ref("");
const publishConfirmed = ref(false);

const kinds = computed(() => kindsForSituation(situation.value));

const visibleKinds = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase("sk");
  return kinds.value.filter((kind) => {
    if (groupFilter.value !== "all" && kind.groupKey !== groupFilter.value) {
      return false;
    }
    if (needle === "") {
      return true;
    }
    const haystack = [
      kind.key,
      kind.labelSk,
      kind.matrix.injuredId,
      kind.matrix.strayId,
      kind.matrix.crueltyId,
      kind.injured?.flowKey,
      kind.cruelty?.flowKey,
    ]
      .filter((value) => value !== undefined)
      .join(" ")
      .toLocaleLowerCase("sk");
    return haystack.includes(needle);
  });
});

const selectedKind = computed(
  () =>
    visibleKinds.value.find((kind) => kind.key === selectedKey.value) ??
    visibleKinds.value[0],
);

watch(situation, () => {
  query.value = "";
  groupFilter.value = "all";
  selectedKey.value = kindsForSituation(situation.value)[0]?.key;
  previewIndex.value = 0;
});

watch(
  visibleKinds,
  (list) => {
    if (list.some((kind) => kind.key === selectedKey.value)) {
      return;
    }
    selectedKey.value = list[0]?.key;
    previewIndex.value = 0;
  },
  { immediate: true },
);

const resolved = computed(() =>
  resolveGuidanceWalk(situation.value, selectedKind.value?.key),
);

const matrixSteps = computed(() =>
  matrixWalkableSteps(situation.value, selectedKind.value?.key),
);

const customerSteps = computed(() =>
  customerWalkableSteps(situation.value, selectedKind.value?.key),
);

const previewStep = computed(() => matrixSteps.value[previewIndex.value]);

const selectKind = (key: string): void => {
  selectedKey.value = key;
  previewIndex.value = 0;
};

const dash = (): string => t("backoffice.guidance.none");

const contentLabel = (kind: AnimalKind): string => {
  if (situation.value === "injured") {
    return kind.injured === undefined
      ? t("backoffice.guidance.content.missing")
      : t("backoffice.guidance.content.ready");
  }
  if (situation.value === "stray") {
    return t("backoffice.guidance.content.stub");
  }
  return kind.cruelty === undefined
    ? t("backoffice.guidance.content.missing")
    : t("backoffice.guidance.content.ready");
};

const flowLabel = (kind: AnimalKind): string => {
  if (situation.value === "injured") {
    return kind.injured?.flowKey ?? dash();
  }
  if (situation.value === "cruelty") {
    return kind.cruelty?.flowKey ?? dash();
  }
  return t("backoffice.guidance.content.stub");
};

const warningLabel = (kind: AnimalKind): string =>
  kind.injured?.warningFrame ?? dash();

const primaryLabel = (kind: AnimalKind): string => {
  if (situation.value === "cruelty") {
    return kind.cruelty?.authorityKey ?? dash();
  }
  return kind.injured?.primaryContact ?? dash();
};

const secondaryLabel = (kind: AnimalKind): string =>
  kind.injured?.secondaryContact ?? dash();

const volunteersLabel = (kind: AnimalKind): string => {
  if (kind.injured?.showVolunteers === undefined) {
    return dash();
  }
  return kind.injured.showVolunteers
    ? t("backoffice.guidance.volunteers.yes")
    : t("backoffice.guidance.volunteers.no");
};

const statusLabel = (status: string): string =>
  t(`backoffice.guidance.status.${status}`);

const previewBack = (): void => {
  previewIndex.value = Math.max(0, previewIndex.value - 1);
};

const previewContinue = (): void => {
  if (matrixSteps.value.length === 0) {
    return;
  }
  previewIndex.value = Math.min(
    matrixSteps.value.length - 1,
    previewIndex.value + 1,
  );
};

const previewRestart = (): void => {
  previewIndex.value = 0;
};

const booleanLabel = (value: boolean | undefined): string => {
  if (value === undefined) {
    return dash();
  }
  return value
    ? t("backoffice.guidance.volunteers.yes")
    : t("backoffice.guidance.volunteers.no");
};

const editorErrorMessage = (error: unknown): string => {
  const code = (error as AdminError).code;
  if (code === "conflict") {
    return t("backoffice.error.guidanceConflict");
  }
  if (code === "invalid_content") {
    return t("backoffice.error.guidanceInvalid");
  }
  return t("backoffice.error.guidance");
};

const loadEditor = async (): Promise<void> => {
  if (situation.value !== "injured" || selectedKind.value === undefined) {
    editor.value = undefined;
    editorError.value = undefined;
    return;
  }
  editorPending.value = true;
  editorError.value = undefined;
  try {
    editor.value = await fetchGuidanceKind(selectedKind.value.key);
  } catch (error) {
    editor.value = undefined;
    editorError.value = editorErrorMessage(error);
  } finally {
    editorPending.value = false;
  }
};

watch(
  [situation, selectedKind],
  () => {
    publishDescription.value = "";
    publishConfirmed.value = false;
    void loadEditor();
  },
  { immediate: true },
);

const previewItems = computed(() => {
  if (editor.value === undefined || previewStep.value === undefined) {
    return [];
  }
  const screenKey = previewStep.value.screenKey;
  return editor.value.items.filter((item) => item.screenKey === screenKey);
});

const saveEditor = async (): Promise<void> => {
  if (editor.value === undefined || selectedKind.value === undefined) {
    return;
  }
  editorPending.value = true;
  editorError.value = undefined;
  try {
    let current = editor.value;
    for (const cell of current.cells) {
      current = await saveGuidanceCell({
        expectedHash: current.contentHash,
        kindKey: selectedKind.value.key,
        instructionKey: cell.instructionKey,
        applicability: cell.applicability,
        copy: cell.copy,
        ...(cell.actionTargetKey === undefined
          ? {}
          : { actionTargetKey: cell.actionTargetKey }),
      });
    }
    editor.value = current;
  } catch (error) {
    editorError.value = editorErrorMessage(error);
    await loadEditor();
  } finally {
    editorPending.value = false;
  }
};

const publishEditor = async (): Promise<void> => {
  if (
    editor.value === undefined ||
    editor.value.source === "bundled" ||
    !publishConfirmed.value
  ) {
    return;
  }
  editorPending.value = true;
  editorError.value = undefined;
  try {
    await publishGuidance({
      expectedHash: editor.value.contentHash,
      description: publishDescription.value,
    });
    await loadEditor();
    publishConfirmed.value = false;
  } catch (error) {
    editorError.value = editorErrorMessage(error);
  } finally {
    editorPending.value = false;
  }
};

const itemBody = (item: { slots: Record<string, string> }): string =>
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
    <h1>{{ t("backoffice.guidance.title") }}</h1>
    <p class="muted">{{ t("backoffice.guidance.help") }}</p>

    <fieldset>
      <label v-for="key in situationKeys" :key="key">
        <input v-model="situation" type="radio" :value="key" />
        {{ t(`backoffice.guidance.situation.${key}`) }}
      </label>
    </fieldset>

    <label>
      {{ t("backoffice.guidance.search") }}
      <input v-model="query" type="search" />
    </label>

    <label>
      {{ t("backoffice.guidance.group.all") }}
      <select v-model="groupFilter">
        <option value="all">{{ t("backoffice.guidance.group.all") }}</option>
        <option v-for="key in groupKeys" :key="key" :value="key">
          {{ t(`catalog.group.${key}`) }}
        </option>
      </select>
    </label>

    <p class="muted">
      {{ t("backoffice.guidance.count") }}: {{ visibleKinds.length }}
    </p>

    <p v-if="visibleKinds.length === 0" class="muted">
      {{ t("backoffice.guidance.empty") }}
    </p>

    <div v-if="visibleKinds.length > 0" class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{{ t("backoffice.guidance.column.label") }}</th>
            <th>{{ t("backoffice.guidance.column.kind") }}</th>
            <th>{{ t("backoffice.guidance.column.flow") }}</th>
            <th>{{ t("backoffice.guidance.column.warning") }}</th>
            <th>{{ t("backoffice.guidance.column.primary") }}</th>
            <th>{{ t("backoffice.guidance.column.secondary") }}</th>
            <th>{{ t("backoffice.guidance.column.volunteers") }}</th>
            <th>{{ t("backoffice.guidance.column.content") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="kind in visibleKinds"
            :key="kind.key"
            :class="{ selected: kind.key === selectedKind?.key }"
            @click="selectKind(kind.key)"
          >
            <td>{{ kind.labelSk }}</td>
            <td>
              <code>{{ kind.key }}</code>
            </td>
            <td>
              <code>{{ flowLabel(kind) }}</code>
            </td>
            <td>
              <code>{{ warningLabel(kind) }}</code>
            </td>
            <td>
              <code>{{ primaryLabel(kind) }}</code>
            </td>
            <td>
              <code>{{ secondaryLabel(kind) }}</code>
            </td>
            <td>{{ volunteersLabel(kind) }}</td>
            <td>{{ contentLabel(kind) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <section v-if="selectedKind" class="detail">
      <h2>{{ selectedKind.labelSk }}</h2>
      <p>
        <code>{{ selectedKind.key }}</code>
        · {{ t(`catalog.group.${selectedKind.groupKey}`) }}
      </p>
      <p class="muted">
        {{ t("backoffice.guidance.matrixIds") }}:
        <code>{{ selectedKind.matrix.injuredId ?? dash() }}</code>
        /
        <code>{{ selectedKind.matrix.strayId ?? dash() }}</code>
        /
        <code>{{ selectedKind.matrix.crueltyId ?? dash() }}</code>
      </p>
      <p v-if="selectedKind.injured">
        {{ t("backoffice.guidance.askConscious") }}:
        {{ booleanLabel(selectedKind.injured.askConscious) }}
        · {{ t("backoffice.guidance.askJuvenile") }}:
        {{ booleanLabel(selectedKind.injured.askJuvenile) }}
      </p>
      <p v-if="resolved.reason === 'stub'" class="muted">
        {{ t("backoffice.guidance.stubHelp") }}
      </p>
      <p v-if="resolved.reason === 'missing_content'" class="muted">
        {{ t("backoffice.guidance.missingHelp") }}
      </p>

      <h3>{{ t("backoffice.guidance.walkTitle") }}</h3>
      <ol v-if="resolved.steps.length > 0" class="walk">
        <li
          v-for="step in resolved.steps"
          :key="step.screenKey"
          :class="{ current: previewStep?.screenKey === step.screenKey }"
        >
          <code>{{ step.screenKey }}</code>
          {{ step.role }}
          · {{ statusLabel(step.status) }}
        </li>
      </ol>

      <h3>{{ t("backoffice.guidance.customerWalkTitle") }}</h3>
      <ol class="walk">
        <li v-for="step in customerSteps" :key="step.path">
          <code>{{ step.path }}</code>
          · {{ step.screenKeys.join(", ") }} · {{ statusLabel(step.status) }}
        </li>
      </ol>

      <h3>{{ t("backoffice.guidance.previewTitle") }}</h3>
      <p v-if="previewStep">
        <strong>
          {{ t("backoffice.guidance.step") }} {{ previewIndex + 1 }} /
          {{ matrixSteps.length }}
        </strong>
      </p>
      <p v-if="previewStep">
        <code>{{ previewStep.screenKey }}</code>
        {{ previewStep.role }}
        · {{ statusLabel(previewStep.status) }}
      </p>
      <p v-if="previewStep" class="muted">
        <code>{{ previewStep.customerPath }}</code>
      </p>
      <p class="preview-actions">
        <button
          type="button"
          :disabled="previewIndex === 0 || matrixSteps.length === 0"
          @click="previewBack"
        >
          {{ t("backoffice.guidance.previewBack") }}
        </button>
        <button
          type="button"
          :disabled="
            matrixSteps.length === 0 || previewIndex >= matrixSteps.length - 1
          "
          @click="previewContinue"
        >
          {{ t("backoffice.guidance.previewContinue") }}
        </button>
        <button type="button" @click="previewRestart">
          {{ t("backoffice.guidance.previewRestart") }}
        </button>
      </p>

      <div v-if="previewItems.length > 0" class="preview-copy">
        <article v-for="item in previewItems" :key="item.instructionKey">
          <p>
            <strong>
              {{ t(`backoffice.guidance.instruction.${item.instructionKey}`) }}
            </strong>
          </p>
          <ul>
            <li v-for="line in guidanceLines(itemBody(item))" :key="line">
              {{ line }}
            </li>
          </ul>
        </article>
      </div>
      <p v-else-if="previewStep" class="muted">
        {{ t("backoffice.guidance.previewEmpty") }}
      </p>

      <section
        v-if="situation === 'injured' && selectedKind?.injured"
        class="editor"
      >
        <h3>{{ t("backoffice.guidance.editorTitle") }}</h3>
        <p class="muted">
          {{ t("backoffice.guidance.editorHelp") }}
          · {{ t("backoffice.guidance.source") }}:
          {{
            t(`backoffice.guidance.sourceLabel.${editor?.source ?? "bundled"}`)
          }}
        </p>
        <p v-if="editorError" class="error">{{ editorError }}</p>
        <fieldset
          v-for="cell in editor?.cells ?? []"
          :key="cell.instructionKey"
          class="cell"
        >
          <legend>
            {{ t(`backoffice.guidance.instruction.${cell.instructionKey}`) }}
            <template v-if="cell.screenKey">
              · <code>{{ cell.screenKey }}</code>
            </template>
            <template v-else>
              · {{ t("backoffice.guidance.notInFlow") }}
            </template>
          </legend>
          <label>
            <input
              v-model="cell.applicability"
              type="checkbox"
              true-value="on"
              false-value="off"
            />
            {{ t("backoffice.guidance.applies") }}
          </label>
          <p v-if="cell.actionTargetKey" class="muted">
            {{ t("backoffice.guidance.contactKey") }}:
            <code>{{ cell.actionTargetKey }}</code>
          </p>
          <label v-for="slot in cell.slotKeys" :key="slot">
            {{ t(`backoffice.guidance.slot.${slot}`) }}
            <textarea v-model="cell.copy[slot]" rows="4"></textarea>
          </label>
        </fieldset>
        <p class="preview-actions">
          <button
            type="button"
            :disabled="editorPending || editor === undefined"
            @click="saveEditor"
          >
            {{ t("backoffice.guidance.save") }}
          </button>
        </p>
        <label>
          {{ t("backoffice.guidance.publishDescription") }}
          <input v-model="publishDescription" type="text" maxlength="500" />
        </label>
        <label>
          <input v-model="publishConfirmed" type="checkbox" />
          {{ t("backoffice.guidance.publishConfirm") }}
        </label>
        <button
          type="button"
          :disabled="
            editorPending ||
            editor === undefined ||
            editor.source === 'bundled' ||
            !publishConfirmed ||
            publishDescription.trim() === ''
          "
          @click="publishEditor"
        >
          {{ t("backoffice.guidance.publish") }}
        </button>
      </section>
    </section>
  </section>
</template>
