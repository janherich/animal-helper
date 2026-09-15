<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import { t } from "@animal-helper/i18n";

import compassIcon from "../assets/location/compass.svg";
import locateIcon from "../assets/location/locate.svg";
import mapImage from "../assets/location/map.png";
import pinIcon from "../assets/location/pin.svg";
import WalkProgress from "../components/WalkProgress.vue";
import { LOCATION_WALK_STEP } from "../location.js";
import { continueWalkTo } from "../navigation.js";
import {
  customerSession,
  patchWalkFacts,
  rememberSnapshot,
} from "../runtime.js";
import {
  CUSTOMER_PATHS,
  confirmLocation,
  defaultLocationPayload,
} from "../walk.js";

const router = useRouter();
const error = ref<string | undefined>(undefined);
const pending = ref(false);

const goBack = async () => {
  await router.push(CUSTOMER_PATHS.situation);
};

const continueWalk = async () => {
  pending.value = true;
  error.value = undefined;
  const result = await confirmLocation(
    customerSession(),
    defaultLocationPayload(),
  );
  pending.value = false;
  if (!result.ok) {
    error.value = `${t("customer.error")}: ${result.error.code}`;
    return;
  }

  rememberSnapshot(result.value);
  patchWalkFacts({ hasLocation: true });
  const continued = await continueWalkTo(router, CUSTOMER_PATHS.location);
  if (!continued) {
    error.value = t("customer.error");
  }
};
</script>

<template>
  <form class="location" @submit.prevent="continueWalk">
    <div class="body">
      <div class="chrome">
        <WalkProgress :current="LOCATION_WALK_STEP" />
        <button type="button" class="back" @click="goBack">
          {{ t("customer.location.back") }}
        </button>
      </div>

      <div class="intro">
        <h1>{{ t("customer.location.title") }}</h1>
        <p class="help">{{ t("customer.location.help") }}</p>
      </div>

      <div class="address-row">
        <div class="field">
          <span>{{ t("customer.location.addressLabel") }}</span>
          <div class="input-wrap">
            <span>{{ t("customer.location.addressPlaceholder") }}</span>
          </div>
        </div>
        <div class="locate" aria-hidden="true">
          <img :src="locateIcon" alt="" width="16" height="16" />
        </div>
      </div>

      <div class="map-block">
        <p class="map-label">{{ t("customer.location.mapLabel") }}</p>
        <div class="map">
          <img
            class="map-image"
            :src="mapImage"
            alt=""
            width="370"
            height="437"
          />
          <p class="hint">
            <img :src="pinIcon" alt="" width="16" height="16" />
            <span>{{ t("customer.location.mapHint") }}</span>
          </p>
          <div class="compass" aria-hidden="true">
            <img :src="compassIcon" alt="" width="14" height="14" />
          </div>
        </div>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <div class="footer">
      <button type="submit" class="btn" :disabled="pending">
        {{ t("customer.location.confirm") }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.location {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 72px);
}

.body {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  gap: 24px;
  padding: 16px 16px 24px;
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

.address-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.field {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
}

.field > span:first-child,
.map-label {
  color: var(--color-body);
  font-family: var(--font-button);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;
  line-height: 16px;
}

.input-wrap {
  display: flex;
  align-items: center;
  height: 42px;
  margin-top: 8px;
  padding: 0 16px;
  background: var(--color-footer);
  color: var(--color-muted);
  font-family: var(--font-button);
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.2px;
  line-height: 20px;
}

.locate img,
.compass img,
.hint img {
  display: block;
  flex-shrink: 0;
}

.locate img,
.hint img {
  width: 16px;
  height: 16px;
}

.compass img {
  width: 14px;
  height: 14px;
}

.locate {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: var(--color-footer);
}

.map-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.map {
  position: relative;
  height: 437px;
  overflow: hidden;
}

.map-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hint {
  position: absolute;
  top: 164px;
  left: 50%;
  display: flex;
  gap: 8px;
  align-items: center;
  width: max-content;
  max-width: calc(100% - 32px);
  margin: 0;
  padding: 11px 17px;
  border: 1px solid #f3f4f6;
  border-radius: 14px;
  background: rgb(255 255 255 / 85%);
  box-shadow:
    0 1px 3px rgb(0 0 0 / 10%),
    0 1px 2px rgb(0 0 0 / 10%);
  color: #4a5565;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.0762px;
  line-height: 19.5px;
  transform: translateX(-50%);
}

.compass {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-white);
  box-shadow:
    0 4px 3px rgb(0 0 0 / 10%),
    0 2px 2px rgb(0 0 0 / 10%);
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
