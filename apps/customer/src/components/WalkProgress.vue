<script setup lang="ts">
import { DRAFT_WALK_STEPS, formatWalkStep } from "../situation.js";

defineProps<{
  current: number;
}>();
</script>

<template>
  <div class="walk-progress">
    <div class="track">
      <div
        class="fill"
        :style="{ width: `${(current / DRAFT_WALK_STEPS) * 100}%` }"
      ></div>
    </div>
    <p>{{ formatWalkStep(current) }}</p>
  </div>
</template>

<style scoped>
.walk-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.track {
  width: 100%;
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

p {
  margin: 0;
  color: var(--color-muted);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}
</style>
