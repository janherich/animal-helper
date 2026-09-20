<script setup lang="ts">
import search from '@/assets/brand/processing-search.svg'
import eye from '@/assets/brand/processing-eye.svg'
import pupil from '@/assets/brand/processing-pupil.svg'

defineProps<{ title: string; preview?: string }>()
</script>

<template lang="pug">
section.customer-processing(class="flex flex-1 flex-col items-center justify-center px-5 py-12 text-center")
  .customer-processing__graphic(
    class="relative size-[120px] shrink-0 overflow-hidden",
    aria-hidden="true"
  )
    div(class="absolute inset-[15%_13.33%_14.17%_15%]")
      img(
        :src="search",
        alt="",
        class="size-full"
      )
    div(class="absolute top-7 left-[23.33%] size-12 overflow-hidden")
      div(class="absolute inset-[18.75%_7.52%_22.92%_7.52%]")
        img(
          :src="eye",
          alt="",
          class="size-full"
        )
      .customer-processing__pupil(class="absolute inset-[31.25%_33.01%_34.77%_33.01%]")
        img(
          :src="pupil",
          alt="",
          class="size-full"
        )
  h1(
    class="pt-5 pb-3 text-heading-1",
    aria-live="polite"
  ) {{ title }}
</template>

<style scoped>
.customer-processing__pupil {
  animation: processing-look 2.4s ease-in-out infinite;
}
@keyframes processing-look {
  0%,
  15%,
  100% {
    transform: translateX(-7px);
  }
  45%,
  60% {
    transform: translateX(7px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .customer-processing__pupil {
    animation: none;
  }
}
</style>
