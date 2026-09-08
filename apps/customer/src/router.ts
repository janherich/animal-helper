import { createRouter, createWebHistory } from "vue-router";

import { isCustomerWalkablePath, isScreenKey } from "@animal-helper/guidance";

import ContactScreen from "./screens/ContactScreen.vue";
import DetailsScreen from "./screens/DetailsScreen.vue";
import GuideScreen from "./screens/GuideScreen.vue";
import LocationScreen from "./screens/LocationScreen.vue";
import PhotoScreen from "./screens/PhotoScreen.vue";
import SituationScreen from "./screens/SituationScreen.vue";
import ThankYouScreen from "./screens/ThankYouScreen.vue";
import { PHOTO_PATH } from "./photo.js";
import {
  currentKindKey,
  currentSituationType,
  currentSnapshot,
} from "./runtime.js";
import { CUSTOMER_PATHS } from "./walk.js";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: CUSTOMER_PATHS.situation,
      name: "situation",
      component: SituationScreen,
    },
    {
      path: CUSTOMER_PATHS.location,
      name: "location",
      component: LocationScreen,
    },
    {
      path: PHOTO_PATH,
      name: "photo",
      component: PhotoScreen,
    },
    {
      path: CUSTOMER_PATHS.details,
      name: "details",
      component: DetailsScreen,
    },
    {
      path: CUSTOMER_PATHS.contact,
      name: "contact",
      component: ContactScreen,
    },
    {
      path: CUSTOMER_PATHS.thanks,
      name: "thanks",
      component: ThankYouScreen,
    },
    {
      path: "/:screenKey",
      name: "guide",
      component: GuideScreen,
    },
    { path: "/", redirect: CUSTOMER_PATHS.situation },
    { path: "/:pathMatch(.*)*", redirect: CUSTOMER_PATHS.situation },
  ],
});

router.beforeEach((to) => {
  if (to.name === "situation") {
    return true;
  }

  if (currentSnapshot() === undefined) {
    return { name: "situation" };
  }

  if (to.name === "guide") {
    const screenKey = to.params.screenKey;
    if (typeof screenKey !== "string" || !isScreenKey(screenKey)) {
      return { name: "situation" };
    }
    if (
      !isCustomerWalkablePath(to.path, currentSituationType(), currentKindKey())
    ) {
      return { name: "details" };
    }
  }

  return true;
});
