<script setup lang="ts">
import { useToggle } from '@vueuse/core'
import { RouterLink } from 'vue-router'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import { scrollbarOptions } from '@/plugins/overlay-scrollbars'
const [expanded, toggle] = useToggle(false)
</script>
<template lang="pug">
main.customer-home(class="mx-auto max-w-3xl space-y-8 px-6 py-12")
  header.customer-home__header(class="space-y-3")
    h1.customer-home__title(class="text-3xl font-semibold") Animal Helper
    p.customer-home__description(class="text-slate-600") Technický základ: Vue, Pug, Tailwind a SVG ikony. Nie finálny dizajn.
  section.customer-home__icons(
    class="flex items-center gap-6 rounded-xl bg-slate-200 p-6",
    aria-label="Ukážka ikon"
  )
    base-icon(
      name="search",
      label="Vyhľadávanie"
    )
    base-icon(
      name="place-on-map",
      label="Poloha na mape",
      class="size-10"
    )
    base-icon(
      name="injured-animal",
      label="Zranené zviera",
      class="size-10"
    )
  button.customer-home__toggle(
    class="rounded-lg bg-blue-700 px-4 py-2 text-white",
    type="button",
    :aria-expanded="expanded",
    aria-controls="demo-details",
    @click="toggle()"
  ) Prepnúť detail
  p#demo-details.customer-home__detail(v-show="expanded") Reaktivita cez VueUse funguje.
  section.customer-home__scroll-demo(class="space-y-3")
    h2(class="text-xl font-semibold") Interné scrollovanie
    OverlayScrollbarsComponent.customer-home__scroll-area(
      class="h-48 overflow-auto rounded-lg border border-slate-300",
      :options="scrollbarOptions",
      :defer="true"
    )
      ul(
        class="space-y-3 p-4",
        tabindex="0",
        aria-label="Ukážkový zoznam"
      )
        li(
          v-for="item in 25",
          :key="item"
        ) Položka {{ item }}
  RouterLink(
    class="text-blue-700 underline",
    to="/missing"
  ) Overiť neznámu stránku
  section.customer-home__long-content(
    class="mt-8 space-y-12",
    aria-label="Ukážka scrollovania stránky"
  )
    p(
      v-for="item in 12",
      :key="item"
    ) Ukážkový obsah {{ item }} — overenie scrollovania a návratu v histórii.
</template>
