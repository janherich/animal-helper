<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import { t } from "@animal-helper/i18n";

import cameraIcon from "../assets/photo/camera.png";
import WalkProgress from "../components/WalkProgress.vue";
import { continueWalkTo } from "../navigation.js";
import { PHOTO_WALK_STEP } from "../photo.js";
import { CUSTOMER_PATHS } from "../walk.js";

const router = useRouter();
const error = ref<string | undefined>(undefined);
const pending = ref(false);

const goBack = async () => {
  await router.push(CUSTOMER_PATHS.location);
};

const skipPhoto = async () => {
  pending.value = true;
  error.value = undefined;
  const continued = await continueWalkTo(router, CUSTOMER_PATHS.location);
  pending.value = false;
  if (!continued) {
    error.value = t("customer.error");
  }
};
</script>

<template>
  <form class="photo" @submit.prevent="skipPhoto">
    <div class="body">
      <div class="chrome">
        <WalkProgress :current="PHOTO_WALK_STEP" />
        <button type="button" class="back" @click="goBack">
          {{ t("customer.photo.back") }}
        </button>
      </div>

      <div class="intro">
        <h1>{{ t("customer.photo.title") }}</h1>
        <p class="help">{{ t("customer.photo.help") }}</p>
      </div>

      <div class="upload" aria-hidden="true">
        <p class="upload-lead">{{ t("customer.photo.uploadLead") }}</p>
        <img class="camera" :src="cameraIcon" alt="" width="52" height="52" />
        <span class="mock-btn">{{ t("customer.photo.gallery") }}</span>
        <span class="mock-btn">{{ t("customer.photo.camera") }}</span>
        <p class="limit">{{ t("customer.photo.limit") }}</p>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <div class="footer">
      <button type="submit" class="skip" :disabled="pending">
        {{ t("customer.photo.skip") }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.photo {
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

.upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 27px 16px 16px;
  background: rgb(60 100 177 / 6%);
  border: 1px dashed var(--color-accent);
}

.upload-lead,
.limit {
  margin: 0;
  color: var(--color-body);
  font-family: var(--font-button);
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.1px;
  line-height: 16px;
  text-align: center;
}

.camera {
  display: block;
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.mock-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 191px;
  height: 40px;
  padding: 0 18px;
  background: var(--color-accent);
  color: var(--color-white);
  font-family: var(--font-button);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
  line-height: 18px;
  text-align: center;
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

.skip {
  width: 100%;
  height: 48px;
  padding: 0 18px;
  border: 1px solid var(--color-divider);
  border-radius: 0;
  appearance: none;
  background: var(--color-white);
  color: var(--color-body);
  font-family: var(--font-button);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
  line-height: 21px;
  cursor: pointer;
}

.skip:disabled {
  cursor: wait;
  opacity: 0.7;
}
</style>
