import { createRouter, createWebHistory } from "vue-router";

import ContactScreen from "./screens/ContactScreen.vue";
import DetailsScreen from "./screens/DetailsScreen.vue";
import LocationScreen from "./screens/LocationScreen.vue";
import SituationScreen from "./screens/SituationScreen.vue";
import ThankYouScreen from "./screens/ThankYouScreen.vue";
import { currentSnapshot } from "./runtime.js";
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

  return true;
});
