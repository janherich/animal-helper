import { computed, shallowRef } from "vue";

import type { Operator, QueueCase } from "./api.js";

const operatorState = shallowRef<Operator | undefined>();
const environmentState = shallowRef("local");
const queueState = shallowRef<readonly QueueCase[]>([]);

export const currentOperator = computed(() => operatorState.value);

export const currentEnvironment = computed(() => environmentState.value);

export const currentQueue = computed(() => queueState.value);

export const rememberOperator = (
  operator: Operator,
  environment = environmentState.value,
): void => {
  operatorState.value = operator;
  environmentState.value = environment;
};

export const rememberQueue = (cases: readonly QueueCase[]): void => {
  queueState.value = cases;
};

export const clearOperator = (): void => {
  operatorState.value = undefined;
  queueState.value = [];
};
