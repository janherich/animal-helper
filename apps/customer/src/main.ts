import { t } from "@animal-helper/i18n";
import { createApp } from "vue";

import App from "./App.vue";
import { router } from "./router.js";

document.title = t("customer.appName");

createApp(App).use(router).mount("#app");
