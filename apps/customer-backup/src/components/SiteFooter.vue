<script setup lang="ts">
import { ref } from "vue";

import { t } from "@animal-helper/i18n";

import chevronDown from "../assets/icons/chevron-down.svg";
import chevronRight from "../assets/icons/chevron-right.svg";
import chevronRightAccent from "../assets/icons/chevron-right-accent.svg";
import facebook from "../assets/icons/facebook.svg";
import globe from "../assets/icons/globe.svg";
import instagram from "../assets/icons/instagram.svg";
import mail from "../assets/icons/mail.svg";
import pin from "../assets/icons/pin.svg";
import tiktok from "../assets/icons/tiktok.svg";

const open = ref({
  faq: true,
  contact: false,
  legal: false,
});

const toggle = (section: keyof typeof open.value) => {
  open.value = { ...open.value, [section]: !open.value[section] };
};

const faqItems = [
  "customer.chrome.faqCatch",
  "customer.chrome.faqCost",
  "customer.chrome.faqBird",
] as const;

const legalItems = [
  "customer.chrome.legalGdpr",
  "customer.chrome.legalTerms",
  "customer.chrome.legalCookies",
] as const;
</script>

<template>
  <footer class="site-footer">
    <div class="brand">
      <div class="brand-row">
        <span class="paw">{{ t("customer.chrome.paw") }}</span>
        <p class="brand-name">{{ t("customer.chrome.brand") }}</p>
      </div>
      <p class="tagline">{{ t("customer.chrome.tagline") }}</p>
    </div>

    <section id="situation-faq" class="accordion">
      <h2>
        <button
          type="button"
          :aria-expanded="open.faq"
          aria-controls="situation-faq-panel"
          @click="toggle('faq')"
        >
          <span>{{ t("customer.chrome.faq") }}</span>
          <img
            :src="chevronDown"
            alt=""
            width="20"
            height="20"
            :class="{ rotated: open.faq }"
          />
        </button>
      </h2>
      <div v-if="open.faq" id="situation-faq-panel" class="panel">
        <a
          v-for="item in faqItems"
          :key="item"
          class="row"
          :href="t('customer.chrome.faqAllUrl')"
          rel="noreferrer"
          target="_blank"
        >
          <span class="row-icon">
            <img :src="chevronRightAccent" alt="" width="16" height="16" />
          </span>
          <span>{{ t(item) }}</span>
        </a>
        <a
          class="faq-all"
          :href="t('customer.chrome.faqAllUrl')"
          rel="noreferrer"
          target="_blank"
        >
          {{ t("customer.chrome.faqAll") }}
        </a>
      </div>
    </section>

    <section id="situation-contact" class="accordion">
      <h2>
        <button
          type="button"
          :aria-expanded="open.contact"
          aria-controls="situation-contact-panel"
          @click="toggle('contact')"
        >
          <span>{{ t("customer.chrome.contact") }}</span>
          <img
            :src="chevronDown"
            alt=""
            width="20"
            height="20"
            :class="{ rotated: open.contact }"
          />
        </button>
      </h2>
      <div
        v-if="open.contact"
        id="situation-contact-panel"
        class="panel contact"
      >
        <p class="org">{{ t("customer.chrome.orgName") }}</p>
        <p class="row start">
          <span class="row-icon">
            <img :src="pin" alt="" width="16" height="16" />
          </span>
          <span>{{ t("customer.chrome.address") }}</span>
        </p>
        <a
          class="row"
          :href="`mailto:${t('customer.chrome.email')}`"
          rel="noreferrer"
        >
          <img :src="mail" alt="" width="16" height="16" />
          <span>{{ t("customer.chrome.email") }}</span>
        </a>
        <a
          class="row"
          :href="t('customer.chrome.websiteUrl')"
          rel="noreferrer"
          target="_blank"
        >
          <img :src="globe" alt="" width="16" height="16" />
          <span>{{ t("customer.chrome.websiteLabel") }}</span>
        </a>
      </div>
    </section>

    <section id="situation-legal" class="accordion">
      <h2>
        <button
          type="button"
          :aria-expanded="open.legal"
          aria-controls="situation-legal-panel"
          @click="toggle('legal')"
        >
          <span>{{ t("customer.chrome.legal") }}</span>
          <img
            :src="chevronDown"
            alt=""
            width="20"
            height="20"
            :class="{ rotated: open.legal }"
          />
        </button>
      </h2>
      <div v-if="open.legal" id="situation-legal-panel" class="panel">
        <a
          v-for="item in legalItems"
          :key="item"
          class="row"
          :href="t('customer.chrome.websiteUrl')"
          rel="noreferrer"
          target="_blank"
        >
          <img :src="chevronRight" alt="" width="16" height="16" />
          <span>{{ t(item) }}</span>
        </a>
      </div>
    </section>

    <div class="social">
      <div class="social-row">
        <span class="social-icon" :title="t('customer.chrome.facebook')">
          <img :src="facebook" alt="" width="16" height="16" />
          <span class="visually-hidden">{{
            t("customer.chrome.facebook")
          }}</span>
        </span>
        <span class="social-icon" :title="t('customer.chrome.instagram')">
          <img :src="instagram" alt="" width="16" height="16" />
          <span class="visually-hidden">{{
            t("customer.chrome.instagram")
          }}</span>
        </span>
        <span class="social-icon" :title="t('customer.chrome.tiktok')">
          <img :src="tiktok" alt="" width="16" height="16" />
          <span class="visually-hidden">{{ t("customer.chrome.tiktok") }}</span>
        </span>
      </div>
      <p class="copyright">{{ t("customer.chrome.copyright") }}</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--color-footer);
  border-top: 1px solid var(--color-divider);
}

.brand {
  padding: 20px 16px 17px;
  border-bottom: 1px solid var(--color-divider);
}

.brand-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.paw {
  color: #0a0a0a;
  font-size: 20px;
  letter-spacing: -0.4492px;
  line-height: 30px;
}

.brand-name {
  margin: 0;
  color: var(--color-accent);
  font-family: var(--font-button);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.1px;
  line-height: 24px;
}

.tagline {
  margin: 4px 0 0;
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
}

.accordion {
  border-bottom: 1px solid var(--color-divider);
}

.accordion h2 {
  margin: 0;
}

.accordion h2 button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  width: 100%;
  padding: 16px;
  border: 0;
  border-radius: 0;
  appearance: none;
  background: transparent;
  color: var(--color-body);
  font-family: var(--font-button);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.1px;
  line-height: 22.5px;
  text-align: left;
  cursor: pointer;
}

.accordion h2 button > img {
  display: block;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.accordion h2 button > img.rotated {
  transform: rotate(180deg);
}

.panel {
  display: flex;
  flex-direction: column;
  padding: 0 16px 16px;
}

.row {
  display: flex;
  gap: 8px;
  align-items: center;
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 500;
  line-height: 19px;
  text-decoration: none;
}

.row + .row {
  margin-top: 12px;
}

.row.start {
  align-items: flex-start;
}

.row img,
.row-icon img {
  display: block;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.row-icon {
  display: flex;
  padding-top: 2px;
}

.contact .org {
  margin: 0 0 12px;
  color: var(--color-body);
  font-family: var(--font-button);
  font-size: 14px;
  font-weight: 700;
  line-height: 21px;
}

.contact .row {
  font-weight: 400;
}

.contact a {
  color: var(--color-accent);
}

.faq-all {
  margin-top: 12px;
  color: var(--color-accent);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  text-decoration: underline;
  text-underline-position: from-font;
}

.social {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--color-social);
}

.social-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 32px;
  height: 32px;
  border: 1px solid #c3cbcd;
  border-radius: 50%;
  background: var(--color-white);
}

.social-icon img {
  display: block;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.copyright {
  margin: 0;
  color: var(--color-muted);
  font-size: 11px;
  font-weight: 400;
  line-height: 16px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
</style>
